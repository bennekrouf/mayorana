#!/usr/bin/env node
// Enhanced schedule-publish.js with date updating
// File: scripts/schedule-publish.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

console.log('Script started with args:', process.argv);

if (process.argv.includes('--publish')) {
  console.log('Publishing mode activated');

  const queueDir = path.join(process.cwd(), 'content/queue');
  const blogDir = path.join(process.cwd(), 'content/blog');

  console.log('Queue directory:', queueDir);
  console.log('Blog directory:', blogDir);

  const files = fs.readdirSync(queueDir).filter(f => f.endsWith('.md'));
  console.log('Found files:', files);

  if (files.length > 0) {
    const file = files[0];
    const sourcePath = path.join(queueDir, file);
    const targetPath = path.join(blogDir, file);

    console.log('Processing:', file);

    try {
      // Read and parse the file
      const fileContents = fs.readFileSync(sourcePath, 'utf8');
      const { data, content } = matter(fileContents);

      // Update the date to today
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      data.date = today;

      // Remove scheduling metadata if present
      delete data.scheduledFor;
      delete data.queuedAt;
      delete data.priority;

      console.log('Updated date to:', today);

      // Write the updated content to blog directory
      const updatedContent = matter.stringify(content, data);
      fs.writeFileSync(targetPath, updatedContent);

      // Remove from queue
      fs.unlinkSync(sourcePath);

      console.log('✅ Successfully published:', file);
      console.log('📅 Date updated to:', today);
      process.exit(0);

    } catch (error) {
      console.error('❌ Publishing failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('❌ No files to publish');
    process.exit(1);
  }
} else {
  console.log('❌ No --publish flag provided');
  process.exit(1);
}
