// Updated blog data generation script with i18n support
// File: scripts/generate-blog-data.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');
const readingTime = require('reading-time');

// Supported locales
const locales = ['en', 'fr'];

// Function to generate slug from title if not explicitly provided
function generateSlug(title) {
  // Add safety check for title
  if (!title || typeof title !== 'string') {
    console.warn('⚠️  Invalid title provided to generateSlug:', title);
    return 'untitled-post';
  }

  return slugify(title, {
    lower: true,
    strict: true
  });
}

// Function to remove H1 title from content (to avoid duplication)
function removeH1Title(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  // Remove the first H1 heading (usually the title)
  return content.replace(/^#\s+.*$/m, '').trim();
}

// Function to extract headings from markdown content (excluding the first H1)
function extractHeadings(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  let isFirstH1 = true;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    // Skip the first H1 (usually the title)
    if (level === 1 && isFirstH1) {
      isFirstH1 = false;
      continue;
    }

    const id = slugify(text, { lower: true, strict: true });
    headings.push({ id, text, level });
  }

  return headings;
}

// Generate blog data for a specific locale
async function generateBlogDataForLocale(locale) {
  const postsDirectory = path.join(process.cwd(), `content/${locale}/blog/`);
  const outputPath = path.join(process.cwd(), `src/data/blog-posts-${locale}.json`);

  console.log(`📖 Reading ${locale.toUpperCase()} posts from ${postsDirectory}`);

  // Create content directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    console.log(`📁 Created directory: ${postsDirectory}`);

    // Create empty data files for missing locales
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    console.log(`📝 Created empty data files for ${locale}`);
    return { posts: 0, categories: 0 };
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const postsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      try {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        if (!data.title) {
          console.error(`❌ Missing title in ${fileName}, skipping...`);
          return null;
        }

        const slug = data.slug || generateSlug(data.title);
        const contentWithoutTitle = removeH1Title(content);
        const contentHtml = marked(contentWithoutTitle);
        const headings = extractHeadings(contentWithoutTitle);
        const timeStats = readingTime(content);
        const readingTimeText = `${Math.ceil(timeStats.minutes)} min`;

        // **KEY FIX**: Always ensure locale matches the directory we're processing
        return {
          id: data.id || slug,
          slug,
          title: data.title,
          date: data.date || new Date().toISOString().split('T')[0],
          excerpt: data.excerpt || '',
          content: contentWithoutTitle,
          contentHtml,
          author: data.author || 'Anonymous',
          category: data.category || 'uncategorized',
          tags: Array.isArray(data.tags) ? data.tags : [],
          image: data.image,
          readingTime: readingTimeText,
          locale: locale, // **FORCE** locale to match directory, ignore frontmatter
          seo: {
            title: data.seo_title || data.title,
            description: data.meta_description || data.excerpt || '',
            keywords: data.keywords || data.tags || [],
            ogImage: data.og_image || data.image
          },
          headings
        };
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message);
        return null;
      }
    })
    .filter(post => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Write the posts data
  fs.writeFileSync(outputPath, JSON.stringify(postsData, null, 2));

  console.log(`✅ Generated ${locale.toUpperCase()} blog data: ${postsData.length} posts`);

  // **VERIFICATION**: Log locale distribution
  const localeCheck = postsData.reduce((acc, post) => {
    acc[post.locale] = (acc[post.locale] || 0) + 1;
    return acc;
  }, {});
  console.log(`🔍 Locale verification for ${locale}:`, localeCheck);

  return { posts: postsData.length, categories: 0 };
}
// Main function to generate blog data for all locales
async function generateBlogData() {
  console.log('🚀 Starting i18n blog data generation...\n');

  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let totalPosts = 0;
  let totalCategories = 0;

  // Generate data for each locale
  for (const locale of locales) {
    const result = await generateBlogDataForLocale(locale);
    totalPosts += result.posts;
    totalCategories += result.categories;
  }

  // Create fallback files for backward compatibility (uses English data)
  try {
    const englishPosts = require(path.join(process.cwd(), 'src/data/blog-posts-en.json'));
    const englishCategories = require(path.join(process.cwd(), 'src/data/blog-categories-en.json'));

    fs.writeFileSync(
      path.join(process.cwd(), 'src/data/blog-posts.json'),
      JSON.stringify(englishPosts, null, 2)
    );

    fs.writeFileSync(
      path.join(process.cwd(), 'src/data/blog-categories.json'),
      JSON.stringify(englishCategories, null, 2)
    );

    console.log('📄 Created fallback files (blog-posts.json, blog-categories.json)');
  } catch (error) {
    console.warn('⚠️  Could not create fallback files:', error.message);
  }

  console.log(`\n🎉 Blog data generation complete!`);
  console.log(`📊 Total: ${totalPosts} posts, ${totalCategories} categories across ${locales.length} languages`);
  console.log(`📁 Generated files:`);
  locales.forEach(locale => {
    console.log(`   - blog-posts-${locale}.json`);
    console.log(`   - blog-categories-${locale}.json`);
  });
}

// Run the function
generateBlogData().catch(console.error);
