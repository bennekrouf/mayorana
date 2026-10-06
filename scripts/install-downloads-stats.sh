#!/usr/bin/env bash
#
# Schedule the download and traffic aggregator on the VPS.
#
# nginx logs every hit, but logrotate discards the logs after about two weeks.
# The aggregator folds each day into a cumulative file that outlives them, and
# rewrites the summary the /stats page reads.
#
# Every 15 minutes, not nightly: a run takes ~15 s, and once a day meant the
# page was up to a day stale. Re-running is safe — a day still in the logs is
# recomputed, not added to.
#
# The cron runs the script from this checkout, not from a copy. It used to be
# copied to ~/scripts once, and since deploys never refreshed the copy every
# later change to the script was merged but not live for weeks without anyone
# noticing. Running the deployed file means merged-and-deployed is live.
#
# Runs as the ordinary user (reading the nginx log needs membership of `adm`);
# sudo is used once, to create the state directory. Idempotent: re-run any
# time, and it also replaces an old nightly entry.
#
# Usage (as the deploy user, from a checkout of the site repo):
#     ./scripts/install-downloads-stats.sh
set -euo pipefail

SCRIPTS_DIR="$HOME/scripts"
LOG="$SCRIPTS_DIR/downloads-stats.log"
# Two runs at once would both read the state, both write it, and the second
# would silently discard the first's update. flock -n skips a run instead.
LOCK=/tmp/downloads-stats.lock

# Outside any deploy directory on purpose: this file is the only record of
# download history once the logs it came from have rotated away, so a
# redeploy must not be able to remove it.
STATE_DIR=/var/lib/mayorana
STATE="$STATE_DIR/download-stats.json"
# Not under /var/www: publishing a public counter is a separate, deliberate
# decision, and a small number on the website reads worse than no number.
SUMMARY="$STATE_DIR/stats.json"

ACCESS_LOG=/var/log/nginx/mayorana_access.log

if [[ $EUID -eq 0 ]]; then
    echo "error: run as the deploy user, not root — the cron entry belongs to" >&2
    echo "       that user's crontab, and sudo is requested only where needed." >&2
    exit 1
fi

src="$(dirname "$(readlink -f "$0")")/downloads-stats.py"
if [[ ! -f $src ]]; then
    echo "error: downloads-stats.py not found next to this script" >&2
    exit 1
fi

# The job is useless if it cannot read the log, and the failure would
# otherwise be silent: every nightly run would record zero downloads.
if [[ ! -r $ACCESS_LOG ]]; then
    echo "error: cannot read $ACCESS_LOG" >&2
    echo "       nginx logs are usually root:adm 640 — add the user to 'adm':" >&2
    echo "       sudo usermod -aG adm $USER   (then log out and back in)" >&2
    exit 1
fi

TARGET="$(readlink -f "$src")"
[[ -x $TARGET ]] || chmod 755 "$TARGET"
mkdir -p "$SCRIPTS_DIR"   # for the log

if [[ ! -d $STATE_DIR ]]; then
    echo "creating $STATE_DIR (needs sudo once)"
    sudo install -d -o "$USER" -g "$(id -gn)" -m 755 "$STATE_DIR"
fi
echo "state directory ready: $STATE_DIR"

ENTRY="*/15 * * * * flock -n $LOCK $TARGET --state $STATE --out $SUMMARY >> $LOG 2>&1"

# Replace any previous entry for this script — including the old nightly one
# that ran a copy from ~/scripts — and leave every other job untouched.
kept="$(crontab -l 2>/dev/null | grep -v 'downloads-stats\.py' | sed '/^[[:space:]]*$/d' || true)"
if [[ -n $kept ]]; then
    printf '%s\n%s\n' "$kept" "$ENTRY" | crontab -
else
    printf '%s\n' "$ENTRY" | crontab -
fi
echo "crontab entry installed (every 15 minutes, running $TARGET)"

# Seed immediately: whatever is in today's log is captured now rather than
# lost at the next rotation.
flock -n "$LOCK" "$TARGET" --state "$STATE" --out "$SUMMARY"

echo
echo "state:   $STATE   (cumulative — back this up, it outlives the logs)"
echo "summary: $SUMMARY (read by /admin/downloads)"
echo "log:     $LOG"
echo
echo "The site reads the summary through DOWNLOAD_STATS_PATH; set it if the"
echo "app's environment does not already point there:"
echo "    DOWNLOAD_STATS_PATH=$SUMMARY"
echo
echo "Check it any time with:  $TARGET --dry-run"
