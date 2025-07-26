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
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Debug logging for production
  console.log('Middleware processing:', pathname);

  // Special handling for root path - redirect to browser language or default
  if (pathname === '/') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const userLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : defaultLocale;

    const redirectUrl = new URL(`/${userLocale}`, request.url);
    console.log('Root redirect:', pathname, '->', redirectUrl.pathname);

    return NextResponse.redirect(redirectUrl, { status: 302 });
  }

  // Handle trailing slashes (except for the root path)
  if (pathname !== '/' && pathname.endsWith('/')) {
    const redirectUrl = new URL(pathname.slice(0, -1), request.url);
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // Apply i18n middleware for all other paths
  const response = intlMiddleware(request);
  console.log('Middleware result for:', pathname, response?.status);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     * - Any file with an extension
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.).*)',
  ],
};
