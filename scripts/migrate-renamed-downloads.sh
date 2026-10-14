#!/bin/bash
# Move the builds of the apps renamed in October 2026 to their new names on the
# download host (see docs/app-rename-2026-10.md).
#
# For each app, on the server:
#   * the folder moves to the new name, and the old name becomes a symlink to
#     it, so installed copies polling /downloads/<old>/latest/latest.json, the
#     in-app notice and the site's release feed all keep working unchanged;
#   * every build in it gets its new file name (trackcut-setup.exe for
#     splitter-setup.exe, …) as a symlink beside the original, which stays,
#     because the latest.json already out there names the original.
#
# The next release of each app publishes files under the new names itself and
# its `latest/` sync drops the old ones. Idempotent: re-run it any time.
#
#   ./scripts/migrate-renamed-downloads.sh --dry-run  # print what it would do
#   ./scripts/migrate-renamed-downloads.sh            # do it
set -euo pipefail

HOST="${NOTICE_HOST:-ubuntu@vps-5f2e0f0d.vps.ovh.net}"
REMOTE_DIR="/var/www/mayorana-downloads"

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

ssh "$HOST" DRY_RUN="$DRY_RUN" ROOT="$REMOTE_DIR" bash -s <<'REMOTE'
set -euo pipefail
cd "$ROOT"
run() { if [ "$DRY_RUN" = 1 ]; then echo "  would: $*"; else "$@"; fi; }

for pair in appscreens:shipscreen blog-toolkit:publishkit splitter:trackcut \
            small-video:polishcast spreadwatch:spreadradar; do
  old=${pair%%:*}; new=${pair##*:}
  echo "== $old → $new"

  if [ -d "$old" ] && [ ! -L "$old" ]; then
    if [ -e "$new" ]; then
      echo "  ! both $old/ and $new/ exist; move what is in $old/ by hand" >&2
      continue
    fi
    run mv "$old" "$new"
    run ln -s "$new" "$old"
  elif [ -L "$old" ]; then
    echo "  $old already points to $(readlink "$old")"
  fi

  # In a dry run the folder has not moved yet; look where the files are.
  dir=$new; [ -d "$dir" ] || dir=$old
  [ -d "$dir" ] || { echo "  no $old/ or $new/ here"; continue; }

  find "$dir/" -mindepth 2 -maxdepth 2 \( -type f -o -type l \) -name "$old-*" | sort |
  while read -r file; do
    base=$(basename "$file"); renamed="$new-${base#"$old"-}"
    target="$(dirname "$file")/$renamed"
    [ -e "$target" ] || run ln -s "$base" "${target/#$dir\//$new/}"
  done
done
REMOTE

[ "$DRY_RUN" = 1 ] && exit 0

# The new names, as the site links to them.
for url in shipscreen/latest/shipscreen-windows-setup.exe publishkit/latest/publishkit-setup.exe \
           trackcut/latest/trackcut-setup.exe polishcast/latest/polishcast-setup.exe \
           spreadradar/latest/spreadradar-setup.exe splitter/latest/latest.json; do
  printf '  %-50s %s\n' "$url" "$(curl -s -o /dev/null -w '%{http_code}' -I "https://mayorana.ch/downloads/$url")"
done
