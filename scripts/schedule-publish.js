#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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
        
        console.log('Moving:', file);
        console.log('From:', sourcePath);
        console.log('To:', targetPath);
        
        fs.renameSync(sourcePath, targetPath);
        console.log('✅ Successfully published:', file);
        process.exit(0);
    } else {
        console.log('❌ No files to publish');
        process.exit(1);
    }
} else {
    console.log('❌ No --publish flag provided');
    process.exit(1);
}
