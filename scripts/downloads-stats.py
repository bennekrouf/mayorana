#!/usr/bin/env python3
"""Aggregate product download counts from the nginx access log.

nginx keeps roughly two weeks of logs before logrotate discards them, so a
count taken only at read time can never reach further back than that. This
runs nightly and folds each day's total into a cumulative state file that
outlives the logs it was derived from.

Re-running is safe: results are keyed by date, and a day still present in the
logs is recomputed rather than added to. That also means a day is only final
once it has rotated out — a run mid-day records a partial count and the next
run corrects it.

Usage statistics from the apps arrive in the same log: an app whose user said
yes GETs /ping?b=<base64url JSON> and gets a 204. Those requests are decoded
here and rolled up per day — see parse_usage. Nothing is stored per install.

Country attribution is optional and offline: point --geoip at a MaxMind-format
country database (DB-IP publish a free one) and install python3-maxminddb. No
addresses are stored — only the per-country totals they roll up into.

Usage:
    downloads-stats.py [--state PATH] [--out PATH] [--logs GLOB ...]
                       [--geoip PATH] [--dry-run] [--reset]
"""

from __future__ import annotations

import argparse
import base64
import gzip
import ipaddress
import json
import os
import re
import sys
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from glob import glob
from urllib.parse import unquote_plus

try:  # Optional: country attribution is skipped cleanly when absent.
    import maxminddb
except ImportError:
    maxminddb = None

# nginx "combined": addr - user [time] "request" status bytes "referer" "ua"
LINE = re.compile(
    r'^(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] '
    r'"(?P<method>[A-Z]+) (?P<path>[^" ]*)[^"]*" '
    r'(?P<status>\d{3}) \S+ "(?P<referer>[^"]*)" "(?P<ua>[^"]*)"'
)

# /downloads/<app>/<version>/<file>
DOWNLOAD = re.compile(r'^/downloads/(?P<app>[^/]+)/(?P<version>[^/]+)/(?P<file>[^/?]+)')

# Only real installables. latest.json is polled by every running copy on a
# timer, so counting it would measure uptime, not downloads; .sha256 is a
# side-fetch of a download already counted.
ARTIFACT = re.compile(r'\.(dmg|exe|msi|tar\.gz|zip|deb)$', re.I)

PLATFORM = [
    ('macos', re.compile(r'\.dmg$', re.I)),
    ('windows', re.compile(r'\.(exe|msi)$', re.I)),
    ('linux', re.compile(r'\.(tar\.gz|deb)$', re.I)),
]

# Crawlers that announce themselves.
BOT = re.compile(
    r'bot|crawl|spider|slurp|curl/|wget|python-requests|scrapy|headless|'
    r'monitoring|uptime|pingdom|semrush|ahrefs|facebookexternalhit',
    re.I,
)

# The banner in each app appends this to the download URL. It is on the URL
# rather than the User-Agent because the banner opens the link in the user's
# browser — the updater's own agent never fetches the file.
FROM_UPDATER = re.compile(r'[?&]src=updater(&|$)', re.I)

# The site appends this when the person downloading is signed in. A download
# taken anonymously is still a download; this only says how many of them we
# can reach afterwards, which is the funnel the founding-users offer is
# measured on.
FROM_MEMBER = re.compile(r'[?&]src=member(&|$)', re.I)

# Which channel first brought this person to the site, put on the download URL
# by src/lib/attribution.ts. The log's own Referer for a download is always one
# of our own pages, so without this the answer would only ever be "they clicked
# from /apps". Absent on updater traffic — an app checking for a new build did
# not come from anywhere — and on any download predating the tagging.
UTM_SOURCE = re.compile(r'[?&]utm_source=([^&]+)', re.I)
UTM_MEDIUM = re.compile(r'[?&]utm_medium=([^&]+)', re.I)

# Set by the updater on its latest.json poll. Not a download, but counting it
# separately answers a more useful question: how many installs are running.
UPDATER_UA = re.compile(r'\(updater\)', re.I)

# ── App usage statistics ─────────────────────────────────────────────────
# GET /ping?b=<base64url JSON> — see setup-vps.sh. The URL is public, so
# anyone can send anything; a request only counts if it has the app's
# telemetry User-Agent and a payload of exactly the expected shape.
PING_PATH = '/ping'
TELEMETRY_UA = re.compile(r'\(telemetry\)', re.I)
INSTALL_ID = re.compile(r'^[0-9a-f]{32}$')
TAG = re.compile(r'^[a-z0-9_.-]{1,40}$')
PING_SCHEMA = 1
MAX_EVENTS_PER_PING = 200           # matches the app's MAX_BATCH

