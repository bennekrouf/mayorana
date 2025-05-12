// middleware.ts
// This file helps with proper content type headers and redirection

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle JavaScript files to ensure proper MIME type
  if (pathname.endsWith('.js')) {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
    return response;
  }

  // Handle JSON files
  if (pathname.endsWith('.json')) {
    const response = NextResponse.next();
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  }

  // Remove trailing slashes (except for the root path)
  if (pathname !== '/' && pathname.endsWith('/')) {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -1), request.url),
      { status: 301 }
    );
  }

  // For paths that have both trailing slash and non-trailing slash versions,
  // make sure we're consistently using the non-trailing slash version
  if (pathname.match(/\/blog\/?$/)) {
    const normalizedPath = '/blog';
    if (pathname !== normalizedPath) {
      return NextResponse.redirect(
        new URL(normalizedPath, request.url),
        { status: 301 }
      );
    }
  }

  return NextResponse.next();
}

// Only run the middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (image files)
     * - public/ (public files)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|images/|public/).*)',
  ],
};
