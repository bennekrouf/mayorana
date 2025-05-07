// scripts/generate-blog-data.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');
const readingTime = require('reading-time');

// Path to your blog content
const postsDirectory = path.join(process.cwd(), './content/blog/');
const outputPath = path.join(process.cwd(), 'src/data/blog-posts.json');
const categoriesOutputPath = path.join(process.cwd(), 'src/data/blog-categories.json');

// Function to generate slug from title if not explicitly provided
function generateSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true
  });
}

// Function to extract headings from markdown content
function extractHeadings(content) {
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugify(text, { lower: true, strict: true });
    
    headings.push({ id, text, level });
  }
  
  return headings;
}

// Read all posts
async function generateBlogData() {
  console.log(`Reading posts from ${postsDirectory}`);
  
  // Ensure the data directory exists
  const dataDir = path.join(process.cwd(), 'src/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Create content directory if it doesn't exist
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
    console.log(`Created directory: ${postsDirectory}`);
  }
  
  // Read all markdown files in the posts directory
  const fileNames = fs.readdirSync(postsDirectory);
  
  // Track categories for the categories file
  const categoriesMap = new Map();
  
  const postsData = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => {
      // Read file content
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Parse frontmatter
      const { data, content } = matter(fileContents);
      
      // Generate slug from title if not provided
      const slug = data.slug || generateSlug(data.title);
      
      // Convert markdown to HTML for rendering
      const contentHtml = marked(content);
      
      // Extract headings for table of contents
      const headings = extractHeadings(content);
      
      // Calculate reading time
      const timeStats = readingTime(content);
      const readingTimeText = `${Math.ceil(timeStats.minutes)} min`;
      
      // Track category for categories file
      if (data.category) {
        if (!categoriesMap.has(data.category)) {
          categoriesMap.set(data.category, {
            slug: data.category,
            name: data.categoryName || data.category.charAt(0).toUpperCase() + data.category.slice(1),
            description: data.categoryDescription || `Articles about ${data.category}`
          });
        }
      }
      
      // Return structured data
      return {
        id: data.id || slug,
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        content,
        contentHtml,
        author: data.author,
        category: data.category,
        tags: data.tags || [],
        image: data.image,
        readingTime: readingTimeText,
        seo: {
          title: data.seo_title || data.title,
          description: data.meta_description || data.excerpt,
          keywords: data.keywords || data.tags,
          ogImage: data.og_image || data.image
        },
        headings
      };
    })
    // Sort by date (newest first)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Write the posts data to a JSON file
  fs.writeFileSync(
    outputPath,
    JSON.stringify(postsData, null, 2)
  );
  
  // Convert categories map to array and write to file
  const categories = Array.from(categoriesMap.values());
  fs.writeFileSync(
    categoriesOutputPath,
    JSON.stringify(categories, null, 2)
  );
  
  console.log(`✅ Generated blog data with ${postsData.length} posts and ${categories.length} categories`);
}

// Run the function
generateBlogData().catch(console.error);
