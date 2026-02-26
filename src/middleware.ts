
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting for general traffic as defense in depth
const ipRateLimit = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_ADMIN = 5; // 5 attempts per minute for admin
const MAX_REQUESTS_GENERAL = 500; // 500 requests per minute for general traffic

function getRateLimit(ip: string, limit: number): boolean {
    const now = Date.now();

    // Clean up expired entries occasionally
    if (Math.random() < 0.01) {
        for (const [key, value] of ipRateLimit.entries()) {
            if (value.resetTime < now) {
                ipRateLimit.delete(key);
            }
        }
    }

    const rateLimitData = ipRateLimit.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };

    if (now > rateLimitData.resetTime) {
        rateLimitData.count = 0;
        rateLimitData.resetTime = now + RATE_LIMIT_WINDOW;
    }

    rateLimitData.count++;
    ipRateLimit.set(ip, rateLimitData);

    return rateLimitData.count > limit;
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Block admin routes entirely at the application level (defense in depth)
    // nginx also blocks these, but this protects against direct access to the Node process
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        // Only allow access from localhost (e.g., SSH tunnel)
        const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';

        if (!isLocalhost) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // Even for localhost, apply rate limiting
        if (getRateLimit(`admin:${ip}`, MAX_REQUESTS_ADMIN)) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }

        return NextResponse.next();
    }

    // Swissrust Domain Proxy Logic
    const hostname = request.headers.get('host') || '';
    // Inject hostname into request headers so layout.tsx can read it via headers()
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-hostname', hostname);

    if (hostname.includes('swissrust.ch')) {
        // Essential: Exclude Next.js static files, data requests, and API requests from being rewritten
        if (!pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {

            // 1. Identify if the pathname already starts with a locale (e.g., /en or /fr)
            const pathParts = pathname.split('/').filter(Boolean);
            const hasLocalePrefix = pathParts.length > 0 && (pathParts[0] === 'en' || pathParts[0] === 'fr');

            // 2. Determine target locale
            let targetLocale = 'en';
            if (hasLocalePrefix) {
                targetLocale = pathParts[0];
            } else {
                const acceptLanguage = request.headers.get('accept-language') || '';
                targetLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';
            }

            // 3. Extract the rest of the path after the locale (if present)
            const remainingPath = hasLocalePrefix ? `/${pathParts.slice(1).join('/')}` : pathname;

            // 4. We only want to rewrite if they aren't already explicitly browsing the /blog directory
            if (!remainingPath.startsWith('/blog')) {
                const newPath = `/${targetLocale}/blog${remainingPath === '/' ? '' : remainingPath}`;
                return NextResponse.rewrite(new URL(newPath, request.url), {
                    request: {
                        headers: requestHeaders,
                    }
                });
            }
        }
    }

    // General rate limiting for all other routes
    if (getRateLimit(`general:${ip}`, MAX_REQUESTS_GENERAL)) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    });
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
