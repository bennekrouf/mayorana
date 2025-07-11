// Updated blog data generation script - fixes slugify error
// File: scripts/generate-blog-data.js
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
      try {
        // Read file content
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        
        // Parse frontmatter
        const { data, content } = matter(fileContents);
        
        // Validate required fields
        if (!data.title) {
          console.error(`❌ Missing title in ${fileName}, skipping...`);
          return null;
        }
        
        // Generate slug from title if not provided
        const slug = data.slug || generateSlug(data.title);
        
        // Remove the first H1 title from content to avoid duplication
        const contentWithoutTitle = removeH1Title(content);
        
        // Convert markdown to HTML for rendering
        const contentHtml = marked(contentWithoutTitle);
        
        // Extract headings for table of contents (excluding the removed title)
        const headings = extractHeadings(contentWithoutTitle);
        
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
          date: data.date || new Date().toISOString().split('T')[0],
          excerpt: data.excerpt || '',
          content: contentWithoutTitle, // Store content without title
          contentHtml,
          author: data.author || 'Anonymous',
          category: data.category || 'uncategorized',
          tags: Array.isArray(data.tags) ? data.tags : [],
          image: data.image,
          readingTime: readingTimeText,
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
    .filter(post => post !== null) // Remove failed posts
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
  console.log(`📝 Removed H1 titles from content to avoid duplication`);
}

// Run the function
generateBlogData().catch(console.error);
