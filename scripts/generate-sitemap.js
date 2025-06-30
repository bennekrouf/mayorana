// Simplified sitemap generation (tags only)
// File: scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mayorana.ch';

async function generateSitemap() {
  const postsPath = path.join(process.cwd(), 'src/data/blog-posts.json');
  
  let blogSlugs = [];
  let allTags = new Set();
  
  if (fs.existsSync(postsPath)) {
    try {
      const postsContent = fs.readFileSync(postsPath, 'utf8');
      const posts = JSON.parse(postsContent);
      
      blogSlugs = posts.map(post => post.slug);
      
      // Collect all unique tags
      posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            allTags.add(tag.toLowerCase().replace(/\s+/g, '-'));
          });
        }
      });
      
      console.log(`Found ${blogSlugs.length} blog posts and ${allTags.size} tags for sitemap`);
    } catch (error) {
      console.warn('Error reading blog posts:', error.message);
    }
  }
  
  // Start XML content
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${BASE_URL}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // Add all blog posts
  for (const slug of blogSlugs) {
    sitemap += `
  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Add tag pages
  for (const tag of allTags) {
    sitemap += `
  <url>
    <loc>${BASE_URL}/blog/tag/${tag}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  sitemap += `
</urlset>`;

  return sitemap;
}

async function writeSitemap() {
  try {
    const sitemap = await generateSitemap();
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated successfully!');
    return true;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return false;
  }
}

writeSitemap().catch(console.error);
