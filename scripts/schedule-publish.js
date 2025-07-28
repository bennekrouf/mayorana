#!/usr/bin/env node
// Enhanced schedule-publish.js with i18n support
// File: scripts/schedule-publish.js

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const matter = require('gray-matter');

console.log('Script started with args:', process.argv);

if (process.argv.includes('--publish')) {
  console.log('Publishing mode activated');

  // Get the project root directory (one level up from scripts)
  const projectRoot = path.resolve(__dirname, '..');

  // Support for both locales - check both queue directories
  const locales = ['en', 'fr'];
  const queueDirs = {
    'en': path.join(projectRoot, 'content/en/queue'),
    'fr': path.join(projectRoot, 'content/fr/queue')
  };

  const blogDirs = {
    'en': path.join(projectRoot, 'content/en/blog'),
    'fr': path.join(projectRoot, 'content/fr/blog')
  };

  console.log('Queue directories:', queueDirs);
  console.log('Blog directories:', blogDirs);

  // Ensure blog directories exist
  for (const locale of locales) {
    if (!fs.existsSync(blogDirs[locale])) {
      fs.mkdirSync(blogDirs[locale], { recursive: true });
      console.log(`📁 Created directory: ${blogDirs[locale]}`);
    }
  }

  // Look for Markdown files in both queue directories
  let foundFile = null;
  let sourceLocale = null;
  let sourcePath = null;

  for (const locale of locales) {
    const queueDir = queueDirs[locale];
    console.log(`Checking queue directory: ${queueDir}`);

    if (!fs.existsSync(queueDir)) {
      console.log(`Queue directory doesn't exist: ${queueDir}`);
      continue;
    }

    const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
    console.log(`Found files in ${locale} queue:`, files);

    if (files.length > 0) {
      foundFile = files[0]; // Take the first file
      sourceLocale = locale;
      sourcePath = path.join(queueDir, foundFile);
      console.log(`Selected file: ${foundFile} from ${locale} queue`);
      break;
    }
  }

  if (!foundFile) {
    console.log('❌ No Markdown files to publish in any queue');
    process.exit(1);
  }

  console.log('Processing:', foundFile);

  try {
    // Read and parse the Markdown file with frontmatter
    const fileContents = fs.readFileSync(sourcePath, 'utf8');
    const { data, content } = matter(fileContents);

    // Use the detected locale (from which queue directory we found the file)
    // but allow frontmatter to override if specified
    const articleLocale = data.locale || sourceLocale;
    console.log('Article locale:', articleLocale);

    // Validate locale
    if (!locales.includes(articleLocale)) {
      console.warn(`⚠️  Unknown locale '${articleLocale}', defaulting to 'en'`);
      data.locale = 'en';
    }

    const targetDir = blogDirs[data.locale || articleLocale];
    const targetPath = path.join(targetDir, foundFile);

    // Update the date to today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    data.date = today;

    // Remove ALL scheduling and workflow metadata
    delete data.scheduledFor;
    delete data.scheduledAt;
    delete data.queuedAt;
    delete data.priority;
    delete data.content_focus;
    delete data.technical_level;

    console.log('Updated date to:', today);
    console.log('Target directory:', targetDir);

    // Create the updated Markdown content
    const markdownContent = matter.stringify(content, data);

    // Write the updated content to appropriate locale blog directory
    fs.writeFileSync(targetPath, markdownContent);

    // Remove from queue
    fs.unlinkSync(sourcePath);

    console.log('✅ Successfully published:', foundFile);
    console.log('📅 Date updated to:', today);
    console.log('🌍 Published to locale:', data.locale || articleLocale);
    console.log('🗑️  Removed scheduling metadata');
    console.log('📂 Moved from:', sourcePath);
    console.log('📂 Moved to:', targetPath);
    process.exit(0);

  } catch (error) {
    console.error('❌ Publishing failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
} else {
  console.log('❌ No --publish flag provided');
  process.exit(1);
}
