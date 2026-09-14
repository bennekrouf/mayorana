#!/bin/bash
# Publish the in-app notice (see docs/downloads-notice.md).
#
# One reference file, config/downloads-notice.json, becomes seven files on the
# server: the global notice, plus one per product whose `url` carries
# `?tool=<product>` so the founding page opens with the right tool selected.
# The per-product copy wins in the app, so every install gets the tagged link;
# the global one is the fallback for a product this script does not know.
#
#   ./scripts/publish-notice.sh            # publish
#   ./scripts/publish-notice.sh --dry-run  # print what would be written
set -euo pipefail

HOST="${NOTICE_HOST:-ubuntu@vps-5f2e0f0d.vps.ovh.net}"
REMOTE_DIR="/var/www/mayorana-downloads"
SRC="$(cd "$(dirname "$0")/.." && pwd)/config/downloads-notice.json"

# Products that ship the notice banner (src/notice.rs in each repo).
PRODUCTS=(gitagent ais-monitor ais-runner ais-tracing ais-analytics appscreens)

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

[ -f "$SRC" ] || { echo "missing $SRC" >&2; exit 1; }
python3 -c "import json,sys; json.load(open(sys.argv[1]))" "$SRC" \
  || { echo "$SRC is not valid JSON" >&2; exit 1; }

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

cp "$SRC" "$STAGE/notice.json"
for product in "${PRODUCTS[@]}"; do
  mkdir -p "$STAGE/$product"
  python3 - "$SRC" "$product" > "$STAGE/$product/notice.json" <<'PY'
import json, sys
from urllib.parse import urlencode, urlparse, urlunparse, parse_qsl
notice = json.load(open(sys.argv[1])); product = sys.argv[2]
if notice.get("url"):
    parts = urlparse(notice["url"])
    query = dict(parse_qsl(parts.query)); query["tool"] = product
    notice["url"] = urlunparse(parts._replace(query=urlencode(query)))
json.dump(notice, sys.stdout, ensure_ascii=False, indent=2); print()
PY
done

if [ "$DRY_RUN" = 1 ]; then
  for f in "$STAGE"/notice.json "$STAGE"/*/notice.json; do
    echo "== ${f#"$STAGE"/}"; cat "$f"
  done
  exit 0
fi

# One rsync, only the notice files: never touches the builds next to them.
# -rt, not -a: -a would also copy the staging directory's mode onto the
# remote directories, and mktemp's 700 on the downloads root locks nginx out
# of every build under it. Files land 644, directories are left alone.
rsync -rt --no-perms --no-owner --no-group --chmod=F644 \
  --include='*/' --include='notice.json' --exclude='*' \
  "$STAGE/" "$HOST:$REMOTE_DIR/"

echo "published notice '$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['id'])" "$SRC")' to $HOST:$REMOTE_DIR"
for product in "${PRODUCTS[@]}"; do
  printf '  %-14s %s\n' "$product" "$(curl -sf "https://mayorana.ch/downloads/$product/notice.json" | python3 -c 'import json,sys; print(json.load(sys.stdin)["url"])')"
done
