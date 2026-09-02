#!/usr/bin/env bash
#
# Install the nightly download-count aggregator on the VPS.
#
# nginx logs every hit to /downloads/, but logrotate discards them after about
# two weeks. This schedules the aggregator so each day's total is folded into a
# cumulative file before the log it came from is deleted.
#
# Idempotent: safe to re-run to pick up a new version of the script.
#
# Usage (as root, from a checkout of the site repo):
#     sudo ./scripts/install-downloads-stats.sh
set -euo pipefail

BIN=/usr/local/bin/mayorana-download-stats
STATE_DIR=/var/lib/mayorana
STATE=$STATE_DIR/download-stats.json
# Deliberately not under /var/www: the numbers are for the admin dashboard.
# Publishing a public counter is a separate decision, and a small number on
# the website reads worse than no number at all. To publish later, point
# --out at /var/www/mayorana-downloads/stats.json instead.
SUMMARY=$STATE_DIR/stats.json
CRON=/etc/cron.d/mayorana-download-stats

if [[ $EUID -ne 0 ]]; then
    echo "error: run with sudo" >&2
    exit 1
fi

src=$(dirname "$(readlink -f "$0")")/downloads-stats.py
if [[ ! -f $src ]]; then
    echo "error: downloads-stats.py not found next to this script" >&2
    exit 1
fi

install -m 755 "$src" "$BIN"
install -d -m 755 "$STATE_DIR"
echo "installed $BIN"

# 03:20 rather than exactly 03:00: Debian runs logrotate from cron.daily at
# 06:25 by default, so this reads a complete previous day well before the log
# it depends on is rotated away.
cat > "$CRON" <<CRONTAB
# Aggregate product download counts before logrotate discards the logs.
SHELL=/bin/sh
PATH=/usr/local/bin:/usr/bin:/bin
20 3 * * * root $BIN --state $STATE --out $SUMMARY >/dev/null 2>&1
CRONTAB
chmod 644 "$CRON"
echo "installed $CRON (nightly at 03:20)"

# Seed immediately so there is a stats.json before the first cron run, and so
# any downloads already sitting in the current log are captured rather than
# lost at the next rotation.
"$BIN" --state "$STATE" --out "$SUMMARY"

# World-readable so the Next.js app (running as the deploy user) can read it;
# the directory itself stays owned by root and writable only by the cron job.
chmod 755 "$STATE_DIR"
chmod 644 "$SUMMARY" "$STATE"

echo
echo "state:   $STATE   (cumulative — back this up, it outlives the logs)"
echo "summary: $SUMMARY (read by /admin/downloads)"
echo
echo "Check it with:  $BIN --dry-run"
