import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip processing for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || // Skip files with extensions
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Handle trailing slashes (except for the root path)
  if (pathname !== '/' && pathname.endsWith('/')) {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -1), request.url),
      { status: 301 }
    );
  }

  return NextResponse.next();
}

// Updated matcher to be more specific and avoid conflicts
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any file with an extension
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.).*)',
  ],
};