# Where a page visit came from. Only the host is kept — a full referring URL
# can carry a search query or a session id, and the question is "which site
# sent them", not "which page". Own-site and empty referers are not sources.
def referrer_host(referer: str, own_hosts: tuple[str, ...]) -> str | None:
    if not referer or referer == '-':
        return None
    match = re.match(r'^https?://([^/:?#]+)', referer, re.I)
    if not match:
        return None
    host = match.group(1).lower()
    if host.startswith('www.'):
        host = host[4:]
    if any(host == own or host.endswith('.' + own) for own in own_hosts):
        return None
    return host

# Referrers reported per site, per day. Beyond the first handful the tail is
# one-off links and referer spam, which is noise on a page meant to be read.
TOP_REFERRERS = 10

# A phone cannot install a .dmg, .exe or .tar.gz. A mobile user agent asking
# for one is either a crawler in disguise or a mis-click; neither is a
# download.
MOBILE_UA = re.compile(r'iPhone|iPod|iPad|Android|Mobile Safari', re.I)

# Hosting ranges. Traffic from a datacenter is a machine whatever its user
# agent claims; these showed up pulling every product in lockstep.
DATACENTRE_NETS = ['158.69.0.0/16']

# An address that grabs this many *different* products in one day is not a
# customer — it is us testing, or something enumerating the download tree.
# Behavioural rather than address-based on purpose: excluding the ISP range we
# happen to test from would also discard real customers on that ISP.
DISTINCT_APPS_BOT_THRESHOLD = 5

# ── Site traffic ───────────────────────────────────────────────────────────
# Everything on this box writes its own nginx access log, so the same parser
# that counts downloads can report visitors per product. Related logs are
# grouped under one name: api0's dashboard, gateway and store are parts of
# api0, not separate products.
# Keyed by hostname rather than by product. Rolling the app in with its
# marketing site hides the number that matters: people reading about cvenom
# and people using the studio are different populations, and merging them
# means neither can be seen. Names match nginx's server_name so a row can
# always be traced back to a vhost.
SITES: dict[str, list[str]] = {
    'mayorana.ch':         ['mayorana_access.log'],
    'api0.ai':             ['api0_access.log'],
    'app.api0.ai':         ['api0_dashboard_access.log'],
    'gateway.api0.ai':     ['api0_gateway_access.log'],
    'store.api0.ai':       ['api0_store_access.log'],
    'cvenom.com':          ['cvenom_access.log'],
    'studio.cvenom.com':   ['cvenom_studio_access.log'],
    'ribh.io':             ['solanize_access.log', 'solanize_ribh_access.log'],
    'tafseel.ch':          ['tafseel_access.log'],
    'swissrust.ch':        ['swissrust_access.log'],
    'similar.mayorana.ch': ['similar_access.log'],
}

# Logs that serve programs, not browsers. A browser proves it is real by
# fetching the stylesheet the page references; an API client has no stylesheet
# to fetch and would be discarded by that test, so genuine calls get written
# off as crawlers. These are counted as API traffic instead: requests and
# distinct clients, no asset heuristic.
#
# Only the gateway and store hosts qualify. ribh.io was in this list by
# mistake — it is a website with a homepage, so the browser test applies and
# its traffic should be judged like any other site's.
API_LOGS = {
    'api0_gateway_access.log',
    'api0_store_access.log',
}

# Vulnerability scanning: WordPress endpoints on a site that runs no
# WordPress, and the usual hunt for leaked credentials. nginx already answers
# these 403/404, but they still reach the log and would otherwise crowd out
# the paths customers actually use. Counted separately so the noise stays
# visible without being mistaken for interest.
PROBE = re.compile(
    r'(wp-admin|wp-login|wp-content|wp-includes|xmlrpc\.php|phpmyadmin|'
    r'/\.env|/\.git|/\.aws|/\.ssh|/vendor/|/cgi-bin/|\.php$)',
    re.I,
)

# Static files say nothing about interest — one page view drags in dozens.
ASSET = re.compile(
    r'\.(js|mjs|css|map|png|jpe?g|gif|svg|ico|webp|avif|woff2?|ttf|eot|'
    r'mp4|webm|txt|xml|wasm)$',
    re.I,
)

# How many distinct paths to keep per site. Enough to see what people use,
# bounded so the JSON stays small.
TOP_PATHS = 15

# Loading one page costs a browser at least four requests — the HTML, its
# stylesheet, its script and a favicon — so even an instant bounce clears this.
# Measured on real traffic, addresses making only two or three requests were
# about a fifth of everything that passed the asset test, and behave like
# crawlers that happened to take one asset rather than like readers.
MIN_REQUESTS_PER_VISIT = 4


def platform_of(filename: str) -> str:
    for name, pattern in PLATFORM:
        if pattern.search(filename):
            return name
    return 'other'


