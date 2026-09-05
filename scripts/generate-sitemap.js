// Sitemap generation.
// File: scripts/generate-sitemap.js
//
// Every URL here is one the site actually serves. That means locale-prefixed:
// /apps 307-redirects to /en/apps, and a sitemap full of redirects wastes the
// crawl budget it exists to direct. Both locales are listed — the French half
// of the site used to be absent entirely, because the generator read the
// English-only fallback blog data file.

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const BASE_URL = 'https://mayorana.ch';
const LOCALES = ['en', 'fr'];

// Non-blog routes below the locale segment, listed here so adding a page is a
// one-line change. '' is the locale home page.
const STATIC_PAGES = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: '/solutions/azure', changefreq: 'weekly', priority: '0.9' },
  { path: '/solutions/ai-agents', changefreq: 'weekly', priority: '0.9' },
  { path: '/apps', changefreq: 'weekly', priority: '0.9' },
  { path: '/services', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
];

const today = new Date().toISOString().split('T')[0];

// Read the per-tool page slugs straight out of the catalogue, so a tool added
// to src/data/tools.ts appears in the sitemap without a second edit here.
function readToolSlugs() {
  const toolsPath = path.join(process.cwd(), 'src/data/tools.ts');
  try {
    const source = fs.readFileSync(toolsPath, 'utf8');
    const slugs = [...source.matchAll(/^\s{4}id: '([a-z0-9-]+)',$/gm)].map((m) => m[1]);
    if (slugs.length === 0) throw new Error('no tool ids matched');
    console.log(`✅ Found ${slugs.length} tool pages`);
    return slugs;
  } catch (error) {
    console.warn('⚠️  Could not read tool slugs:', error.message);
    return [];
  }
}

// Posts per locale. The unsuffixed blog-posts.json is an English-only fallback
// copy, so it is read last and only if the real per-locale file is missing.
function readPostsForLocale(locale) {
  const candidates = [
    path.join(process.cwd(), `src/data/blog-posts-${locale}.json`),
    ...(locale === 'en' ? [path.join(process.cwd(), 'src/data/blog-posts.json')] : []),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    try {
      const posts = JSON.parse(fs.readFileSync(file, 'utf8'));
      console.log(`✅ ${locale}: ${posts.length} posts from ${path.basename(file)}`);
      return posts;
    } catch (error) {
      console.warn(`⚠️  Error reading ${path.basename(file)}:`, error.message);
    }
  }

  console.log(`📁 ${locale}: no JSON data, scanning content/${locale}/blog...`);
  return scanContentDirectory(locale);
}

function scanContentDirectory(locale) {
  const dir = path.join(process.cwd(), `content/${locale}/blog`);
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return [];
  }

  const posts = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    try {
      const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      posts.push({
        slug: data.slug || file.replace('.md', ''),
        date: data.date,
        tags: data.tags || [],
      });
    } catch (error) {
      console.warn(`⚠️  Error processing ${file}:`, error.message);
    }
  }
  console.log(`✅ ${locale}: direct scan found ${posts.length} posts`);
  return posts;
}

// Must match the slug the app builds in TagFilter/BlogPost, then be
// percent-encoded: the sitemap spec requires escaped URLs, and French tags
// like "mémoire" are not ASCII.
const tagSlug = (tag) =>
  encodeURIComponent(String(tag).toLowerCase().replace(/\s+/g, '-'));

// <lastmod> is what tells a crawler a URL is worth revisiting. Posts carry a
// real date; everything else uses the build date, which is when the deployed
// content last changed.
function urlEntry({ loc, changefreq, priority, lastmod }) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  const toolSlugs = readToolSlugs();
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const counts = { static: 0, tools: 0, posts: 0, tags: 0 };

  for (const locale of LOCALES) {
    const prefix = `${BASE_URL}/${locale}`;

    sitemap += `
  <!-- ${locale}: static pages -->`;
    for (const page of STATIC_PAGES) {
      sitemap += urlEntry({
        loc: `${prefix}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
      });
      counts.static++;
    }

    sitemap += `
  <!-- ${locale}: tool pages -->`;
    for (const slug of toolSlugs) {
      sitemap += urlEntry({ loc: `${prefix}/apps/${slug}`, changefreq: 'weekly', priority: '0.9' });
      counts.tools++;
    }

    const posts = readPostsForLocale(locale);
    const tags = new Set();

    sitemap += `
  <!-- ${locale}: blog posts -->`;
    for (const post of posts) {
      sitemap += urlEntry({
        loc: `${prefix}/blog/${post.slug}`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: post.date ? String(post.date).split('T')[0] : undefined,
      });
      counts.posts++;
      for (const tag of post.tags || []) tags.add(tagSlug(tag));
    }

    sitemap += `
  <!-- ${locale}: tag pages -->`;
    for (const tag of tags) {
      sitemap += urlEntry({ loc: `${prefix}/blog/tag/${tag}`, changefreq: 'weekly', priority: '0.5' });
      counts.tags++;
    }
  }

  sitemap += `
</urlset>`;

  const total = counts.static + counts.tools + counts.posts + counts.tags;
  console.log(`✅ Generated sitemap with ${total} URLs across ${LOCALES.length} locales`);
  console.log(`   - Static pages: ${counts.static}`);
  console.log(`   - Tool pages:   ${counts.tools}`);
  console.log(`   - Blog posts:   ${counts.posts}`);
  console.log(`   - Tag pages:    ${counts.tags}`);

  return sitemap;
}

async function writeSitemap() {
  try {
    const sitemap = await generateSitemap();
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated successfully at public/sitemap.xml');
    return true;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    return false;
  }
}

if (require.main === module) {
  writeSitemap().catch(console.error);
}

module.exports = { generateSitemap, writeSitemap };
