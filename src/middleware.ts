// File: src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from '../i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // www redirect
  if (request.headers.get('host')?.startsWith('www.')) {
    const newUrl = request.nextUrl.clone();
    newUrl.host = 'mayorana.ch';
    return NextResponse.redirect(newUrl, 301);
  }

  // Root redirect to /en - handle this at middleware level to avoid static generation issues
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url), 301);
  }

  // Run the i18n middleware for all other requests
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - static files (/_next/static)
    // - API routes (/api)
    // - files with extensions (images, fonts, etc.)
    '/((?!_next|api|.*\\.).*)'
  ]
};
