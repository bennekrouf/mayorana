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
  const queueDir = path.join(projectRoot, 'content/queue');

  // Support for both locales
  const locales = ['en', 'fr'];
  const blogDirs = {
    'en': path.join(projectRoot, 'content/en/blog'),
    'fr': path.join(projectRoot, 'content/fr/blog')
  };

  console.log('Queue directory:', queueDir);
  console.log('Blog directories:', blogDirs);

  // Ensure blog directories exist
  for (const locale of locales) {
    if (!fs.existsSync(blogDirs[locale])) {
      fs.mkdirSync(blogDirs[locale], { recursive: true });
      console.log(`📁 Created directory: ${blogDirs[locale]}`);
    }
  }

  // Look for Markdown files in queue
  const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
  console.log('Found files:', files);

  if (files.length > 0) {
    const file = files[0];
    const sourcePath = path.join(queueDir, file);

    console.log('Processing:', file);

    try {
      // Read and parse the Markdown file with frontmatter
      const fileContents = fs.readFileSync(sourcePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Determine locale from frontmatter (default to 'en')
      const locale = data.locale || 'en';
      console.log('Article locale:', locale);

      // Validate locale
      if (!locales.includes(locale)) {
        console.warn(`⚠️  Unknown locale '${locale}', defaulting to 'en'`);
        data.locale = 'en';
      }

      const targetDir = blogDirs[data.locale || 'en'];
      const targetPath = path.join(targetDir, file);

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

      console.log('✅ Successfully published:', file);
      console.log('📅 Date updated to:', today);
      console.log('🌍 Published to locale:', data.locale || 'en');
      console.log('🗑️  Removed scheduling metadata');
      process.exit(0);

    } catch (error) {
      console.error('❌ Publishing failed:', error.message);
      console.error('Error details:', error);
      process.exit(1);
    }
  } else {
    console.log('❌ No Markdown files to publish');
    process.exit(1);
  }
} else {
  console.log('❌ No --publish flag provided');
  process.exit(1);
}
