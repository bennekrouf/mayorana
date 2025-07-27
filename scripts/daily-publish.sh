#!/bin/bash
# Daily Publishing Script with i18n support
# File: scripts/daily-publish.sh
#
# This script runs daily at 9 AM to automatically publish queued content
# Now supports content/en and content/fr structure

set -e # Exit on any error

# Configuration with smart defaults
REPO_DIR=$(pwd)
LOG_FILE="/var/log/blog-publishing.log"
BACKUP_DIR="/tmp/blog-backup"
SITE_URL="https://mayorana.ch"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling with cleanup
handle_error() {
  log "❌ ERROR: $1"

  # Send simple notification if webhook exists
  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data '{"text":"🚨 Blog auto-publish failed: '"$1"'"}' \
      "$SLACK_WEBHOOK_URL" || true
  fi

  exit 1
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "content" ]; then
  handle_error "Not in mayorana project directory"
fi

# Main publishing logic
main() {
  log "🚀 Starting daily publishing check..."

  # Create backup (simple, no fancy setup needed)
  if [ -d "content" ]; then
    mkdir -p "$BACKUP_DIR"
    cp -r content/ "$BACKUP_DIR/content-$(date +%Y%m%d_%H%M%S)/" || log "⚠️ Backup failed (continuing)"
  fi

  # Pull latest changes (ignore errors if no remote)
  log "📥 Checking for new content..."
  git pull origin master 2>/dev/null || log "⚠️ Git pull failed (continuing)"

  # Check if we should publish today using our CLI
  log "🔍 Checking if we should publish today..."

  if ! node scripts/blog-cli.js status --quiet >/dev/null 2>&1; then
    log "⚠️ CLI not working, skipping publish"
    exit 0
  fi

  # Try to publish using our scheduling system
  log "📝 Attempting to publish today's article..."

  if node scripts/schedule-publish.js --publish 2>/dev/null; then
    log "✅ Article published successfully!"

    # Regenerate blog data and sitemap
    log "🔄 Regenerating blog data..."
    node scripts/generate-blog-data.js || handle_error "Blog data generation failed"

    log "🗺️ Regenerating sitemap..."
    node scripts/generate-sitemap.js || handle_error "Sitemap generation failed"

    # Commit the new content - updated for i18n structure
    log "📝 Committing published content..."
    git add content/en/blog/ content/fr/blog/ content/queue/ src/data/ public/sitemap.xml || log "⚠️ Git add failed (continuing)"

    # Get the published article name for commit message - check both locales
    PUBLISHED_ARTICLE=""
    if [ -d "content/en/blog" ]; then
      PUBLISHED_ARTICLE=$(ls content/en/blog/*.md 2>/dev/null | tail -1 | xargs basename 2>/dev/null || echo "")
    fi
    if [ -z "$PUBLISHED_ARTICLE" ] && [ -d "content/fr/blog" ]; then
      PUBLISHED_ARTICLE=$(ls content/fr/blog/*.md 2>/dev/null | tail -1 | xargs basename 2>/dev/null || echo "")
    fi
    if [ -z "$PUBLISHED_ARTICLE" ]; then
      PUBLISHED_ARTICLE="article"
    fi

    if git commit -m "Auto-publish: ${PUBLISHED_ARTICLE%.md} - $(date '+%Y-%m-%d %H:%M')" 2>/dev/null; then
      log "✅ Content committed to git"

      # Try to push (ignore failures in case of network issues)
      if git push origin master 2>/dev/null; then
        log "✅ Changes pushed to repository"
      else
        log "⚠️ Git push failed (continuing)"
      fi
    else
      log "⚠️ Git commit failed (continuing)"
    fi

    # Wait for file system to sync before building
    log "⏳ Waiting for file system to sync..."
    sleep 5

    # Build the site
    log "🏗️ Building site..."
    if ! /usr/local/bin/yarn build 2>&1 | tee -a "$LOG_FILE"; then
      handle_error "Build failed - check logs above"
    fi
    sleep 20

    # Restart PM2 if it's running
    if command -v pm2 >/dev/null 2>&1; then
      log "🔄 Restarting application..."
      pm2 restart mayorana 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null || log "⚠️ PM2 restart failed"
    fi

    # Wait a moment for restart
    sleep 5

    # Basic health check - test both locales
    log "🔍 Health check..."
    if curl -sf "$SITE_URL/en/blog" >/dev/null 2>&1; then
      log "✅ English site is responding"
    else
      log "⚠️ English site health check failed"
    fi

    if curl -sf "$SITE_URL/fr/blog" >/dev/null 2>&1; then
      log "✅ French site is responding"
    else
      log "⚠️ French site health check failed"
    fi

    # Ping search engines (ignore failures)
    log "🔔 Notifying search engines..."
    curl -s "https://www.google.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true
    curl -s "https://www.bing.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true

    # Success notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
      curl -s -X POST -H 'Content-type: application/json' \
        --data '{"text":"✅ Daily blog published successfully! 🎉"}' \
        "$SLACK_WEBHOOK_URL" || true
    fi

    log "🎉 Daily publishing completed successfully!"

  else
    log "📭 No content to publish today"
  fi

  # Cleanup old backups (keep last 3 days)
  find "$BACKUP_DIR" -name "content-*" -type d -mtime +3 -exec rm -rf {} + 2>/dev/null || true

  log "✅ Daily publishing check completed"
}

# Emergency controls check
if [ -f ".publishing-paused" ]; then
  log "⏸️ Publishing is paused (.publishing-paused file exists)"
  exit 0
fi

if [ -f ".skip-today" ]; then
  log "⏭️ Skipping today (.skip-today file exists)"
  rm -f ".skip-today" # Auto-remove so it only skips once
  exit 0
fi

# Run main function
main "$@"
