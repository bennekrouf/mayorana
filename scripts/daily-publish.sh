#!/bin/bash
# Daily Publishing Script with Fixed Detection Logic
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

  local published_upper=$(echo "$published_locale" | tr '[:lower:]' '[:upper:]')
  local target_upper=$(echo "$target_locale" | tr '[:lower:]' '[:upper:]')

  local locale_status=""
  if [ "$published_locale" = "$target_locale" ]; then
    locale_status="🎯 on schedule"
  else
    locale_status="🔄 fallback (target was $target_upper)"
  fi

  local message="✅ Daily blog published! 📝 $published_upper article: \"$article_name\" ($locale_status)"

  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data '{"text":"'"$message"'"}' \
      "$SLACK_WEBHOOK_URL" || true
  fi

  log "$message"
}

# Count queue files before publishing
count_queue_files() {
  local locale="$1"
  local queue_dir="content/${locale}/queue"

  if [ -d "$queue_dir" ]; then
    find "$queue_dir" -name "*.md" | wc -l
  else
    echo "0"
  fi
}

main() {
  local target_locale=$(get_target_locale)
  local target_locale_upper=$(echo "$target_locale" | tr '[:lower:]' '[:upper:]')
  log "🚀 Starting daily publishing check..."
  log "📅 Day $(date +%j) of year - Target locale: $target_locale_upper"

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
  log "📥 Pulling latest changes..."
  if git pull origin master 2>/dev/null; then
    log "✅ Git pull successful"
  else
    log "⚠️  Git pull failed (continuing)"
  fi

  # Count queue files BEFORE publishing
  local en_queue_before=$(count_queue_files "en")
  local fr_queue_before=$(count_queue_files "fr")

  log "🔍 Queue status before publishing:"
  log "   EN queue: $en_queue_before files"
  log "   FR queue: $fr_queue_before files"

  # Check if we have anything to publish
  if [ "$en_queue_before" -eq 0 ] && [ "$fr_queue_before" -eq 0 ]; then
    log "📭 No content to publish (queues are empty)"
    exit 0
  fi

  log "🎯 Publishing plan:"
  log "   Target: $target_locale_upper"

  # Attempt to publish
  log "📝 Attempting to publish..."

  # Run the publish script and capture its success/failure
  if node scripts/schedule-publish.js --publish 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ Publish script completed successfully"

    # Count queue files AFTER publishing to detect what was moved
    local en_queue_after=$(count_queue_files "en")
    local fr_queue_after=$(count_queue_files "fr")

    log "📊 Queue status after publishing:"
    log "   EN queue: $en_queue_after files (was $en_queue_before)"
    log "   FR queue: $fr_queue_after files (was $fr_queue_before)"

    local published_locale=""
    local published_article=""

    # Detect which locale had a file moved
    if [ "$en_queue_after" -lt "$en_queue_before" ]; then
      published_locale="en"
      # Get the most recently added file in EN blog
      if [ -d "content/en/blog" ]; then
        published_article=$(ls -t content/en/blog/*.md 2>/dev/null | head -1 | xargs basename 2>/dev/null | sed 's/\.md$//' || echo "unknown")
      fi
    elif [ "$fr_queue_after" -lt "$fr_queue_before" ]; then
      published_locale="fr"
      # Get the most recently added file in FR blog
      if [ -d "content/fr/blog" ]; then
        published_article=$(ls -t content/fr/blog/*.md 2>/dev/null | head -1 | xargs basename 2>/dev/null | sed 's/\.md$//' || echo "unknown")
      fi
    fi

    if [ -n "$published_locale" ]; then
      local published_locale_upper=$(echo "$published_locale" | tr '[:lower:]' '[:upper:]')
      log "✅ Article published successfully!"
      log "📝 Published: $published_article ($published_locale_upper)"

      # Regenerate data
      log "🔄 Regenerating blog data..."
      if node scripts/generate-blog-data.js 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Blog data regenerated"
      else
        handle_error "Blog data generation failed"
      fi

      log "🗺️  Regenerating sitemap..."
      if node scripts/generate-sitemap.js 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Sitemap regenerated"
      else
        handle_error "Sitemap generation failed"
      fi

      # Commit changes
      log "📝 Committing published content..."
      git add content/ src/data/ public/sitemap.xml 2>/dev/null || log "⚠️  Git add failed (continuing)"

      local commit_msg="Auto-publish: ${published_article} ($published_locale_upper) - $(date '+%Y-%m-%d %H:%M')"
      if git commit -m "$commit_msg" 2>/dev/null; then
        log "✅ Content committed to git"
        if git push origin master 2>/dev/null; then
          log "✅ Changes pushed to repository"
        else
          log "⚠️  Git push failed (continuing)"
        fi
      else
        log "⚠️  Git commit failed (continuing)"
      fi

      # Build and restart
      log "⏳ Waiting for file system sync..."
      sleep 5

      log "🏗️  Building site..."
      if /usr/local/bin/yarn build 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Site built successfully"
      else
        handle_error "Build failed"
      fi

      # Wait for build to complete
      sleep 10

      # Restart PM2 if available
      if command -v pm2 >/dev/null 2>&1; then
        log "🔄 Restarting application..."
        if pm2 restart mayorana 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null; then
          log "✅ Application restarted"
        else
          log "⚠️  PM2 restart failed"
        fi
      fi

      # Wait for restart
      sleep 10

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
      log "✅ Search engines notified"

      # Success notification with locale info
      send_success_notification "$published_locale" "$target_locale" "$published_article"

      log "🎉 Daily publishing completed successfully!"
    else
      log "⚠️  Publish script ran but no queue reduction detected"
      log "🔍 Debug: EN queue $en_queue_before->$en_queue_after, FR queue $fr_queue_before->$fr_queue_after"
    fi
  else
    log "❌ Publish script failed"
    exit 1
  fi

  # Cleanup old backups
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
