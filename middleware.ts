import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always', // Always use locale prefix
  localeDetection: true // Enable automatic locale detection from browser
});

export default function middleware(request: NextRequest) {
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

  // Special handling for root path - redirect to browser language or default
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const userLocale = acceptLanguage.includes('fr') ? 'fr' : defaultLocale;

    return NextResponse.redirect(
      new URL(`/${userLocale}`, request.url),
      { status: 302 }
    );
  }

  // Handle trailing slashes (except for the root path)
  if (pathname !== '/' && pathname.endsWith('/')) {
    return NextResponse.redirect(
      new URL(pathname.slice(0, -1), request.url),
      { status: 301 }
    );
  }

  // Apply i18n middleware for all other paths
  return intlMiddleware(request);
}

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
