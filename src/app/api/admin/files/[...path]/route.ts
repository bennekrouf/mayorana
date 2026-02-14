// File: src/app/api/admin/files/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Security check - secret key validation via Authorization header only
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const secretKey = process.env.ADMIN_SECRET_KEY;

  if (!secretKey || secretKey.length < 16) {
    console.error('ADMIN_SECRET_KEY is not set or too short (min 16 chars). Admin access disabled.');
    return false;
  }

  const provided = authHeader?.replace('Bearer ', '') || '';

  // Constant-time comparison to prevent timing attacks
  if (provided.length !== secretKey.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < secretKey.length; i++) {
    result |= provided.charCodeAt(i) ^ secretKey.charCodeAt(i);
  }

  return result === 0;
}

// GET /api/admin/files/[...path] - Get specific file content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { path: pathSegments } = await params;
    const filePath = decodeURIComponent(pathSegments.join('/'));
    
    // Security: ensure the path is within the content directory
    const fullPath = path.join(process.cwd(), 'content', filePath);
    const contentDir = path.join(process.cwd(), 'content');
    
    if (!fullPath.startsWith(contentDir)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Check if file exists and is a markdown file
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    if (!filePath.endsWith('.md')) {
      return NextResponse.json({ error: 'Not a markdown file' }, { status: 400 });
    }

    // Read file content
    const content = fs.readFileSync(fullPath, 'utf8');
    const stats = fs.statSync(fullPath);

    return NextResponse.json({
      path: filePath,
      content,
      lastModified: stats.mtime.toISOString(),
      size: stats.size
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
