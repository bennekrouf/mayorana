
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiting
// IN PRODUCTION: Use Redis or similar for distributed rate limiting
const ipRateLimit = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 attempts per minute

export function middleware(request: NextRequest) {
    // Only protect admin routes
    if (!request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.next();
    }

    // Rate Limiting Logic
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
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

    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
        rateLimitData.count++;
        ipRateLimit.set(ip, rateLimitData);

        if (rateLimitData.count > MAX_REQUESTS) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    // We don't perform the full auth check here to avoid blocking valid traffic if not necessary,
    // identifying the session happens in the page/api. 
    // However, for the /admin page itself, we might want to check for a cookie or basic auth.
    // Given the current implementation uses a query param or header 'key', 
    // modifying the middleware to ENFORCE this would break the initial 'login' page load 
    // unless we have a specific login route.

    // The user's goal is to prevent attacks. Rate limiting the login attempts is key.
    // The current login page tries to fetch `/api/admin/files?key=...` to authenticate.
    // So limiting requests to `/api/admin` is crucial.

    // Let's protect sensitive API routes specifically
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
        // Allow the check through, but the API route will validate the key.
        // The rate limit above already protects against bruteforce.
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
}
