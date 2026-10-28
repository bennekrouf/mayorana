
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting for general traffic as defense in depth
const ipRateLimit = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_ADMIN = 5; // 5 attempts per minute for admin
const MAX_REQUESTS_GENERAL = 500; // 500 requests per minute for general traffic
// The stats page and its API are counted separately — see the route below.
// The API is fetched once per page view plus once per Refresh click, so the
// budget has to cover someone actually reading the page, not one hit per view.
const MAX_REQUESTS_STATS_API = 30;
const MAX_REQUESTS_STATS_PAGE = 60;
// The public MCP server: an agent makes a handful of calls per question, so
// this allows a busy session while stopping anyone from scraping through it.
const MAX_REQUESTS_MCP = 120;
// Ask Mayorana (src/lib/ask.ts): each question is a paid model call. The
// route also caps questions per visitor per day; this stops a burst.
const MAX_REQUESTS_ASK = 6;

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

    // Download statistics. Unlike /admin this is reachable from the internet —
    // it is an unlisted URL guarded by the admin key, not by network position,
    // so the request must skip the locale redirect below (which would send
    // /stats to /en/stats and 404) and instead be rate limited hard enough
    // that the key cannot be guessed.
    if (pathname === '/stats' || pathname.startsWith('/api/stats')) {
        // Two budgets, and — importantly — two counters. These shared a single
        // counter while applying different limits, so page requests spent the
        // API's much smaller budget: a few views in a minute and the page
        // still rendered, but its own fetch came back 429 and the dashboard
        // showed "Too Many Requests" where the numbers should be.
        const isApi = pathname.startsWith('/api/stats');
        const limit = isApi ? MAX_REQUESTS_STATS_API : MAX_REQUESTS_STATS_PAGE;
        if (getRateLimit(`stats-${isApi ? 'api' : 'page'}:${ip}`, limit)) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
        return NextResponse.next();
    }

    // The public MCP server (src/app/mcp). Not a page, so no locale redirect
    // and no swissrust rewrite; its own budget, apart from page traffic.
    if (pathname === '/mcp') {
        if (getRateLimit(`mcp:${ip}`, MAX_REQUESTS_MCP)) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
        return NextResponse.next();
    }

    if (pathname === '/api/ask') {
        if (getRateLimit(`ask:${ip}`, MAX_REQUESTS_ASK)) {
            return NextResponse.json({ error: 'limit_ip' }, { status: 429 });
        }
        return NextResponse.next();
    }

    // Markdown twins of posts and app pages, for AI agents: /en/blog/<slug>.md
    // is served by the route handler at /en/blog/<slug>/md. See
    // src/lib/markdown-export.ts.
    const markdown = pathname.match(/^\/(en|fr)\/(blog|apps)\/([^/]+)\.md$/);
    if (markdown) {
        const [, mdLocale, section, slug] = markdown;
        return NextResponse.rewrite(new URL(`/${mdLocale}/${section}/${slug}/md`, request.url));
    }

    // Swissrust Domain Proxy Logic
    const hostname = request.headers.get('host') || '';
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

            // 3. Extract the rest of the path after the locale (if present),
            //    and after /blog: swissrust.ch serves /x and /blog/x alike.
            const remainingPath = hasLocalePrefix ? `/${pathParts.slice(1).join('/')}` : pathname;
            const blogPath = remainingPath.replace(/^\/blog(?=\/|$)/, '').replace(/^\/$/, '');

            // 4. Every page is served from the swissrust segment, which is how the
            //    pages know the site without reading the request (see
            //    src/app/[locale]/swissrust/layout.tsx). The query is kept for
            //    the listing's ?page= and ?view=.
            const target = new URL(`/${targetLocale}/swissrust/blog${blogPath}`, request.url);
            target.search = request.nextUrl.search;
            return NextResponse.rewrite(target);
        }
    }

    // Locale detection and redirect for mayorana.ch
    if (!hostname.includes('swissrust.ch') &&
        !pathname.startsWith('/_next') &&
        !pathname.startsWith('/api') &&
        !pathname.includes('.')) {

        const pathParts = pathname.split('/').filter(Boolean);
        const hasLocalePrefix = pathParts.length > 0 && (pathParts[0] === 'en' || pathParts[0] === 'fr');

        // The swissrust segment is swissrust.ch's copy of the blog, reached only
        // through the rewrite above; on mayorana.ch it would be duplicate content.
        if (hasLocalePrefix && pathParts[1] === 'swissrust') {
            return NextResponse.rewrite(new URL(`/${pathParts[0]}/not-found`, request.url));
        }

        // Root path: detect browser language and redirect
        if (pathname === '/' || pathname === '') {
            const acceptLanguage = request.headers.get('accept-language') || '';
            const targetLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';
            return NextResponse.redirect(new URL(`/${targetLocale}`, request.url));
        }

        // Non-locale prefixed paths: redirect to locale version
        if (!hasLocalePrefix) {
            const acceptLanguage = request.headers.get('accept-language') || '';
            const targetLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';
            // Keeps the query: Stripe returns subscribers to /pricing?checkout=success&session_id=…
            return NextResponse.redirect(new URL(`/${targetLocale}${pathname}${request.nextUrl.search}`, request.url));
        }
    }

    // General rate limiting for all other routes
    if (getRateLimit(`general:${ip}`, MAX_REQUESTS_GENERAL)) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    return NextResponse.next();
}

export const config = {
    // `__/` is Firebase's auth handler, proxied to firebaseapp.com by a rewrite
    // in next.config.ts — it must not get the locale redirect.
    matcher: ['/((?!_next/static|_next/image|favicon.ico|__/).*)'],
}
