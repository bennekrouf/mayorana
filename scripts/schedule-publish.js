#!/usr/bin/env node
// Enhanced schedule-publish.js with YAML support and proper date updating
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
  const blogDir = path.join(projectRoot, 'content/blog');

  console.log('Queue directory:', queueDir);
  console.log('Blog directory:', blogDir);

  // Look for Markdown files in queue
  const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
  console.log('Found files:', files);

  if (files.length > 0) {
    const file = files[0];
    const sourcePath = path.join(queueDir, file);
    const targetPath = path.join(blogDir, file);

    console.log('Processing:', file);

    try {
      // Read and parse the Markdown file with frontmatter
      const fileContents = fs.readFileSync(sourcePath, 'utf8');
      const { data, content } = matter(fileContents);

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

      // Create the updated Markdown content
      const markdownContent = matter.stringify(content, data);

      // Write the updated content to blog directory
      fs.writeFileSync(targetPath, markdownContent);

      // Remove from queue
      fs.unlinkSync(sourcePath);

      console.log('✅ Successfully published:', file);
      console.log('📅 Date updated to:', today);
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