class Geo:
    """Country lookup, or a no-op when the database is unavailable."""

    def __init__(self, path: str | None):
        self.reader = None
        self.note = 'disabled'
        if not path:
            return
        if maxminddb is None:
            self.note = 'maxminddb not installed (apt install python3-maxminddb)'
            return
        if not os.path.exists(path):
            self.note = f'database not found at {path}'
            return
        try:
            self.reader = maxminddb.open_database(path)
            self.note = f'using {os.path.basename(path)}'
        except Exception as exc:                       # pragma: no cover
            self.note = f'could not open {path}: {exc}'

    def country(self, ip: str) -> str:
        if self.reader is None:
            return 'unknown'
        try:
            record = self.reader.get(ip)
        except (ValueError, TypeError):
            return 'unknown'
        if not record:
            return 'unknown'
        # DB-IP and MaxMind both nest the ISO code the same way.
        return (record.get('country') or {}).get('iso_code') or 'unknown'


def parse_logs(patterns: list[str], geo: Geo) -> dict[str, dict]:
    """Per-day counts keyed by ISO date.

    Two passes: the behavioural filter has to see a whole day before it can
    judge an address, so events are collected first and counted second.
    """
    nets = []
    for cidr in DATACENTRE_NETS:
        try:
            nets.append(ipaddress.ip_network(cidr, strict=False))
        except ValueError:
            print(f'warning: ignoring bad network {cidr}', file=sys.stderr)

    events: list[dict] = []
    checkins: list[tuple[str, str]] = []          # (day, app)
    # (date, ip, path) — one person pulling one file on one day is one
    # download, however many requests their client made. Range requests and
    # resumed transfers would otherwise each count separately.
    seen: set[tuple[str, str, str]] = set()

    for pattern in patterns:
        for path in sorted(glob(pattern)):
            opener = gzip.open if path.endswith('.gz') else open
            try:
                with opener(path, 'rt', errors='replace') as fh:
                    for line in fh:
                        _collect(line, seen, events, checkins, nets)
            except OSError as exc:
                print(f'warning: cannot read {path}: {exc}', file=sys.stderr)

    return _aggregate(events, checkins, geo)


def _collect(line, seen, events, checkins, nets) -> None:
    match = LINE.match(line)
    if not match:
        return
    if match['method'] != 'GET':          # HEAD is a probe, not a download
        return
    if match['status'] not in ('200', '206'):
        return

    download = DOWNLOAD.match(match['path'])
    if not download:
        return
    if BOT.search(match['ua']):
        return

    try:
        stamp = datetime.strptime(match['time'].split()[0], '%d/%b/%Y:%H:%M:%S')
    except ValueError:
        return
    day = stamp.date().isoformat()

    key = (day, match['ip'], match['path'])
    if key in seen:
        return
    seen.add(key)

    # An updater's latest.json poll: not a download, but a sign of life from
    # an install that already exists.
    if download['file'] == 'latest.json':
        if UPDATER_UA.search(match['ua']):
            checkins.append((day, download['app']))
        return

    if not ARTIFACT.search(download['file']):
        return

    reason = None
    if MOBILE_UA.search(match['ua']):
        reason = 'mobile'
    elif _in_nets(match['ip'], nets):
        reason = 'datacentre'

    source = UTM_SOURCE.search(match['path'])
    medium = UTM_MEDIUM.search(match['path'])

    events.append({
        'day': day,
        'ip': match['ip'],
        'app': download['app'],
        'version': download['version'],
        'platform': platform_of(download['file']),
        'updater': bool(FROM_UPDATER.search(match['path']) or UPDATER_UA.search(match['ua'])),
        'member': bool(FROM_MEMBER.search(match['path'])),
        'source': _unquote(source.group(1)) if source else None,
        'medium': _unquote(medium.group(1)) if medium else None,
        'excluded': reason,
    })


def _unquote(value: str) -> str:
    """Percent-decoded and bounded. These arrive from a URL anyone can type,
    so the value is treated as untrusted input, not as a label we chose."""
    try:
        decoded = unquote_plus(value)
    except Exception:
        decoded = value
    cleaned = re.sub(r'[^A-Za-z0-9._-]+', '-', decoded).strip('-').lower()
    return cleaned[:60] or 'unknown'


def _in_nets(ip: str, nets: list) -> bool:
    if not nets:
        return False
    try:
        address = ipaddress.ip_address(ip)
    except ValueError:
        return False
    return any(address in net for net in nets)


