#!/bin/bash
# Simplified Daily Publishing Script - Multi-language support
# File: scripts/daily-publish.sh

set -e

# Configuration
REPO_DIR=$(pwd)
LOG_FILE="/var/log/blog-publishing.log"
BACKUP_DIR="/tmp/blog-backup"
SITE_URL="https://mayorana.ch"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling function
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

# Success notification function
send_success_notification() {
  local published_count="$1"
  local published_summary="$2"

  local message="✅ Daily blog publishing completed! 📝 Published $published_count articles: $published_summary"

  if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data '{"text":"'"$message"'"}' \
      "$SLACK_WEBHOOK_URL" || true
  fi

  log "$message"
}

main() {
  log "🚀 Starting multi-language daily publishing..."
  log "📅 $(date '+%A, %B %d, %Y')"

  # Validate environment
  if [ ! -f "package.json" ] || [ ! -d "content" ]; then
    handle_error "Not in mayorana project directory"
  fi

  # Check for multi-language publisher
  if [ ! -f "scripts/multi-lang-publisher.js" ]; then
    handle_error "Multi-language publisher script not found"
  fi

  # Check for publishing config
  if [ ! -f "config/publishing.yaml" ]; then
    log "⚠️  Publishing config not found, using defaults"
  fi

  # Backup content
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

  # Show status before publishing
  log "🔍 Pre-publishing status:"
  node scripts/multi-lang-publisher.js status | tee -a "$LOG_FILE"

  # Attempt to publish articles
  log "📝 Running multi-language publisher..."
  
  local publish_output
  publish_output=$(node scripts/multi-lang-publisher.js publish 2>&1)
  local publish_exit_code=$?

  # Log the publisher output
  echo "$publish_output" | tee -a "$LOG_FILE"

  if [ $publish_exit_code -eq 0 ]; then
    log "✅ Multi-language publisher completed successfully"

    # Parse results from output
    local published_count=0
    local published_summary=""
    
    if echo "$publish_output" | grep -q "Successfully published:"; then
      published_count=$(echo "$publish_output" | grep "Successfully published:" | sed 's/.*Successfully published: \([0-9]*\).*/\1/')
      
      # Extract the published articles summary
      if echo "$publish_output" | grep -q "Published articles:"; then
        published_summary=$(echo "$publish_output" | sed -n '/Published articles:/,/^$/p' | grep "   -" | sed 's/   - //' | tr '\n' ', ' | sed 's/, $//')
      fi
    fi

    # Check if anything was actually published
    if [ "$published_count" -gt 0 ]; then
      log "✅ Published $published_count articles"
      
      # Regenerate blog data
      log "🔄 Regenerating blog data..."
      if node scripts/generate-blog-data.js 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Blog data regenerated"
      else
        handle_error "Blog data generation failed"
      fi

      # Regenerate sitemap
      log "🗺️  Regenerating sitemap..."
      if node scripts/generate-sitemap.js 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ Sitemap regenerated"
      else
        handle_error "Sitemap generation failed"
      fi

      # Commit changes
      log "📝 Committing published content..."
      git add content/ src/data/ public/sitemap.xml 2>/dev/null || log "⚠️  Git add failed (continuing)"

      local commit_msg="Auto-publish: $published_count articles - $(date '+%Y-%m-%d %H:%M')"
      if git commit -m "$commit_msg" 2>/dev/null; then
        log "✅ Content committed to git"
        if git push origin master 2>/dev/null; then
          log "✅ Changes pushed to repository"
        else
          log "⚠️  Git push failed (continuing)"
        fi
      else
        log "⚠️  Git commit failed (no changes to commit)"
      fi

      # Build and restart
      log "⏳ Waiting for file system sync..."
      sleep 5

      log "🏗️  Building site..."
      if yarn build 2>&1 | tee -a "$LOG_FILE"; then
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

      # Health check
      log "🔍 Health check..."
      if curl -sf "$SITE_URL/en/blog" >/dev/null 2>&1; then
        log "✅ Site responding"
      else
        log "⚠️  Site health check failed"
      fi

      # Ping search engines
      log "🔔 Notifying search engines..."
      curl -s "https://www.google.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true
      curl -s "https://www.bing.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true
      log "✅ Search engines notified"

      # Send success notification
      send_success_notification "$published_count" "$published_summary"
      
      log "🎉 Daily publishing completed successfully!"
    else
      log "📭 No articles were published (all queues empty or failed)"
    fi
  else
    log "❌ Multi-language publisher failed with exit code: $publish_exit_code"
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
