#!/usr/bin/env bash
#
# Install the nightly download-count aggregator on the VPS.
#
# nginx logs every hit to /downloads/, but logrotate discards them after about
# two weeks. This schedules the aggregator so each day's total is folded into a
# cumulative file before the log it came from is deleted.
#
# Follows the box's existing convention — script in ~/scripts, log beside it,
# entry in the user crontab — rather than installing to /usr/local/bin and
# /etc/cron.d. Runs as the ordinary user: reading the nginx log only needs
# membership of the `adm` group, and sudo is used once, to create the state
# directory.
#
# Idempotent: re-run to pick up a new version of the script.
#
# Usage (as the deploy user, from a checkout of the site repo):
#     ./scripts/install-downloads-stats.sh
set -euo pipefail

SCRIPTS_DIR="$HOME/scripts"
TARGET="$SCRIPTS_DIR/downloads-stats.py"
LOG="$SCRIPTS_DIR/downloads-stats.log"

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

mkdir -p "$SCRIPTS_DIR"
# Copying a file onto itself is an error, and it happens whenever this is run
# from the directory it installs into — which is exactly what you get after
# copying both files straight to ~/scripts.
if [[ "$(readlink -f "$src")" == "$(readlink -f "$TARGET")" ]]; then
    chmod 755 "$TARGET"
    echo "using $TARGET in place"
else
    install -m 755 "$src" "$TARGET"
    echo "installed $TARGET"
fi

if [[ ! -d $STATE_DIR ]]; then
    echo "creating $STATE_DIR (needs sudo once)"
    sudo install -d -o "$USER" -g "$(id -gn)" -m 755 "$STATE_DIR"
fi
echo "state directory ready: $STATE_DIR"

# 03:20: before Debian/Ubuntu rotate the logs from cron.daily, and clear of
# the 03:30 backup job already in this crontab.
ENTRY="20 3 * * * $TARGET --state $STATE --out $SUMMARY >> $LOG 2>&1"

# Replace any previous entry for this script rather than stacking duplicates,
# and leave every other job untouched.
kept="$(crontab -l 2>/dev/null | grep -vF "$TARGET" | sed '/^[[:space:]]*$/d' || true)"
if [[ -n $kept ]]; then
    printf '%s\n%s\n' "$kept" "$ENTRY" | crontab -
else
    printf '%s\n' "$ENTRY" | crontab -
fi
echo "crontab entry installed (nightly at 03:20)"

# Seed immediately: whatever is in today's log is captured now rather than
# lost at the next rotation.
"$TARGET" --state "$STATE" --out "$SUMMARY"

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
