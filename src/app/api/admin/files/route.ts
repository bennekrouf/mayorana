// File: src/app/api/admin/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FileNode } from '@/app/admin/types';
import matter from 'gray-matter';

// Security check - simple secret key validation
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const secretKey = process.env.ADMIN_SECRET_KEY || 'your-secret-key-change-this';

  // Check for secret in query params or authorization header
  const urlSecret = new URL(request.url).searchParams.get('key');
  const headerSecret = authHeader?.replace('Bearer ', '');

  return urlSecret === secretKey || headerSecret === secretKey;
}

function buildFileTree(dirPath: string, basePath: string = ''): FileNode[] {
  const items: FileNode[] = [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files and common non-content directories
      if (entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'build') {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        const children = buildFileTree(fullPath, relativePath);
        items.push({
          id: relativePath,
          name: entry.name,
          path: relativePath,
          type: 'folder',
          children: children.length > 0 ? children : []
        });
      } else if (entry.name.endsWith('.md')) {
        // Parse frontmatter to get the date
        let frontmatterDate = null;
        try {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          const { data } = matter(fileContent);
          frontmatterDate = data.date; // Extract date from frontmatter
        } catch (parseError) {
          console.warn(`Failed to parse frontmatter for ${entry.name}:`, parseError);
        }

        // Fallback to file system date if no frontmatter date
        const stats = fs.statSync(fullPath);
        const dateToUse = frontmatterDate || stats.mtime.toISOString().split('T')[0];

        items.push({
          id: relativePath,
          name: entry.name,
          path: relativePath,
          type: 'file',
          lastModified: dateToUse // Use frontmatter date or fallback to file date
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return items;
}

// GET /api/admin/files - Get file tree
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentDir = path.join(process.cwd(), 'content');

    if (!fs.existsSync(contentDir)) {
      return NextResponse.json({ error: 'Content directory not found' }, { status: 404 });
    }

    const fileTree = buildFileTree(contentDir);
    return NextResponse.json(fileTree);
  } catch (error) {
    console.error('Error building file tree:', error);
    return NextResponse.json({ error: 'Failed to read content directory' }, { status: 500 });
  }
}

// PUT /api/admin/files - Save file content
export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { path: filePath, content } = await request.json();

    if (!filePath || typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Security: ensure the path is within the content directory
    const fullPath = path.join(process.cwd(), 'content', filePath);
    const contentDir = path.join(process.cwd(), 'content');

    if (!fullPath.startsWith(contentDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Ensure the file exists and is a markdown file
    if (!fs.existsSync(fullPath) || !filePath.endsWith('.md')) {
      return NextResponse.json({ error: 'File not found or not a markdown file' }, { status: 404 });
    }

    // Write the new content
    fs.writeFileSync(fullPath, content, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'File saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
