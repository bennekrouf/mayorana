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
const DEFAULT_LOCALE = 'en';

// Non-blog routes below the locale segment, listed here so adding a page is a
// one-line change. '' is the locale home page.
const STATIC_PAGES = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: '/solutions/azure', changefreq: 'weekly', priority: '0.9' },
  { path: '/solutions/ai-agents', changefreq: 'weekly', priority: '0.9' },
  { path: '/apps', changefreq: 'weekly', priority: '0.9' },
  { path: '/founding', changefreq: 'monthly', priority: '0.6' },
  { path: '/services', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/contact', changefreq: 'monthly', priority: '0.7' },
  { path: '/blog', changefreq: 'daily', priority: '0.9' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
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

// Release-notes pages, dated by the day the tool last shipped rather than by
// the day the site was built. That date is the whole point of these URLs: it is
// what tells a crawler this page changed since it last looked, and a build date
// on every page says the opposite of what is true. Snapshots come from
// scripts/fetch-releases.js.
function readReleaseDates() {
  const dir = path.join(process.cwd(), 'src/data/releases');
  const dates = {};
  if (!fs.existsSync(dir)) return dates;

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const id = file.replace(/\.json$/, '');
    try {
      const feed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const newest = (feed.releases || [])[0];
      if (newest && newest.date) dates[id] = String(newest.date).split('T')[0];
    } catch (error) {
      console.warn(`⚠️  Could not read releases for ${id}:`, error.message);
    }
  }
  console.log(`✅ Found release notes for ${Object.keys(dates).length} tools`);
  return dates;
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
// hreflang for one URL. `alternates` maps locale -> URL and is only ever built
// from pages proven to exist in both locales, because an hreflang pointing at a
// 404 is worse than emitting none. x-default goes to the default locale.
function alternateLinks(alternates) {
  if (!alternates) return '';
  const links = LOCALES.filter((l) => alternates[l]).map(
    (l) => `
    <xhtml:link rel="alternate" hreflang="${l}" href="${alternates[l]}"/>`,
  );
  if (links.length < 2) return '';
  return (
    links.join('') +
    `
    <xhtml:link rel="alternate" hreflang="x-default" href="${alternates[DEFAULT_LOCALE]}"/>`
  );
}

function urlEntry({ loc, changefreq, priority, lastmod, alternates }) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${alternateLinks(alternates)}
  </url>`;
}

// Read the en/fr pairing that linkCounterparts() in scripts/generate-blog-data.js
// wrote onto each post. That script is the single place the rule lives; deriving
// the '-fr' suffix a second time here is how the sitemap and the pages' own
// hreflang drifted apart in the first place. Posts coming from the front-matter
// fallback scan carry no counterpart, so that path simply emits no alternates.
function pairPosts(byLocale) {
  const pairs = new Map(); // `${locale}:${slug}` -> { en, fr }
  for (const locale of LOCALES) {
    for (const post of byLocale[locale] || []) {
      if (!post.counterpart) continue;
      pairs.set(`${locale}:${post.slug}`, {
        [locale]: `${BASE_URL}/${locale}/blog/${post.slug}`,
        [post.counterpart.locale]: `${BASE_URL}/${post.counterpart.locale}/blog/${post.counterpart.slug}`,
      });
    }
  }
  return pairs;
}

// A page at the same path in every locale: /en/apps and /fr/apps are the same
// page, so they are always a valid hreflang set.
const sameInEveryLocale = (path) =>
  Object.fromEntries(LOCALES.map((l) => [l, `${BASE_URL}/${l}${path}`]));

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...');

  const toolSlugs = readToolSlugs();
  const releaseDates = readReleaseDates();
  const postsByLocale = Object.fromEntries(
    LOCALES.map((locale) => [locale, readPostsForLocale(locale)]),
  );
  const postPairs = pairPosts(postsByLocale);
  // A tag page exists in a locale only if some post there carries the tag, so
  // pair tags on an exact slug match across the two tag sets.
  const tagsByLocale = Object.fromEntries(
    LOCALES.map((locale) => [
      locale,
      new Set((postsByLocale[locale] || []).flatMap((p) => (p.tags || []).map(tagSlug))),
    ]),
  );
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  const counts = { static: 0, tools: 0, releases: 0, posts: 0, tags: 0 };

  for (const locale of LOCALES) {
    const prefix = `${BASE_URL}/${locale}`;

    sitemap += `
  <!-- ${locale}: static pages -->`;
    for (const page of STATIC_PAGES) {
      sitemap += urlEntry({
        loc: `${prefix}${page.path}`,
        changefreq: page.changefreq,
        priority: page.priority,
        alternates: sameInEveryLocale(page.path),
      });
      counts.static++;
    }

    sitemap += `
  <!-- ${locale}: tool pages -->`;
    for (const slug of toolSlugs) {
      sitemap += urlEntry({
        loc: `${prefix}/apps/${slug}`,
        changefreq: 'weekly',
        priority: '0.9',
        alternates: sameInEveryLocale(`/apps/${slug}`),
      });
      counts.tools++;

      // Only tools that actually publish notes: the route 404s for the others,
      // and a sitemap must not list a URL the site will not serve.
      if (releaseDates[slug]) {
        sitemap += urlEntry({
          loc: `${prefix}/apps/${slug}/releases`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: releaseDates[slug],
          alternates: sameInEveryLocale(`/apps/${slug}/releases`),
        });
        counts.releases++;
      }
    }

    const posts = postsByLocale[locale];
    const tags = tagsByLocale[locale];

    sitemap += `
  <!-- ${locale}: blog posts -->`;
    for (const post of posts) {
      sitemap += urlEntry({
        loc: `${prefix}/blog/${post.slug}`,
        changefreq: 'monthly',
        priority: '0.8',
        lastmod: post.date ? String(post.date).split('T')[0] : undefined,
        alternates: postPairs.get(`${locale}:${post.slug}`),
      });
      counts.posts++;
    }

    sitemap += `
  <!-- ${locale}: tag pages -->`;
    for (const tag of tags) {
      const inEveryLocale = LOCALES.every((l) => tagsByLocale[l].has(tag));
      sitemap += urlEntry({
        loc: `${prefix}/blog/tag/${tag}`,
        changefreq: 'weekly',
        priority: '0.5',
        alternates: inEveryLocale ? sameInEveryLocale(`/blog/tag/${tag}`) : undefined,
      });
      counts.tags++;
    }
  }

  sitemap += `
</urlset>`;

  const total = counts.static + counts.tools + counts.releases + counts.posts + counts.tags;
  console.log(`✅ Generated sitemap with ${total} URLs across ${LOCALES.length} locales`);
  console.log(`   - Static pages: ${counts.static}`);
  console.log(`   - Tool pages:   ${counts.tools}`);
  console.log(`   - Release notes:${counts.releases}`);
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
