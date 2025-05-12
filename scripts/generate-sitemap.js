// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

// Base URL of your website
const BASE_URL = 'https://mayorana.ch';

/**
 * Generate sitemap.xml content with URLs from the site
 */
async function generateSitemap() {
  // Path to the blog posts JSON file
  const postsPath = path.join(process.cwd(), 'src/data/blog-posts.json');
  
  // Check if posts file exists
  let blogSlugs = [];
  if (fs.existsSync(postsPath)) {
    try {
      const postsContent = fs.readFileSync(postsPath, 'utf8');
      const posts = JSON.parse(postsContent);
      // Extract just the slugs from the posts
      blogSlugs = posts.map(post => post.slug);
      console.log(`Found ${blogSlugs.length} blog posts for sitemap`);
    } catch (error) {
      console.warn('Error reading blog posts:', error.message);
      console.log('Proceeding with empty blog posts list');
    }
  } else {
    console.log('Blog posts file not found, proceeding with empty list');
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
    <loc>${BASE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;

  // Add all blog posts using the slugs
  for (const slug of blogSlugs) {
    const postUrl = `${BASE_URL}/blog/${slug}`;
    sitemap += `
  <url>
    <loc>${postUrl}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Close XML
  sitemap += `
</urlset>`;

  return sitemap;
}

/**
 * Write the sitemap to the public directory
 */
async function writeSitemap() {
  try {
    const sitemap = await generateSitemap();
    const publicDir = path.join(process.cwd(), 'public');
    
    // Ensure the public directory exists
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

// Run the sitemap generation
writeSitemap().catch(console.error);
