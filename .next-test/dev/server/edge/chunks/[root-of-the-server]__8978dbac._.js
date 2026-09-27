(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__8978dbac._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
// Rate limiting for general traffic as defense in depth
const ipRateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_ADMIN = 5; // 5 attempts per minute for admin
const MAX_REQUESTS_GENERAL = 500; // 500 requests per minute for general traffic
function getRateLimit(ip, limit) {
    const now = Date.now();
    // Clean up expired entries occasionally
    if (Math.random() < 0.01) {
        for (const [key, value] of ipRateLimit.entries()){
            if (value.resetTime < now) {
                ipRateLimit.delete(key);
            }
        }
    }
    const rateLimitData = ipRateLimit.get(ip) || {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW
    };
    if (now > rateLimitData.resetTime) {
        rateLimitData.count = 0;
        rateLimitData.resetTime = now + RATE_LIMIT_WINDOW;
    }
    rateLimitData.count++;
    ipRateLimit.set(ip, rateLimitData);
    return rateLimitData.count > limit;
}
function middleware(request) {
    const { pathname } = request.nextUrl;
    const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    // Block admin routes entirely at the application level (defense in depth)
    // nginx also blocks these, but this protects against direct access to the Node process
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        // Only allow access from localhost (e.g., SSH tunnel)
        const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
        if (!isLocalhost) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Forbidden', {
                status: 403
            });
        }
        // Even for localhost, apply rate limiting
        if (getRateLimit(`admin:${ip}`, MAX_REQUESTS_ADMIN)) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Too Many Requests', {
                status: 429
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Download statistics. Unlike /admin this is reachable from the internet —
    // it is an unlisted URL guarded by the admin key, not by network position,
    // so the request must skip the locale redirect below (which would send
    // /stats to /en/stats and 404) and instead be rate limited hard enough
    // that the key cannot be guessed.
    if (pathname === '/stats' || pathname.startsWith('/api/stats')) {
        // The API is the only path where a key can be tried, so it gets the
        // tighter budget; the page itself is fetched once per view.
        const limit = pathname.startsWith('/api/stats') ? 10 : 60;
        if (getRateLimit(`stats:${ip}`, limit)) {
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Too Many Requests', {
                status: 429
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
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
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(new URL(newPath, request.url), {
                    request: {
                        headers: requestHeaders
                    }
                });
            }
        }
    }
    // Locale detection and redirect for mayorana.ch
    if (!hostname.includes('swissrust.ch') && !pathname.startsWith('/_next') && !pathname.startsWith('/api') && !pathname.includes('.')) {
        const pathParts = pathname.split('/').filter(Boolean);
        const hasLocalePrefix = pathParts.length > 0 && (pathParts[0] === 'en' || pathParts[0] === 'fr');
        // Root path: detect browser language and redirect
        if (pathname === '/' || pathname === '') {
            const acceptLanguage = request.headers.get('accept-language') || '';
            const targetLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/${targetLocale}`, request.url));
        }
        // Non-locale prefixed paths: redirect to locale version
        if (!hasLocalePrefix) {
            const acceptLanguage = request.headers.get('accept-language') || '';
            const targetLocale = acceptLanguage.toLowerCase().includes('fr') ? 'fr' : 'en';
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(`/${targetLocale}${pathname}`, request.url));
        }
    }
    // General rate limiting for all other routes
    if (getRateLimit(`general:${ip}`, MAX_REQUESTS_GENERAL)) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"]('Too Many Requests', {
            status: 429
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: requestHeaders
        }
    });
}
const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__8978dbac._.js.map