def _aggregate(events: list[dict], checkins: list[tuple[str, str]], geo: Geo) -> dict[str, dict]:
    # Second pass: an address that swept several products in a day is not a
    # customer, so retire everything it did that day.
    apps_per_ip: dict[tuple[str, str], set[str]] = defaultdict(set)
    for event in events:
        if event['excluded'] is None:
            apps_per_ip[(event['day'], event['ip'])].add(event['app'])
    sweepers = {
        key for key, apps in apps_per_ip.items()
        if len(apps) >= DISTINCT_APPS_BOT_THRESHOLD
    }

    days: dict[str, dict] = defaultdict(lambda: {
        'total': 0, 'installs': 0, 'updates': 0,
        'by_app': defaultdict(int), 'by_platform': defaultdict(int),
        'by_country': defaultdict(int),
        'active_by_app': defaultdict(int),
        # New installs split by whether the person signed in first. Updates
        # are left out: an existing user taking a new build tells nothing
        # about whether the offer on the site was accepted.
        'by_signin': defaultdict(int),
        # Which channel found this person, for first installs only. An update
        # is an app phoning home, not a visit anyone was persuaded to make, so
        # counting it here would drown the signal in 'unknown'.
        'by_source': defaultdict(int),
        'by_medium': defaultdict(int),
        # Kept rather than silently dropped: a filter you cannot see is a
        # filter you cannot check.
        'excluded': defaultdict(int),
    })

    for event in events:
        bucket = days[event['day']]
        reason = event['excluded']
        if reason is None and (event['day'], event['ip']) in sweepers:
            reason = 'swept_many_apps'
        if reason:
            bucket['excluded'][reason] += 1
            continue

        bucket['total'] += 1
        bucket['updates' if event['updater'] else 'installs'] += 1
        if not event['updater']:
            bucket['by_signin']['signed_in' if event.get('member') else 'anonymous'] += 1
            # Untagged downloads are real downloads; they just predate the
            # tagging or came from a browser that dropped the parameters.
            # Reported as 'untagged' rather than dropped, so the coverage of
            # the attribution itself stays visible.
            bucket['by_source'][event.get('source') or 'untagged'] += 1
            bucket['by_medium'][event.get('medium') or 'untagged'] += 1
        bucket['by_app'][event['app']] += 1
        bucket['by_platform'][event['platform']] += 1
        bucket['by_country'][geo.country(event['ip'])] += 1

    for day, app in checkins:
        days[day]['active_by_app'][app] += 1

    return {day: _undefault(counts) for day, counts in days.items()}


def _undefault(counts: dict) -> dict:
    return {
        key: dict(value) if isinstance(value, defaultdict) else value
        for key, value in counts.items()
    }


def _decode_ping(path: str) -> dict | None:
    """The batch out of a request path, or None if it is not a well-formed
    one. Strict on purpose: everything that passes is counted."""
    if not path.startswith(PING_PATH + '?'):
        return None
    query = path.split('?', 1)[1]
    encoded = next((p[2:] for p in query.split('&') if p.startswith('b=')), None)
    if not encoded:
        return None
    try:
        raw = base64.urlsafe_b64decode(encoded + '=' * (-len(encoded) % 4))
        body = json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        return None
    if not isinstance(body, dict) or body.get('v') != PING_SCHEMA:
        return None
    if not TAG.match(str(body.get('app', ''))):
        return None
    if not INSTALL_ID.match(str(body.get('install_id', ''))):
        return None
    events = body.get('events')
    if not isinstance(events, list) or not 0 < len(events) <= MAX_EVENTS_PER_PING:
        return None
    return body


def parse_usage(patterns: list[str]) -> dict[str, dict]:
    """Per-day app usage, keyed by ISO date of receipt.

    A day is attributed to when the batch arrived, not to the event's own
    timestamp: a backlog sent after a week offline says "this install is
    alive today", and the same rule the downloads use keeps a day
    recomputable from the logs still on disk.

    Counted per day: distinct installs and launches, events by name, finished
    runs by flow and outcome, and the mix of versions, systems and forges.
    Install ids are used to count and then dropped.
    """
    installs: dict[str, set[str]] = defaultdict(set)
    launches: dict[str, set[str]] = defaultdict(set)
    batches: dict[str, int] = defaultdict(int)
    by_event: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    by_flow: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    by_forge: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    by_provider: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    # Distinct installs, not events: a version's share of the user base.
    by_version: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    by_os: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
    # A client that did not see the 204 sends the same batch again.
    seen: set[tuple] = set()

    for pattern in patterns:
        for path in sorted(glob(pattern)):
            opener = gzip.open if path.endswith('.gz') else open
            try:
                with opener(path, 'rt', errors='replace') as fh:
                    for line in fh:
                        match = LINE.match(line)
                        if not match or match['method'] != 'GET':
                            continue
                        if match['status'] != '204':
                            continue
                        if not TELEMETRY_UA.search(match['ua']):
                            continue
                        body = _decode_ping(match['path'])
                        if body is None:
                            continue
                        try:
                            stamp = datetime.strptime(
                                match['time'].split()[0], '%d/%b/%Y:%H:%M:%S')
                        except ValueError:
                            continue
                        day = stamp.date().isoformat()
                        who = body['install_id']
                        _fold_ping(body, who, day, seen, installs, launches,
                                   batches, by_event, by_flow, by_forge,
                                   by_provider, by_version, by_os)
            except OSError as exc:
                print(f'warning: cannot read {path}: {exc}', file=sys.stderr)

    days = set(installs)
    return {
        day: {
            'installs': len(installs[day]),
            'launches': len(launches.get(day, ())),
            'batches': batches.get(day, 0),
            'by_event': dict(by_event.get(day, {})),
            'by_flow': dict(by_flow.get(day, {})),
            'by_forge': dict(by_forge.get(day, {})),
            'by_provider': dict(by_provider.get(day, {})),
            'by_version': {v: len(s) for v, s in by_version.get(day, {}).items()},
            'by_os': {o: len(s) for o, s in by_os.get(day, {}).items()},
        }
        for day in sorted(days)
    }


