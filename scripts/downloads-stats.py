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

Usage:
    downloads-stats.py [--state PATH] [--out PATH] [--logs GLOB ...] [--dry-run]
"""

from __future__ import annotations

import argparse
import gzip
import json
import os
import re
import sys
import tempfile
from collections import defaultdict
from datetime import datetime, timezone
from glob import glob

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

# Crawlers announce themselves; the ones that do not are largely filtered by
# the unique-IP-per-file-per-day rule below.
BOT = re.compile(
    r'bot|crawl|spider|slurp|curl/|wget|python-requests|scrapy|headless|'
    r'monitoring|uptime|pingdom|semrush|ahrefs|facebookexternalhit',
    re.I,
)

# The banner in each app appends this to the download URL. It is on the URL
# rather than the User-Agent because the banner opens the link in the user's
# browser — the updater's own agent never fetches the file.
FROM_UPDATER = re.compile(r'[?&]src=updater(&|$)', re.I)

# Set by the updater on its latest.json poll. That request is not a download,
# but counting it separately answers a different and more useful question:
# how many installs are still running.
UPDATER_UA = re.compile(r'\(updater\)', re.I)


def platform_of(filename: str) -> str:
    for name, pattern in PLATFORM:
        if pattern.search(filename):
            return name
    return 'other'


def parse_logs(patterns: list[str]) -> dict[str, dict]:
    """Per-day counts keyed by ISO date, from whatever logs are still around."""
    # (date, ip, path) — one person pulling one file on one day is one
    # download, however many requests their client actually made. Range
    # requests and resumed transfers would otherwise each count separately.
    seen: set[tuple[str, str, str]] = set()
    days: dict[str, dict] = defaultdict(
        lambda: {
            'total': 0,
            'installs': 0,
            'updates': 0,
            'by_app': defaultdict(int),
            'by_platform': defaultdict(int),
            'by_app_version': defaultdict(int),
            # Distinct installs that phoned home that day. A lower bound on
            # active users: a machine that was off, or behind a shared IP,
            # does not show up.
            'active_by_app': defaultdict(int),
        }
    )

    for pattern in patterns:
        for path in sorted(glob(pattern)):
            opener = gzip.open if path.endswith('.gz') else open
            try:
                with opener(path, 'rt', errors='replace') as fh:
                    for line in fh:
                        _count_line(line, seen, days)
            except OSError as exc:
                print(f'warning: cannot read {path}: {exc}', file=sys.stderr)

    return {day: _undefault(counts) for day, counts in days.items()}


def _count_line(line: str, seen: set, days: dict) -> None:
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
            days[day]['active_by_app'][download['app']] += 1
        return

    if not ARTIFACT.search(download['file']):
        return

    bucket = days[day]
    bucket['total'] += 1
    if FROM_UPDATER.search(match['path']) or UPDATER_UA.search(match['ua']):
        bucket['updates'] += 1
    else:
        bucket['installs'] += 1
    bucket['by_app'][download['app']] += 1
    bucket['by_platform'][platform_of(download['file'])] += 1
    bucket['by_app_version'][f"{download['app']}@{download['version']}"] += 1


def _undefault(counts: dict) -> dict:
    return {
        key: dict(value) if isinstance(value, defaultdict) else value
        for key, value in counts.items()
    }


def merge(state: dict, fresh: dict[str, dict]) -> dict:
    """Days still in the logs replace their stored copy; older days stand."""
    days = dict(state.get('days', {}))
    days.update(fresh)
    return {'days': days}


def summarise(state: dict) -> dict:
    totals = {'downloads': 0, 'installs': 0, 'updates': 0}
    by_app: dict[str, int] = defaultdict(int)
    by_platform: dict[str, int] = defaultdict(int)
    by_app_version: dict[str, int] = defaultdict(int)

    for counts in state.get('days', {}).values():
        totals['downloads'] += counts.get('total', 0)
        totals['installs'] += counts.get('installs', 0)
        totals['updates'] += counts.get('updates', 0)
        for app, n in counts.get('by_app', {}).items():
            by_app[app] += n
        for platform, n in counts.get('by_platform', {}).items():
            by_platform[platform] += n
        for key, n in counts.get('by_app_version', {}).items():
            by_app_version[key] += n

    days = sorted(state.get('days', {}))
    recent = days[-30:]

    # Averaged over the last week rather than summed: summing would count the
    # same machine once per day it was switched on.
    week = days[-7:]
    active_recent = [
        sum(state['days'][day].get('active_by_app', {}).values()) for day in week
    ]
    active_daily_avg = round(sum(active_recent) / len(active_recent)) if active_recent else 0

    return {
        'generated_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        # Counting started when this script was first run, not when the site
        # went live — say so rather than implying the number is all-time.
        'counting_since': days[0] if days else None,
        'totals': totals,
        'by_app': dict(sorted(by_app.items(), key=lambda kv: -kv[1])),
        'by_platform': dict(sorted(by_platform.items(), key=lambda kv: -kv[1])),
        'by_app_version': dict(sorted(by_app_version.items(), key=lambda kv: -kv[1])),
        'active_installs_daily_avg_7d': active_daily_avg,
        'last_30_days': {day: state['days'][day]['total'] for day in recent},
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
                        help='summary the admin dashboard reads. Kept out of '
                             'the public download root on purpose: publishing '
                             'a counter is a separate, deliberate decision, '
                             'and a small number on the website is worse than '
                             'no number at all')
    parser.add_argument('--logs', nargs='+',
                        default=['/var/log/nginx/mayorana_access.log',
                                 '/var/log/nginx/mayorana_access.log.1',
                                 '/var/log/nginx/mayorana_access.log.*.gz'],
                        help='log files or globs to read')
    parser.add_argument('--dry-run', action='store_true',
                        help='print the summary instead of writing it')
    args = parser.parse_args()

    try:
        with open(args.state) as fh:
            state = json.load(fh)
    except FileNotFoundError:
        state = {'days': {}}
    except (OSError, json.JSONDecodeError) as exc:
        print(f'error: cannot read state {args.state}: {exc}', file=sys.stderr)
        return 1

    state = merge(state, parse_logs(args.logs))
    summary = summarise(state)

    if args.dry_run:
        json.dump(summary, sys.stdout, indent=2, sort_keys=True)
        sys.stdout.write('\n')
        return 0

    write_atomic(args.state, state)
    write_atomic(args.out, summary)
    print(f"{summary['totals']['downloads']} downloads across "
          f"{len(state['days'])} day(s) → {args.out}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
