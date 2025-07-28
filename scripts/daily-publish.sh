#!/bin/bash
# Daily Publishing Script with Alternating Locales (FR/EN)
# File: scripts/daily-publish.sh

set -e

# Configuration
REPO_DIR=$(pwd)
LOG_FILE="/var/log/blog-publishing.log"
BACKUP_DIR="/tmp/blog-backup"
SITE_URL="https://mayorana.ch"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging with locale awareness
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Get today's target locale
get_target_locale() {
  local day_of_year=$(date +%j)
  if [ $((day_of_year % 2)) -eq 0 ]; then
    echo "en"
  else
    echo "fr"
  fi
}

# Error handling
handle_error() {
  local error_msg="$1"
  log "❌ ERROR: $error_msg"

  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data '{"text":"🚨 Blog auto-publish failed: '"$error_msg"'"}' \
      "$SLACK_WEBHOOK_URL" || true
  fi
  exit 1
}

# Enhanced notification with locale info
send_success_notification() {
  local published_locale="$1"
  local target_locale="$2"
  local article_name="$3"

  local locale_status=""
  if [ "$published_locale" = "$target_locale" ]; then
    locale_status="🎯 on schedule"
  else
    locale_status="🔄 fallback (target was ${target_locale^^})"
  fi

  local message="✅ Daily blog published! 📝 ${published_locale^^} article: \"$article_name\" ($locale_status)"

  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data '{"text":"'"$message"'"}' \
      "$SLACK_WEBHOOK_URL" || true
  fi

  log "$message"
}

main() {
  local target_locale=$(get_target_locale)
  log "🚀 Starting daily publishing check..."
  log "📅 Day $(date +%j) of year - Target locale: ${target_locale^^}"

  # Validate environment
  if [ ! -f "package.json" ] || [ ! -d "content" ]; then
    handle_error "Not in mayorana project directory"
  fi

  # Backup
  if [ -d "content" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r content/ "$BACKUP_DIR/content-$(date +%Y%m%d_%H%M%S)/" || log "⚠️  Backup failed (continuing)"
  fi

  # Pull latest changes
  log "📥 Checking for new content..."
  git pull origin master 2>/dev/null || log "⚠️  Git pull failed (continuing)"

  # Check status with locale awareness
  log "🔍 Checking publishing status..."
  if ! node scripts/blog-cli.js status --quiet >/dev/null 2>&1; then
    log "⚠️  CLI not working, skipping publish"
    exit 0
  fi

  # Show today's publishing plan
  log "🎯 Publishing plan:"
  log "   Target: ${target_locale^^}"

  # Check available content in target locale
  local target_queue_dir="content/${target_locale}/queue"
  local fallback_locale="en"
  if [ "$target_locale" = "en" ]; then
    fallback_locale="fr"
  fi
  local fallback_queue_dir="content/${fallback_locale}/queue"

  local target_count=0
  local fallback_count=0

  if [ -d "$target_queue_dir" ]; then
    target_count=$(find "$target_queue_dir" -name "*.md" | wc -l)
  fi

  if [ -d "$fallback_queue_dir" ]; then
    fallback_count=$(find "$fallback_queue_dir" -name "*.md" | wc -l)
  fi

  log "   Available: ${target_locale^^}=$target_count, ${fallback_locale^^}=$fallback_count"

  # Attempt to publish
  log "📝 Attempting to publish..."

  if node scripts/schedule-publish.js --publish 2>&1 | tee -a "$LOG_FILE"; then
    # Determine what was actually published
    local published_article=""
    local published_locale=""

    # Check which locale got new content
    if [ -d "content/en/blog" ]; then
      local en_latest=$(ls -t content/en/blog/*.md 2>/dev/null | head -1 || echo "")
      if [ -n "$en_latest" ] && [ "$en_latest" -nt "$LOG_FILE" ]; then
        published_locale="en"
        published_article=$(basename "$en_latest" .md)
      fi
    fi

    if [ -d "content/fr/blog" ] && [ -z "$published_locale" ]; then
      local fr_latest=$(ls -t content/fr/blog/*.md 2>/dev/null | head -1 || echo "")
      if [ -n "$fr_latest" ] && [ "$fr_latest" -nt "$LOG_FILE" ]; then
        published_locale="fr"
        published_article=$(basename "$fr_latest" .md)
      fi
    fi

    if [ -n "$published_locale" ]; then
      log "✅ Article published successfully!"
      log "📝 Published: $published_article (${published_locale^^})"

      # Regenerate data
      log "🔄 Regenerating blog data..."
      node scripts/generate-blog-data.js || handle_error "Blog data generation failed"

      log "🗺️  Regenerating sitemap..."
      node scripts/generate-sitemap.js || handle_error "Sitemap generation failed"

      # Commit changes
      log "📝 Committing published content..."
      git add content/ src/data/ public/sitemap.xml || log "⚠️  Git add failed (continuing)"

      local commit_msg="Auto-publish: ${published_article} (${published_locale^^}) - $(date '+%Y-%m-%d %H:%M')"
      if git commit -m "$commit_msg" 2>/dev/null; then
        log "✅ Content committed to git"
        git push origin master 2>/dev/null || log "⚠️  Git push failed (continuing)"
      fi

      # Build and restart
      log "⏳ Waiting for file system sync..."
      sleep 5

      log "🏗️  Building site..."
      if ! /usr/local/bin/yarn build 2>&1 | tee -a "$LOG_FILE"; then
        handle_error "Build failed"
      fi
      sleep 20

      if command -v pm2 >/dev/null 2>&1; then
        log "🔄 Restarting application..."
        pm2 restart mayorana 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null || log "⚠️  PM2 restart failed"
      fi
      sleep 5

      # Health checks for both locales
      log "🔍 Health check..."
      if curl -sf "$SITE_URL/en/blog" >/dev/null 2>&1; then
        log "✅ EN site responding"
      else
        log "⚠️  EN site health check failed"
      fi

      if curl -sf "$SITE_URL/fr/blog" >/dev/null 2>&1; then
        log "✅ FR site responding"
      else
        log "⚠️  FR site health check failed"
      fi

      # Ping search engines
      log "🔔 Notifying search engines..."
      curl -s "https://www.google.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true
      curl -s "https://www.bing.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true

      # Success notification with locale info
      send_success_notification "$published_locale" "$target_locale" "$published_article"

      log "🎉 Daily publishing completed successfully!"
    else
      log "⚠️  Publish script ran but no new content detected"
    fi
  else
    log "📭 No content to publish today (no articles in any locale)"
  fi

  # Cleanup
  find "$BACKUP_DIR" -name "content-*" -type d -mtime +3 -exec rm -rf {} + 2>/dev/null || true
  log "✅ Daily publishing check completed"
}

# Emergency controls
if [ -f ".publishing-paused" ]; then
  log "⏸️  Publishing paused (.publishing-paused file exists)"
  exit 0
fi

if [ -f ".skip-today" ]; then
  log "⏭️  Skipping today (.skip-today file exists)"
  rm -f ".skip-today"
  exit 0
fi

# Run main function
main "$@"