def _fold_ping(body, who, day, seen, installs, launches, batches, by_event,
               by_flow, by_forge, by_provider, by_version, by_os) -> None:
    installs[day].add(who)
    batches[day] += 1
    os_name = str(body.get('os', ''))
    if TAG.match(os_name):
        by_os[day][os_name].add(who)

    for event in body['events']:
        if not isinstance(event, dict):
            continue
        name, stamp = str(event.get('n', '')), event.get('t')
        launch, version = str(event.get('l', '')), str(event.get('av', ''))
        params = event.get('p') if isinstance(event.get('p'), dict) else {}
        if not TAG.match(name):
            continue
        key = (who, launch, name, stamp)
        if key in seen:
            continue
        seen.add(key)

        launches[day].add(launch)
        by_event[day][name] += 1
        if re.match(r'^[0-9][0-9a-z.-]{0,19}$', version):
            by_version[day][version].add(who)
        if name == 'flow_finished':
            flow, outcome = str(params.get('flow', '')), str(params.get('outcome', ''))
            if TAG.match(flow) and TAG.match(outcome):
                by_flow[day][f'{flow}/{outcome}'] += 1
            forge, provider = str(params.get('forge', '')), str(params.get('provider', ''))
            if TAG.match(forge):
                by_forge[day][forge] += 1
            if TAG.match(provider):
                by_provider[day][provider] += 1


