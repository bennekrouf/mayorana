#!/bin/bash
# Deploy mayorana.ch on the VPS.
# File: scripts/deploy-mayorana.sh
#
# Run ON the VPS as the user that owns APP_DIR (currently `ubuntu`):
#
#     bash /var/www/mayorana/scripts/deploy-mayorana.sh
#
# Replaces the old `/usr/local/bin/deploy` option 11, which was wrong on two
# counts and would fail before pulling anything:
#   - it ran git/pm2 as the `mayorana` user, but APP_DIR is owned by `ubuntu`
#     (mode 775) and the PM2 process lives in ubuntu's daemon;
#   - it built with `npm run build`, but this repo is Yarn (yarn.lock).
# That mismatch is why the box silently sat two commits behind on 2026-08-28.
#
# Restarts only the `mayorana` PM2 app — the VPS hosts ~15 others.

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/mayorana}"
PM2_APP="${PM2_APP:-mayorana}"
BRANCH="${BRANCH:-master}"
PORT="${PORT:-3006}"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
info() { echo -e "${YELLOW}▶  $1${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}" >&2; exit 1; }

[ -d "$APP_DIR" ] || err "APP_DIR not found: $APP_DIR (are you on the VPS?)"
cd "$APP_DIR"

# APP_DIR is owned by ubuntu while git may run under a different login; scope
# the exception to this repo rather than editing global git config.
GIT=(git -c "safe.directory=$APP_DIR")

[ -w "$APP_DIR" ] || err "$APP_DIR is not writable by $(whoami) — run as the owner ($(stat -c '%U' "$APP_DIR"))"
command -v yarn >/dev/null || err "yarn not found"
command -v pm2  >/dev/null || err "pm2 not found"
pm2 describe "$PM2_APP" >/dev/null 2>&1 || err "PM2 app '$PM2_APP' not found in $(whoami)'s daemon"

# Refuse to clobber uncommitted work someone left on the server.
if [ -n "$("${GIT[@]}" status --porcelain)" ]; then
  "${GIT[@]}" status --short
  err "Working tree at $APP_DIR is dirty — commit, stash or discard before deploying"
fi

BEFORE="$("${GIT[@]}" rev-parse --short HEAD)"
info "Deploying $PM2_APP from $BRANCH (currently at $BEFORE)"

info "Pulling..."
"${GIT[@]}" fetch --quiet origin "$BRANCH"
# --ff-only: never create a merge commit on the server; if it can't fast-forward,
# something diverged and a human should look.
"${GIT[@]}" merge --ff-only "origin/$BRANCH"

AFTER="$("${GIT[@]}" rev-parse --short HEAD)"
if [ "$BEFORE" = "$AFTER" ]; then
  info "Already up to date at $AFTER — rebuilding anyway"
else
  ok "$BEFORE → $AFTER"
  "${GIT[@]}" --no-pager log --oneline "$BEFORE..$AFTER" | sed 's/^/     /'
fi

info "Installing dependencies..."
yarn install --frozen-lockfile

# `yarn build` also runs generate-blog-data (prebuild) and generate-sitemap
# (postbuild), so the sitemap picks up any new routes.
info "Building..."
yarn build

info "Restarting PM2 app '$PM2_APP'..."
pm2 restart "$PM2_APP" --update-env

info "Health check on :$PORT..."
for _ in $(seq 1 10); do
  code="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/en" || true)"
  if [ "$code" = "200" ]; then
    ok "Deployed $AFTER — mayorana.ch responding 200"
    exit 0
  fi
  sleep 2
done

pm2 logs "$PM2_APP" --lines 30 --nostream || true
err "App did not return 200 on :$PORT after restart (last status: ${code:-none})"
