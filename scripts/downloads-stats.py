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

Country attribution is optional and offline: point --geoip at a MaxMind-format
country database (DB-IP publish a free one) and install python3-maxminddb. No
addresses are stored — only the per-country totals they roll up into.

Usage:
    downloads-stats.py [--state PATH] [--out PATH] [--logs GLOB ...]
                       [--geoip PATH] [--dry-run] [--reset]
"""

from __future__ import annotations

import argparse
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

try:  # Optional: country attribution is skipped cleanly when absent.
    import maxminddb
except ImportError:
    maxminddb = None

# nginx "combined": addr - user [time] "request" status bytes "referer" "ua"
LINE = re.compile(
    r'^(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] '
    r'"(?P<method>[A-Z]+) (?P<path>[^" ]*)[^"]*" '
    r'(?P<status>\d{3}) \S+ "[^"]*" "(?P<ua>[^"]*)"'
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

# Set by the updater on its latest.json poll. Not a download, but counting it
# separately answers a more useful question: how many installs are running.
UPDATER_UA = re.compile(r'\(updater\)', re.I)

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
DISTINCT_APPS_BOT_THRESHOLD = 4

# ── Site traffic ───────────────────────────────────────────────────────────
# Everything on this box writes its own nginx access log, so the same parser
# that counts downloads can report visitors per product. Related logs are
# grouped under one name: api0's dashboard, gateway and store are parts of
# api0, not separate products.
SITES: dict[str, list[str]] = {
    'mayorana':  ['mayorana_access.log'],
    'api0':      ['api0_access.log', 'api0_dashboard_access.log',
                  'api0_gateway_access.log', 'api0_store_access.log'],
    'cvenom':    ['cvenom_access.log', 'cvenom_api_access.log',
                  'cvenom_studio_access.log'],
    'tafseel':   ['tafseel_access.log'],
    'solanize':  ['solanize_access.log', 'solanize_ribh_access.log'],
    'swissrust': ['swissrust_access.log'],
    'similar':   ['similar_access.log'],
}

# Logs that serve programs, not browsers. A browser proves it is real by
# fetching the stylesheet the page references; an API client has no stylesheet
# to fetch and would be discarded by that test, which is how ~20k genuine
# cvenom calls first got written off as crawlers. These are counted as API
# traffic instead: requests and distinct clients, no asset heuristic.
API_LOGS = {
    'api0_gateway_access.log',
    'api0_store_access.log',
    'cvenom_api_access.log',
    'solanize_ribh_access.log',
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

    events.append({
        'day': day,
        'ip': match['ip'],
        'app': download['app'],
        'version': download['version'],
        'platform': platform_of(download['file']),
        'updater': bool(FROM_UPDATER.search(match['path']) or UPDATER_UA.search(match['ua'])),
        'excluded': reason,
    })


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
        'by_app_version': defaultdict(int), 'by_country': defaultdict(int),
        'active_by_app': defaultdict(int),
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
        bucket['by_app'][event['app']] += 1
        bucket['by_platform'][event['platform']] += 1
        bucket['by_app_version'][f"{event['app']}@{event['version']}"] += 1
        bucket['by_country'][geo.country(event['ip'])] += 1

    for day, app in checkins:
        days[day]['active_by_app'][app] += 1

    return {day: _undefault(counts) for day, counts in days.items()}


def _undefault(counts: dict) -> dict:
    return {
        key: dict(value) if isinstance(value, defaultdict) else value
        for key, value in counts.items()
    }


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

                            pending[(day, match['ip'])].append((request_path, match['ua']))
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
            for request_path, _ua in entries:
                paths[day][request_path] += 1

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
            'daily': {
                d: {
                    'visitors': days[d].get('visitors', 0),
                    'requests': days[d].get('requests', 0),
                    'api_requests': days[d].get('api_requests', 0),
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


def summarise(state: dict, geo_note: str) -> dict:
    totals = {'downloads': 0, 'installs': 0, 'updates': 0, 'excluded': 0}
    by_app: dict[str, int] = defaultdict(int)
    by_platform: dict[str, int] = defaultdict(int)
    by_app_version: dict[str, int] = defaultdict(int)
    by_country: dict[str, int] = defaultdict(int)
    excluded_by_reason: dict[str, int] = defaultdict(int)

    for counts in state.get('days', {}).values():
        totals['downloads'] += counts.get('total', 0)
        totals['installs'] += counts.get('installs', 0)
        totals['updates'] += counts.get('updates', 0)
        for name, target in (('by_app', by_app), ('by_platform', by_platform),
                             ('by_app_version', by_app_version), ('by_country', by_country)):
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
        'by_app_version': ordered(by_app_version),
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

    state = {'days': downloads_state['days'], 'sites': sites_state}
    summary = summarise(state, geo.note)
    summary['sites'] = summarise_sites(sites_state)

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