def parse_sites(log_dir: str, geo: Geo) -> dict[str, dict]:
    """Per-site, per-day visitor and request counts.

    Downloads answer "who took a build"; this answers "who looked at the
    product at all", which is the only question that means anything for the
    hosted ones. Visitors are unique addresses per day — an approximation
    that undercounts offices behind one address and overcounts anyone whose
    address moves.
    """
    sites: dict[str, dict] = {}

    for site, filenames in SITES.items():
        # ip sets per day, collapsed to counts once the day is complete
        visitors: dict[str, set[str]] = defaultdict(set)
        countries: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
        requests: dict[str, int] = defaultdict(int)
        bots: dict[str, int] = defaultdict(int)
        paths: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
        # Distinct addresses per referring host per day, so one person
        # clicking through five pages from the same thread counts once.
        referrers: dict[str, dict[str, set[str]]] = defaultdict(lambda: defaultdict(set))
        own_hosts = (site,)
        # A real browser rendering a page also fetches its CSS and JS; a
        # scraper usually takes the HTML and leaves. Assets are not counted as
        # traffic, but they are the tell that someone real was behind it, so
        # they are recorded here and used to filter afterwards.
        fetched_assets: dict[str, set[str]] = defaultdict(set)
        # Requests are held per (day, ip) so they can be dropped wholesale
        # once an address turns out never to have loaded an asset.
        pending: dict[tuple[str, str], list[tuple[str, str]]] = defaultdict(list)
        # Assets included: the threshold below is about how much of a page was
        # actually fetched, and assets are most of a real page load.
        hits: dict[tuple[str, str], int] = defaultdict(int)

        api_requests: dict[str, int] = defaultdict(int)
        api_clients: dict[str, set[str]] = defaultdict(set)
        probes: dict[str, int] = defaultdict(int)

        patterns = []
        for name in filenames:
            for candidate in (name, name + '.1', name + '.*.gz'):
                patterns.append((os.path.join(log_dir, candidate), name in API_LOGS))

        for pattern, is_api in patterns:
            for path in sorted(glob(pattern)):
                opener = gzip.open if path.endswith('.gz') else open
                try:
                    with opener(path, 'rt', errors='replace') as fh:
                        for line in fh:
                            match = LINE.match(line)
                            if not match:
                                continue
                            request_path = match['path'].split('?')[0]

                            try:
                                stamp = datetime.strptime(
                                    match['time'].split()[0], '%d/%b/%Y:%H:%M:%S')
                            except ValueError:
                                continue
                            day = stamp.date().isoformat()

                            # The apps' usage pings are answered 204 by
                            # design and are not page views; parse_usage
                            # reads them.
                            if request_path == PING_PATH:
                                continue

                            # Counted before the status check: these are
                            # answered 403/404 by design, and a filter you
                            # cannot see is a filter you cannot check.
                            if PROBE.search(request_path):
                                probes[day] += 1
                                continue

                            # 2xx only: a 301 to https is not a page view.
                            if match['status'][0] != '2':
                                continue

                            if BOT.search(match['ua']):
                                if not ASSET.search(request_path):
                                    bots[day] += 1
                                continue

                            # API surfaces answer programs, so the browser
                            # test does not apply — count them directly.
                            if is_api:
                                api_requests[day] += 1
                                api_clients[day].add(match['ip'])
                                continue

                            hits[(day, match['ip'])] += 1

                            if ASSET.search(request_path):
                                fetched_assets[day].add(match['ip'])
                                continue

                            pending[(day, match['ip'])].append(
                                (request_path, match['ua'], match['referer']))
                except OSError as exc:
                    print(f'warning: cannot read {path}: {exc}', file=sys.stderr)

        # Second pass: an address counts as a visitor only if it pulled an
        # asset that day *and* made enough requests to look like a page load.
        # An API-only product fails both tests legitimately, which is why the
        # discarded requests are reported rather than hidden.
        unverified: dict[str, int] = defaultdict(int)
        for (day, ip), entries in pending.items():
            took_asset = ip in fetched_assets.get(day, ())
            if not took_asset or hits[(day, ip)] < MIN_REQUESTS_PER_VISIT:
                unverified[day] += len(entries)
                continue
            visitors[day].add(ip)
            countries[day][geo.country(ip)].add(ip)
            requests[day] += len(entries)
            for request_path, _ua, referer in entries:
                paths[day][request_path] += 1
                source = referrer_host(referer, own_hosts)
                if source:
                    referrers[day][source].add(ip)

        every_day = (set(visitors) | set(bots) | set(unverified)
                     | set(api_requests) | set(probes))
        sites[site] = {
            'days': {
                day: {
                    'visitors': len(visitors.get(day, ())),
                    'requests': requests.get(day, 0),
                    'bot_requests': bots.get(day, 0),
                    'unverified_requests': unverified.get(day, 0),
                    'api_requests': api_requests.get(day, 0),
                    'api_clients': len(api_clients.get(day, ())),
                    'probe_requests': probes.get(day, 0),
                    'by_country': {c: len(s) for c, s in countries.get(day, {}).items()},
                    'top_paths': dict(sorted(paths.get(day, {}).items(),
                                             key=lambda kv: -kv[1])[:TOP_PATHS]),
                    'referrers': dict(sorted(
                        ((host, len(ips)) for host, ips in referrers.get(day, {}).items()),
                        key=lambda kv: -kv[1])[:TOP_REFERRERS]),
                }
                for day in sorted(every_day)
            }
        }

    return sites


