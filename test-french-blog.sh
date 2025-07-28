# Test script to verify French blog is working
echo "🧪 Testing French Blog Setup..."
echo ""

# 1. Check French blog data
echo "1️⃣ Checking French blog data:"
if [ -f "src/data/blog-posts-fr.json" ]; then
  echo "✅ French data file exists"
  FRENCH_POSTS=$(cat src/data/blog-posts-fr.json | jq length 2>/dev/null || echo "?")
  echo "📊 French posts: $FRENCH_POSTS"

  # Show first French post
  echo "📄 First French post:"
  cat src/data/blog-posts-fr.json | jq '.[0] | {title, locale, slug}' 2>/dev/null || echo "No posts or jq not available"
else
  echo "❌ French data file missing"
fi
echo ""

# 2. Check French messages
echo "2️⃣ Checking French messages:"
if [ -f "messages/fr.json" ]; then
  echo "✅ French messages exist"
else
  echo "❌ French messages missing"
fi
echo ""

# 3. Check French content source
echo "3️⃣ Checking French content source:"
if [ -d "content/fr/blog" ]; then
  FR_FILES=$(ls content/fr/blog/*.md 2>/dev/null | wc -l)
  echo "✅ French content directory exists with $FR_FILES files"

  if [ $FR_FILES -gt 0 ]; then
    echo "📄 First French file frontmatter:"
    FIRST_FILE=$(ls content/fr/blog/*.md 2>/dev/null | head -1)
    head -10 "$FIRST_FILE" 2>/dev/null | grep -E "^(title|locale|slug|date):" || echo "No frontmatter found"
  fi
else
  echo "❌ French content directory missing"
fi
echo ""

# 4. Quick test commands
echo "4️⃣ Quick tests to run:"
echo "🔧 Regenerate blog data:"
echo "   node scripts/generate-blog-data.js"
echo ""
echo "🔧 Restart dev server:"
echo "   rm -rf .next && npm run dev"
echo ""
echo "🔧 Test URLs:"
echo "   English: http://localhost:3000/en/blog"
echo "   French:  http://localhost:3000/fr/blog"
echo ""

# 5. Expected debug output
echo "5️⃣ Expected debug output for French:"
echo "Expected in console:"
echo "   🔍 LocaleLayout - received locale: fr"
echo "   🔍 BlogPage Debug: - Received locale: fr"
echo "   📊 Blog Data: - Posts found: 1 (or more)"
echo "   📊 Blog Data: - First post locale: fr"
