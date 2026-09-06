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

// Strip inline markdown (code spans, bold, italics, links) so a heading reads as
// plain text in the table of contents rather than showing its backticks.
function headingText(raw) {
  return String(raw)
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\*([^*]*)\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

// The anchor a heading gets in the rendered HTML. The table of contents and the
// renderer below must agree on this, or every in-page link 404s silently.
function headingId(raw) {
  return slugify(headingText(raw), { lower: true, strict: true });
}

// marked v15 no longer emits heading ids of its own, so supply them here.
marked.use({
  renderer: {
    heading({ tokens, depth }) {
      const inner = this.parser.parseInline(tokens);
      return `<h${depth} id="${headingId(this.parser.parseInline(tokens, this.parser.textRenderer))}">${inner}</h${depth}>\n`;
    }
  }
});

// Function to extract headings from markdown content (excluding the first H1)
function extractHeadings(content) {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const headings = [];
  // Blank out fenced code blocks first: a shell comment like `# Profiling` is
  // not a heading, and marked does not render it as one, so scraping it here
  // put table-of-contents entries on the page that linked nowhere.
  const scannable = content.replace(/^([ \t]*)(```|~~~)[\s\S]*?^\1?\2[ \t]*$/gm, (m) =>
    m.replace(/[^\n]/g, ' ')
  );
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  let isFirstH1 = true;

  while ((match = headingRegex.exec(scannable)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();

    // Skip the first H1 (usually the title)
    if (level === 1 && isFirstH1) {
      isFirstH1 = false;
      continue;
    }

    headings.push({ id: headingId(text), text: headingText(text), level });
  }

  return headings;
}

// Generate blog data for a specific locale
async function generateBlogDataForLocale(locale) {
  const postsDirectory = path.join(process.cwd(), `content/${locale}/blog/`);
  const outputPath = path.join(process.cwd(), `src/data/blog-posts-${locale}.json`);

  // console.log(`📖 Reading ${locale.toUpperCase()} posts from ${postsDirectory}`);

  // Create content directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    console.log(`📁 Created directory: ${postsDirectory}`);

    // Create empty data files for missing locales
    fs.writeFileSync(outputPath, JSON.stringify([], null, 2));
    console.log(`📝 Created empty data files for ${locale}`);
    return { posts: [], categories: 0 };
  }

  const skipped = [];
  const fileNames = fs.readdirSync(postsDirectory);
  const postsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      try {
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        if (!data.title) {
          // A missing title almost always means malformed front matter (an
          // unterminated `---` block parses as no data at all), which would
          // otherwise drop the post from the site with no visible failure.
          skipped.push(fileName);
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
          // Raw markdown is deliberately NOT emitted: only `contentHtml` is
          // rendered, and the admin editor reads the .md files from disk via
          // /api/admin/files. Including it doubled the size of this payload.
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

  if (skipped.length > 0) {
    throw new Error(
      `${locale}: ${skipped.length} post(s) could not be parsed and would be ` +
      `missing from the site: ${skipped.join(', ')}`
    );
  }

  // Write the posts data
  fs.writeFileSync(outputPath, JSON.stringify(postsData, null, 2));

  console.log(`✅ Generated ${locale.toUpperCase()} blog data: ${postsData.length} posts`);

  // **VERIFICATION**: Log locale distribution
  const localeCheck = postsData.reduce((acc, post) => {
    acc[post.locale] = (acc[post.locale] || 0) + 1;
    return acc;
  }, {});
  // console.log(`🔍 Locale verification for ${locale}:`, localeCheck);

  return { posts: postsData, categories: 0 };
}
/**
 * Link each post to its counterpart in the other locale, in place.
 *
 * This is the single definition of the pairing rule: French posts either reuse
 * the English id/slug or suffix it with '-fr'. It used to be written out twice
 * — once in src/lib/blog.ts for the page's hreflang, once in
 * scripts/generate-sitemap.js for the sitemap's — and the two agreeing was a
 * matter of keeping them in step by hand. Both now read `counterpart` from the
 * generated data instead, so they cannot drift apart.
 *
 * A pair is written on both posts or on neither, so the alternates are always
 * symmetric and never point at a post that does not exist.
 */
function linkCounterparts(byLocale) {
  const en = byLocale.en || [];
  const fr = byLocale.fr || [];
  const frById = new Map(fr.map((p) => [p.id, p]));
  const frBySlug = new Map(fr.map((p) => [p.slug, p]));
  const taken = new Set();
  let paired = 0;

  for (const post of en) {
    const match =
      frById.get(`${post.id}-fr`) ||
      frById.get(post.id) ||
      frBySlug.get(`${post.slug}-fr`) ||
      frBySlug.get(post.slug);
    // One English post per French post: without this a second English post
    // sharing an id would claim a counterpart already spoken for, and the
    // French side would disagree about who its partner is.
    if (!match || taken.has(match.slug)) continue;
    taken.add(match.slug);
    post.counterpart = { locale: 'fr', slug: match.slug };
    match.counterpart = { locale: 'en', slug: post.slug };
    paired++;
  }

  console.log(`\u{1F517} Linked ${paired} post pair(s) across locales`);
  return paired;
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

  // Build every locale first, link the pairs, then write: the counterpart of a
  // post lives in the other locale's set, so nothing can be written until both
  // sets exist.
  const byLocale = {};
  for (const locale of locales) {
    const result = await generateBlogDataForLocale(locale);
    byLocale[locale] = result.posts;
    totalPosts += result.posts.length;
    totalCategories += result.categories;
  }

  linkCounterparts(byLocale);

  for (const locale of locales) {
    fs.writeFileSync(
      path.join(process.cwd(), `src/data/blog-posts-${locale}.json`),
      JSON.stringify(byLocale[locale], null, 2)
    );
  }

  // Create fallback files (posts only)
  try {
    const englishPosts = require(path.join(process.cwd(), 'src/data/blog-posts-en.json'));

    fs.writeFileSync(
      path.join(process.cwd(), 'src/data/blog-posts.json'),
      JSON.stringify(englishPosts, null, 2)
    );

    console.log('📄 Created fallback file (blog-posts.json)');
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