def summarise_sites(sites: dict[str, dict]) -> dict:
    """Totals per site, plus the recent daily series the page charts."""
    out = {}
    for site, data in sites.items():
        days = data.get('days', {})
        if not days:
            continue
        ordered_days = sorted(days)
        by_country: dict[str, int] = defaultdict(int)
        top_paths: dict[str, int] = defaultdict(int)
        referrers: dict[str, int] = defaultdict(int)
        requests = bots = unverified = api_requests = probes = 0
        for day in ordered_days:
            entry = days[day]
            requests += entry.get('requests', 0)
            bots += entry.get('bot_requests', 0)
            unverified += entry.get('unverified_requests', 0)
            api_requests += entry.get('api_requests', 0)
            probes += entry.get('probe_requests', 0)
            for country, n in entry.get('by_country', {}).items():
                by_country[country] += n
            for path, n in entry.get('top_paths', {}).items():
                top_paths[path] += n
            for host, n in entry.get('referrers', {}).items():
                referrers[host] += n

        out[site] = {
            'requests': requests,
            'bot_requests': bots,
            # Asked for pages but never loaded a stylesheet or script —
            # almost always a crawler wearing a browser's user agent.
            'unverified_requests': unverified,
            'api_requests': api_requests,
            # Vulnerability scans: WordPress paths, .env hunting and similar.
            # All answered 403/404 by nginx; reported so the noise is visible.
            'probe_requests': probes,
            # Distinct callers on the busiest day, not summed: an integration
            # polling every minute is one client, however many calls it makes.
            'api_clients_peak_day': max(
                (days[d].get('api_clients', 0) for d in ordered_days), default=0),
            # Summed daily uniques: someone visiting on three days counts
            # three times. It tracks engagement, not headcount.
            'visitor_days': sum(days[d].get('visitors', 0) for d in ordered_days),
            'by_country': dict(sorted(by_country.items(), key=lambda kv: -kv[1])[:20]),
            'top_paths': dict(sorted(top_paths.items(), key=lambda kv: -kv[1])[:TOP_PATHS]),
            # Visitor-days per referring host. Where the people who read
            # about a product came from is the closest thing the logs hold
            # to a positioning signal.
            'referrers': dict(sorted(referrers.items(), key=lambda kv: -kv[1])[:TOP_REFERRERS]),
            # Per day, not just the totals above. The page narrows every
            # figure it shows to the selected range, and anything missing
            # from here it cannot narrow — bot and probe counts used to be
            # summary-only, so they sat on the card at their all-time value
            # next to a week's worth of visitors, with nothing saying so.
            'daily': {
                d: {
                    'visitors': days[d].get('visitors', 0),
                    'requests': days[d].get('requests', 0),
                    'api_requests': days[d].get('api_requests', 0),
                    'bot_requests': days[d].get('bot_requests', 0),
                    'unverified_requests': days[d].get('unverified_requests', 0),
                    'probe_requests': days[d].get('probe_requests', 0),
                }
                for d in ordered_days[-365:]
            },
        }
    return out


def merge(state: dict, fresh: dict[str, dict]) -> dict:
    """Days still in the logs replace their stored copy; older days stand."""
    days = dict(state.get('days', {}))
    days.update(fresh)
    return {'days': days}


def merge_sites(stored: dict, fresh: dict) -> dict:
    """Same rule as downloads, applied per site."""
    merged = {site: {'days': dict(data.get('days', {}))}
              for site, data in stored.items()}
    for site, data in fresh.items():
        days = merged.setdefault(site, {'days': {}})['days']
        days.update(data.get('days', {}))
    return merged


def merge_usage(stored: dict, fresh: dict) -> dict:
    """Same rule as downloads: days still in the logs are recomputed."""
    merged = dict(stored)
    merged.update(fresh)
    return merged


def summarise_usage(usage: dict) -> dict:
    days = sorted(usage)
    totals: dict[str, int] = defaultdict(int)
    for day in days:
        for name, n in usage[day].get('by_event', {}).items():
            totals[name] += n
    week = days[-7:]
    active = [usage[day].get('installs', 0) for day in week]
    return {
        'counting_since': days[0] if days else None,
        'days_recorded': len(days),
        'events_total': dict(sorted(totals.items(), key=lambda kv: -kv[1])),
        # Averaged, not summed, for the reason active_installs_daily_avg_7d is.
        'active_installs_daily_avg_7d': round(sum(active) / len(active)) if active else 0,
        'daily': {day: usage[day] for day in days[-365:]},
    }


