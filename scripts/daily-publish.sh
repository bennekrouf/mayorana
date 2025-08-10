#!/bin/bash
# Simple Daily Publishing Script
set -e

# Configuration
REPO_DIR=$(pwd)
LOG_FILE="/var/log/blog-publishing.log"
SITE_URL="https://mayorana.ch"

# Logging function
log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling
handle_error() {
  local error_msg="$1"
  log "❌ ERROR: $error_msg"
  exit 1
}

main() {
  log "🚀 Starting simple daily publishing..."

  # Check environment
  if [ ! -f "scripts/publisher.js" ]; then
    handle_error "publisher.js not found"
  fi

  # Show status
  log "📊 Current status:"
  node scripts/publisher.js status | tee -a "$LOG_FILE"

  # Try to publish one article
  log "📝 Attempting to publish..."

  local publish_output
  publish_output=$(node scripts/publisher.js publish 2>&1)
  local publish_exit_code=$?

  echo "$publish_output" | tee -a "$LOG_FILE"

  if [ $publish_exit_code -eq 0 ] && echo "$publish_output" | grep -q "🎉 Published:"; then
    # Success - something was published
    local published_title=$(echo "$publish_output" | grep "🎉 Published:" | sed 's/.*🎉 Published: //')
    log "✅ Successfully published: $published_title"

    # Regenerate data
    log "🔄 Regenerating blog data..."
    if node scripts/generate-blog-data.js; then
      log "✅ Blog data regenerated"
    else
      handle_error "Blog data generation failed"
    fi

    # Regenerate sitemap
    log "🗺️  Regenerating sitemap..."
    if node scripts/generate-sitemap.js; then
      log "✅ Sitemap regenerated"
    else
      handle_error "Sitemap generation failed"
    fi

    # Commit and push
    log "📝 Committing changes..."
    git add content/ src/data/ public/sitemap.xml 2>/dev/null || true

    local commit_msg="Auto-publish: $published_title - $(date '+%Y-%m-%d %H:%M')"
    if git commit -m "$commit_msg" 2>/dev/null; then
      log "✅ Changes committed"
      git push origin master 2>/dev/null || log "⚠️  Push failed"
    fi

    # Build and restart
    log "🏗️  Building..."
    if yarn build; then
      log "✅ Build successful"
    else
      handle_error "Build failed"
    fi

    # Restart if PM2 available
    if command -v pm2 >/dev/null 2>&1; then
      log "🔄 Restarting..."
      pm2 restart mayorana 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null || true
    fi

    # Health check
    sleep 10
    if curl -sf "$SITE_URL/en/blog" >/dev/null 2>&1; then
      log "✅ Site healthy"
    else
      log "⚠️  Health check failed"
    fi

    # Notify search engines
    curl -s "https://www.google.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true
    curl -s "https://www.bing.com/ping?sitemap=$SITE_URL/sitemap.xml" >/dev/null 2>&1 || true

    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
      curl -s -X POST -H 'Content-type: application/json' \
        --data '{"text":"✅ Published: '"$published_title"'"}' \
        "$SLACK_WEBHOOK_URL" || true
    fi

    log "🎉 Publishing completed successfully!"
  else
    log "📭 No articles to publish (all queues empty)"
  fi
}

# Emergency controls
if [ -f ".publishing-paused" ]; then
  log "⏸️  Publishing paused"
  exit 0
fi

if [ -f ".skip-today" ]; then
  log "⏭️  Skipping today"
  rm -f ".skip-today"
  exit 0
fi

# Run
main "$@"
