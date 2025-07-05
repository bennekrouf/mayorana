#!/bin/bash
# Deployment Fix Script - Ensures blog data and sitemap are generated
# File: scripts/deploy-fix.sh

set -e

echo "🚀 Starting deployment fix..."

# Ensure we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Not in project root directory"
  exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p src/data
mkdir -p public
mkdir -p content/{blog,queue,drafts}

# Generate blog data first
echo "📊 Generating blog data..."
if [ -f "scripts/generate-blog-data.js" ]; then
  node scripts/generate-blog-data.js
  echo "✅ Blog data generated"
else
  echo "⚠️  Blog data generator not found, creating minimal data..."
  echo "[]" >src/data/blog-posts.json
  echo "[]" >src/data/blog-categories.json
fi

# Generate sitemap
echo "🗺️  Generating sitemap..."
if [ -f "scripts/generate-sitemap.js" ]; then
  node scripts/generate-sitemap.js
  echo "✅ Sitemap generated"
else
  echo "❌ Sitemap generator not found"
  exit 1
fi

# Verify files were created
echo "🔍 Verifying generated files..."

if [ -f "src/data/blog-posts.json" ]; then
  POSTS_COUNT=$(cat src/data/blog-posts.json | jq length 2>/dev/null || echo "unknown")
  echo "✅ Blog posts JSON exists (${POSTS_COUNT} posts)"
else
  echo "❌ Blog posts JSON missing"
  exit 1
fi

if [ -f "public/sitemap.xml" ]; then
  URLS_COUNT=$(grep -c "<url>" public/sitemap.xml || echo "unknown")
  echo "✅ Sitemap exists (${URLS_COUNT} URLs)"
else
  echo "❌ Sitemap missing"
  exit 1
fi

echo "✅ Deployment fix completed successfully!"
echo ""
echo "📋 Summary:"
echo "   - Blog posts: ${POSTS_COUNT}"
echo "   - Sitemap URLs: ${URLS_COUNT}"
echo "   - Ready for deployment"