def summarise(state: dict, geo_note: str) -> dict:
    totals = {'downloads': 0, 'installs': 0, 'updates': 0, 'excluded': 0}
    by_app: dict[str, int] = defaultdict(int)
    by_platform: dict[str, int] = defaultdict(int)
    by_country: dict[str, int] = defaultdict(int)
    by_signin: dict[str, int] = defaultdict(int)
    by_source: dict[str, int] = defaultdict(int)
    by_medium: dict[str, int] = defaultdict(int)
    excluded_by_reason: dict[str, int] = defaultdict(int)

    for counts in state.get('days', {}).values():
        totals['downloads'] += counts.get('total', 0)
        totals['installs'] += counts.get('installs', 0)
        totals['updates'] += counts.get('updates', 0)
        for name, target in (('by_app', by_app), ('by_platform', by_platform),
                             ('by_country', by_country), ('by_signin', by_signin),
                             ('by_source', by_source), ('by_medium', by_medium)):
            for key, n in counts.get(name, {}).items():
                target[key] += n
        for reason, n in counts.get('excluded', {}).items():
            excluded_by_reason[reason] += n
            totals['excluded'] += n

    days = sorted(state.get('days', {}))
    # Full per-day detail, not just a daily total: the page recomputes every
    # figure it shows from this, so the date range can be changed without
    # asking the server again. A year of days costs a few hundred kilobytes.
    recent = days[-365:]

    # Averaged over the last week rather than summed: summing would count the
    # same machine once per day it was switched on.
    week = days[-7:]
    active_recent = [
        sum(state['days'][day].get('active_by_app', {}).values()) for day in week
    ]
    active_daily_avg = round(sum(active_recent) / len(active_recent)) if active_recent else 0

    ordered = lambda d: dict(sorted(d.items(), key=lambda kv: -kv[1]))

    return {
        'generated_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        # Counting started when this script was first run, not when the site
        # went live — say so rather than implying the number is all-time.
        'counting_since': days[0] if days else None,
        'days_recorded': len(days),
        'geoip': geo_note,
        'totals': totals,
        'excluded_by_reason': ordered(excluded_by_reason),
        'by_app': ordered(by_app),
        'by_platform': ordered(by_platform),
        'by_country': ordered(by_country),
        'by_signin': ordered(by_signin),
        'by_source': ordered(by_source),
        'by_medium': ordered(by_medium),
        'active_installs_daily_avg_7d': active_daily_avg,
        'daily': {
            day: {
                'total': state['days'][day].get('total', 0),
                'installs': state['days'][day].get('installs', 0),
                'updates': state['days'][day].get('updates', 0),
                'active': sum(state['days'][day].get('active_by_app', {}).values()),
                'excluded': sum(state['days'][day].get('excluded', {}).values()),
                'by_app': state['days'][day].get('by_app', {}),
                'by_platform': state['days'][day].get('by_platform', {}),
                'by_country': state['days'][day].get('by_country', {}),
                'by_signin': state['days'][day].get('by_signin', {}),
                'by_source': state['days'][day].get('by_source', {}),
                'by_medium': state['days'][day].get('by_medium', {}),
            }
            for day in recent
        },
    }


def write_atomic(path: str, payload: dict) -> None:
    """Written via rename so a reader never sees a half-flushed file."""
    directory = os.path.dirname(path) or '.'
    os.makedirs(directory, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=directory, suffix='.tmp')
    try:
        with os.fdopen(fd, 'w') as fh:
            json.dump(payload, fh, indent=2, sort_keys=True)
            fh.write('\n')
        os.replace(tmp, path)
    except Exception:
        os.unlink(tmp)
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--state', default='/var/lib/mayorana/download-stats.json',
                        help='cumulative per-day counts (survives log rotation)')
    parser.add_argument('--out', default='/var/lib/mayorana/stats.json',
                        help='summary the /stats page reads')
    parser.add_argument('--logs', nargs='+',
                        default=['/var/log/nginx/mayorana_access.log',
                                 '/var/log/nginx/mayorana_access.log.1',
                                 '/var/log/nginx/mayorana_access.log.*.gz'],
                        help='log files or globs to read')
    parser.add_argument('--geoip', default='/var/lib/mayorana/country.mmdb',
                        help='MaxMind-format country database; skipped if absent')
    parser.add_argument('--log-dir', default='/var/log/nginx',
                        help='where the per-site access logs live')
    parser.add_argument('--no-sites', action='store_true',
                        help='count downloads only, skipping site traffic')
    parser.add_argument('--dry-run', action='store_true',
                        help='print the summary instead of writing it')
    parser.add_argument('--reset', action='store_true',
                        help='discard stored history and recount from the logs '
                             'still on disk. Use once, after changing the '
                             'filters, so old totals are not carried forward.')
    args = parser.parse_args()

    if args.reset:
        state = {'days': {}}
    else:
        try:
            with open(args.state) as fh:
                state = json.load(fh)
        except FileNotFoundError:
            state = {'days': {}}
        except (OSError, json.JSONDecodeError) as exc:
            print(f'error: cannot read state {args.state}: {exc}', file=sys.stderr)
            return 1

    geo = Geo(args.geoip)
    downloads_state = merge({'days': state.get('days', {})}, parse_logs(args.logs, geo))
    sites_state = ({} if args.no_sites
                   else merge_sites(state.get('sites', {}), parse_sites(args.log_dir, geo)))

    usage_state = merge_usage(state.get('usage', {}), parse_usage(args.logs))

    state = {'days': downloads_state['days'], 'sites': sites_state,
             'usage': usage_state}
    summary = summarise(state, geo.note)
    summary['sites'] = summarise_sites(sites_state)
    summary['usage'] = summarise_usage(usage_state)

    if args.dry_run:
        json.dump(summary, sys.stdout, indent=2, sort_keys=True)
        sys.stdout.write('\n')
        return 0

    write_atomic(args.state, state)
    write_atomic(args.out, summary)
    print(f"{summary['totals']['downloads']} downloads "
          f"({summary['totals']['excluded']} excluded) across "
          f"{len(state['days'])} day(s) → {args.out}")
    print(f"geoip: {geo.note}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
