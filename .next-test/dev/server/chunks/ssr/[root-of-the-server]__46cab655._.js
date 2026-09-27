module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/providers.tsx",
        lineNumber: 12,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/providers/HostProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HostProvider",
    ()=>HostProvider,
    "useHostContext",
    ()=>useHostContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
const HostContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    isSwissRust: false
});
function useHostContext() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(HostContext);
}
function HostProvider({ children, isSwissRust }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HostContext.Provider, {
        value: {
            isSwissRust
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/providers/HostProvider.tsx",
        lineNumber: 25,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/lib/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getFirebaseAuth",
    ()=>getFirebaseAuth,
    "isAuthConfigured",
    ()=>isAuthConfigured
]);
// Firebase client for sign-in. mayorana has its own Firebase project
// (mayorana-7922a); the api0 gateway lists it as a trusted project
// (API0__GOOGLE_AUTH__EXTRA_FIREBASE_PROJECT_IDS) and verifies its ID tokens
// the same way it verifies app.api0.ai's. Everything in this config is public
// web config (it identifies the project, it is not a secret); the env
// overrides exist for pointing a dev build at another project.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
;
;
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA8OaC_m27FnQFFi3pq6c8pF0b0mZyh8Fw',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mayorana-7922a.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mayorana-7922a',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:454981824324:web:92f65f850fd45452383111'
};
const isAuthConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);
let app;
function getFirebaseAuth() {
    if (!app) {
        app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])()[0] ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(app);
}
}),
"[project]/src/providers/AuthProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    enabled: false,
    user: null,
    loading: true,
    signInWithGoogle: async ()=>{},
    signOut: async ()=>{}
});
function useAuth() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
}
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAuthConfigured"]) return;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onAuthStateChanged"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])(), (u)=>{
            setUser(u);
            setLoading(false);
        });
    }, []);
    const signInWithGoogle = async ()=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithPopup"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])(), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]());
        } catch (error) {
            // Closing the popup rejects too; nothing to report for that.
            const code = error.code;
            if (code === 'auth/popup-blocked') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithRedirect"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])(), new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]());
                return;
            }
            if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
                console.error('Error signing in with Google:', error);
            }
        }
    };
    const signOut = async ()=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])().signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            enabled: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAuthConfigured"],
            user,
            loading,
            signInWithGoogle,
            signOut
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/providers/AuthProvider.tsx",
        lineNumber: 78,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/i18n-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getLocalizedPath",
    ()=>getLocalizedPath
]);
function getLocalizedPath(locale, path) {
    return `/${locale}${path}`;
}
}),
"[project]/src/lib/gateway.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GATEWAY_URL",
    ()=>GATEWAY_URL,
    "GatewayError",
    ()=>GatewayError,
    "gatewayFetch",
    ()=>gatewayFetch,
    "getUserPrefs",
    ()=>getUserPrefs,
    "setUserPrefs",
    ()=>setUserPrefs,
    "updateUserPrefs",
    ()=>updateUserPrefs
]);
// The api0 gateway is the only backend mayorana talks to.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
;
const GATEWAY_URL = ("TURBOPACK compile-time value", "https://gateway.api0.ai") || (("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'http://0.0.0.0:5009');
class GatewayError extends Error {
    status;
    constructor(status, message){
        super(message), this.status = status;
        this.name = 'GatewayError';
    }
}
async function gatewayFetch(path, init = {}) {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const user = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAuthConfigured"] ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])().currentUser : null;
    if (user) {
        headers.set('X-Google-Auth', await user.getIdToken());
    }
    const response = await fetch(`${GATEWAY_URL}${path}`, {
        ...init,
        headers
    });
    if (!response.ok) {
        const body = await response.json().catch(()=>({}));
        throw new GatewayError(response.status, body.message || body.error || `HTTP ${response.status}`);
    }
    return response.json();
}
async function getUserPrefs() {
    const res = await gatewayFetch('/api/user/prefs');
    return res.prefs ?? {};
}
async function setUserPrefs(prefs) {
    const res = await gatewayFetch('/api/user/prefs', {
        method: 'PUT',
        body: JSON.stringify(prefs)
    });
    return res.prefs;
}
async function updateUserPrefs(patch) {
    const res = await gatewayFetch('/api/user/prefs', {
        method: 'PATCH',
        body: JSON.stringify(patch)
    });
    return res.prefs;
}
}),
"[project]/src/providers/DownloadGateProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DownloadGateProvider",
    ()=>DownloadGateProvider,
    "useDownloadGate",
    ()=>useDownloadGate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// The founding-users offer, at the moment it matters: when someone clicks a
// download button.
//
// The builds are free. What we want back is the ability to talk to the people
// who use them — a download in the nginx log is an IP address, not a person.
// So a download by someone not signed in first opens a short explanation and
// a Google sign-in; a download by someone signed in is recorded against their
// account (which apps, which OS, when) and goes straight through.
//
// Signing in is optional. The link to skip it is there, and it is honest — no
// delay, no trick — but it is deliberately the quiet option: the one thing on
// the panel that looks like a button is the sign-in.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-intl/dist/esm/development/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/react-client/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fi/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/i18n-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$providers$2f$AuthProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/providers/AuthProvider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gateway.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
;
;
;
const DownloadGateContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    requestDownload: (request)=>{
        // No provider mounted (a page outside the locale layout): plain download.
        window.location.href = request.href;
    }
});
function useDownloadGate() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(DownloadGateContext);
}
// A sign-in that fell back to a full-page redirect loses the React state, so
// the download that triggered it is parked here and resumed once the person
// is back and signed in.
const PENDING_KEY = 'mayorana.pendingDownload';
function stashPending(request) {
    try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(request));
    } catch  {}
}
function takePending() {
    try {
        const raw = sessionStorage.getItem(PENDING_KEY);
        if (!raw) return null;
        sessionStorage.removeItem(PENDING_KEY);
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
/** Start the browser download. `src=member` marks it in the access log as a
 *  download we can follow up on; the stats script counts the split. */ function navigateToBuild(href, member) {
    const url = new URL(href);
    if (member) url.searchParams.set('src', 'member');
    window.location.href = url.toString();
}
/**
 * Record the download on the person's account. Best-effort: the download
 * must never wait on, or fail because of, the bookkeeping.
 */ async function recordDownload(request) {
    try {
        const prefs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserPrefs"])();
        const downloads = prefs.downloads ?? {};
        const previous = downloads[request.app] ?? {};
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateUserPrefs"])({
            founding_user: true,
            downloads: {
                ...downloads,
                [request.app]: {
                    os: request.os,
                    last_at: new Date().toISOString(),
                    count: (previous.count ?? 0) + 1
                }
            }
        });
    } catch (error) {
        console.warn('[DownloadGate] could not record download:', error);
    }
}
function DownloadGateProvider({ children }) {
    const { enabled, user, signInWithGoogle } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$providers$2f$AuthProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [busy, setBusy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Guards the resume-after-redirect path so it runs once, not on every
    // auth-state change.
    const resumed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Mirror of `pending` readable from the auth subscription's closure: while
    // a panel is open, the popup path owns the download, not the subscription.
    const panelOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        panelOpen.current = pending !== null;
    }, [
        pending
    ]);
    const deliver = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (request, member)=>{
        setBusy(true);
        if (member) {
            // Bounded: the gateway may be slow or (before its deploy) absent, and
            // the person is waiting on a click.
            await Promise.race([
                recordDownload(request),
                new Promise((r)=>setTimeout(r, 2500))
            ]);
        }
        navigateToBuild(request.href, member);
        setPending(null);
        setBusy(false);
    }, []);
    const requestDownload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((request)=>{
        if (!enabled) {
            navigateToBuild(request.href, false);
            return;
        }
        if (user) {
            void deliver(request, true);
            return;
        }
        setPending(request);
    }, [
        enabled,
        user,
        deliver
    ]);
    // Back from a redirect sign-in: React state is gone, but the download that
    // started it is parked in sessionStorage. Firebase reports the restored
    // session through this subscription; finish the download from there.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAuthConfigured"]) return;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onAuthStateChanged"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])(), (signedIn)=>{
            // Also fires when the popup sign-in completes; with the panel still
            // open that download is handleSignIn's to finish.
            if (!signedIn || resumed.current || panelOpen.current) return;
            resumed.current = true;
            const parked = takePending();
            if (parked) void deliver(parked, true);
        });
    }, [
        deliver
    ]);
    const handleSignIn = async ()=>{
        if (!pending) return;
        // Parked in case the popup is blocked and sign-in falls back to a
        // redirect, which leaves this page before the next line runs.
        stashPending(pending);
        setBusy(true);
        await signInWithGoogle();
        const signedIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])().currentUser;
        if (signedIn) {
            // Popup path: the session is in place. The parked copy is consumed
            // here so the subscription above does not deliver it a second time.
            takePending();
            resumed.current = true;
            await deliver(pending, true);
        } else {
            // Popup closed without signing in: back to the panel.
            takePending();
            setBusy(false);
        }
    };
    const handleSkip = ()=>{
        if (!pending) return;
        void deliver(pending, false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DownloadGateContext.Provider, {
        value: {
            requestDownload
        },
        children: [
            children,
            pending && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DownloadGatePanel, {
                request: pending,
                busy: busy,
                onSignIn: handleSignIn,
                onSkip: handleSkip,
                onClose: ()=>{
                    if (!busy) setPending(null);
                }
            }, void 0, false, {
                fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                lineNumber: 195,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/providers/DownloadGateProvider.tsx",
        lineNumber: 192,
        columnNumber: 5
    }, this);
}
function DownloadGatePanel({ request, busy, onSignIn, onSkip, onClose }) {
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$client$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTranslations"])('download_gate');
    const locale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLocale"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onKey = (e)=>{
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return ()=>document.removeEventListener('keydown', onKey);
    }, [
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4",
        onClick: onClose,
        role: "presentation",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "download-gate-title",
            className: "w-full max-w-md rounded-2xl border border-border bg-background shadow-2xl p-6 sm:p-8",
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-start justify-between gap-4 mb-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "download-gate-title",
                            className: "text-xl font-bold leading-tight",
                            children: t('title')
                        }, void 0, false, {
                            fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                            lineNumber: 243,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            disabled: busy,
                            className: "shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                            "aria-label": t('cancel'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FiX"], {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                                lineNumber: 252,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                            lineNumber: 246,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                    lineNumber: 242,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-muted-foreground leading-relaxed mb-3",
                    children: t('body', {
                        app: request.appName
                    })
                }, void 0, false, {
                    fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                    lineNumber: 256,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    href: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getLocalizedPath"])(locale, '/founding')}?tool=${encodeURIComponent(request.app)}`,
                    className: "inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-2 mb-6",
                    children: [
                        t('learn_more'),
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fi$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FiArrowRight"], {
                            className: "h-3.5 w-3.5"
                        }, void 0, false, {
                            fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                            lineNumber: 265,
                            columnNumber: 29
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                    lineNumber: 261,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onSignIn,
                    disabled: busy,
                    className: "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium bg-primary text-white hover:bg-primary/90 disabled:opacity-60 transition-colors",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5",
                            viewBox: "0 0 24 24",
                            "aria-hidden": true,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                fill: "#EA4335",
                                d: "M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"
                            }, void 0, false, {
                                fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                                lineNumber: 274,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                            lineNumber: 273,
                            columnNumber: 11
                        }, this),
                        busy ? t('downloading') : t('signin')
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                    lineNumber: 268,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-5 text-center",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onSkip,
                        disabled: busy,
                        className: "text-xs text-muted-foreground/80 hover:text-foreground underline underline-offset-2 disabled:opacity-60 transition-colors",
                        children: t('skip')
                    }, void 0, false, {
                        fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                        lineNumber: 280,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/providers/DownloadGateProvider.tsx",
                    lineNumber: 279,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/providers/DownloadGateProvider.tsx",
            lineNumber: 235,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/providers/DownloadGateProvider.tsx",
        lineNumber: 230,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/read-progress.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Reading progress for blog posts.
//
// YouTube puts a red bar under a thumbnail you have already watched, and a
// partial bar under one you left halfway. The same idea reads well on a list
// of articles: at a glance, what is left to read.
//
// Two tiers, one behaviour. Everyone gets the bar from localStorage — no
// account, no network, nothing to wait for. Signing in only changes where the
// map is kept: it is mirrored into the user's prefs document so progress
// follows the person to another browser. The local copy stays authoritative
// while the tab is open; the gateway is a backup, never a dependency.
//
// Progress belongs to the article, not to one language of it: reading the
// French version marks the English one too. See progressKey().
__turbopack_context__.s([
    "READ_THRESHOLD",
    ()=>READ_THRESHOLD,
    "applyProgress",
    ()=>applyProgress,
    "isRead",
    ()=>isRead,
    "loadLocal",
    ()=>loadLocal,
    "mergeProgress",
    ()=>mergeProgress,
    "progressKey",
    ()=>progressKey,
    "sanitize",
    ()=>sanitize,
    "saveLocal",
    ()=>saveLocal
]);
const STORAGE_KEY = 'mayorana.readProgress';
const READ_THRESHOLD = 0.85;
/** Below this, a visit is a bounce and leaves no trace. */ const MIN_RECORDED = 0.05;
/** Progress is monotonic, so a write is only worth making if it moves. */ const MIN_DELTA = 0.02;
function progressKey(post) {
    if (post.locale !== 'en' && post.counterpart?.locale === 'en') {
        return post.counterpart.slug;
    }
    return post.slug;
}
function isRead(entry) {
    return (entry?.pct ?? 0) >= READ_THRESHOLD;
}
function loadLocal() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch  {
        // Private mode, disabled storage, or a corrupt value: start clean.
        return {};
    }
}
function saveLocal(map) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch  {}
}
function mergeProgress(a, b) {
    const merged = {
        ...a
    };
    for (const [slug, entry] of Object.entries(b)){
        const mine = merged[slug];
        if (!mine || entry.pct > mine.pct) {
            merged[slug] = entry;
        } else if (entry.at > mine.at) {
            // Same or lower depth, but read more recently — keep the later date.
            merged[slug] = {
                pct: mine.pct,
                at: entry.at
            };
        }
    }
    return merged;
}
function applyProgress(map, slug, pct) {
    const clamped = Math.max(0, Math.min(1, pct));
    if (clamped < MIN_RECORDED) return null;
    const current = map[slug];
    if (current && clamped - current.pct < MIN_DELTA) return null;
    return {
        ...map,
        [slug]: {
            pct: clamped,
            at: new Date().toISOString()
        }
    };
}
function sanitize(value) {
    if (!value || typeof value !== 'object') return {};
    const out = {};
    for (const [slug, entry] of Object.entries(value)){
        const e = entry;
        if (!e || typeof e.pct !== 'number' || !Number.isFinite(e.pct)) continue;
        out[slug] = {
            pct: Math.max(0, Math.min(1, e.pct)),
            at: typeof e.at === 'string' ? e.at : new Date(0).toISOString()
        };
    }
    return out;
}
}),
"[project]/src/providers/ReadProgressProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReadProgressProvider",
    ()=>ReadProgressProvider,
    "useReadProgress",
    ()=>useReadProgress,
    "useTrackReading",
    ()=>useTrackReading
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// Owns the reading-progress map for the whole site: the blog listing reads it
// to draw the bar under each card, the post page writes to it as the reader
// scrolls. See src/lib/read-progress.ts for why it works the way it does.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$providers$2f$AuthProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/providers/AuthProvider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gateway.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$read$2d$progress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/read-progress.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
// ── The store ────────────────────────────────────────────────────────────────
//
// localStorage is an external store, so the map is held as one rather than in
// component state: React subscribes to it. That also gets hydration right for
// free — the server snapshot is empty, so nothing renders a bar until the
// browser has taken over and read the real value.
const EMPTY = {};
let snapshot = EMPTY;
let loaded = false;
const listeners = new Set();
function subscribe(listener) {
    listeners.add(listener);
    return ()=>{
        listeners.delete(listener);
    };
}
function getSnapshot() {
    if (!loaded) {
        snapshot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$read$2d$progress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadLocal"])();
        loaded = true;
    }
    return snapshot;
}
function getServerSnapshot() {
    return EMPTY;
}
function publish(next) {
    snapshot = next;
    loaded = true;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$read$2d$progress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveLocal"])(next);
    listeners.forEach((listener)=>listener());
}
const ReadProgressContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    progress: EMPTY,
    record: ()=>{}
});
function useReadProgress() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ReadProgressContext);
}
/** Quiet period before the map is pushed to the gateway. Reading generates a
 *  steady trickle of updates; one write per pause is plenty. */ const SYNC_DEBOUNCE_MS = 3000;
function ReadProgressProvider({ children }) {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$providers$2f$AuthProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const progress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribe, getSnapshot, getServerSnapshot);
    const syncTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const syncPending = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const signedIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // uid whose remote map has already been pulled and merged.
    const mergedFor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const flush = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (syncTimer.current) {
            clearTimeout(syncTimer.current);
            syncTimer.current = null;
        }
        if (!syncPending.current || !signedIn.current) return;
        syncPending.current = false;
        // Best-effort, like the download bookkeeping: the reader never waits on
        // this and never sees it fail.
        void (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateUserPrefs"])({
            read: snapshot
        }).catch((error)=>{
            console.warn('[ReadProgress] could not sync:', error);
        });
    }, []);
    // Signing in pulls whatever this person read elsewhere and unions it with
    // what this browser knows; the result goes back up, so both sides converge.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        signedIn.current = !!user;
        if (!user || mergedFor.current === user.uid) return;
        mergedFor.current = user.uid;
        let cancelled = false;
        (async ()=>{
            try {
                const prefs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserPrefs"])();
                if (cancelled) return;
                const remote = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$read$2d$progress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sanitize"])(prefs.read);
                const merged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$read$2d$progress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mergeProgress"])(getSnapshot(), remote);
                publish(merged);
                if (JSON.stringify(merged) !== JSON.stringify(remote)) {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gateway$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateUserPrefs"])({
                        read: merged
                    });
                }
            } catch (error) {
                console.warn('[ReadProgress] could not load remote progress:', error);
            }
        })();
        return ()=>{
            cancelled = true;
        };
    }, [
        user
    ]);
    // A closed tab is the most common way a read session ends, and it is the one
    // moment a debounce would lose. pagehide fires there where unload does not
    // (bfcache, mobile Safari).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const onHide = ()=>flush();
        const onVisibility = ()=>{
            if (document.visibilityState === 'hidden') flush();
        };
        window.addEventListener('pagehide', onHide);
        document.addEventListener('visibilitychange', onVisibility);
        return ()=>{
            window.removeEventListener('pagehide', onHide);
            document.removeEventListener('visibilitychange', onVisibility);
            flush();
        };
    }, [
        flush
    ]);
    const record = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((slug, pct)=>{
        const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$read$2d$progress$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["applyProgress"])(getSnapshot(), slug, pct);
        if (!next) return;
        publish(next);
        if (!signedIn.current) return;
        syncPending.current = true;
        if (syncTimer.current) clearTimeout(syncTimer.current);
        syncTimer.current = setTimeout(flush, SYNC_DEBOUNCE_MS);
    }, [
        flush
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ReadProgressContext.Provider, {
        value: {
            progress,
            record
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/providers/ReadProgressProvider.tsx",
        lineNumber: 160,
        columnNumber: 5
    }, this);
}
// ── Tracking ─────────────────────────────────────────────────────────────────
/** How often the scroll position is written through to the store. The furthest
 *  point is tracked continuously; only the write is rationed. */ const RECORD_INTERVAL_MS = 1500;
function useTrackReading(slug) {
    const { record } = useReadProgress();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!slug) return;
        let furthest = 0;
        let lastRecorded = 0;
        const measure = ()=>{
            const height = document.documentElement.scrollHeight;
            if (height <= 0) return;
            // A post shorter than the viewport cannot be scrolled; it is read by
            // virtue of being open.
            const seen = height <= window.innerHeight ? 1 : (window.scrollY + window.innerHeight) / height;
            furthest = Math.max(furthest, Math.min(1, seen));
        };
        const onScroll = ()=>{
            measure();
            const now = Date.now();
            if (now - lastRecorded < RECORD_INTERVAL_MS) return;
            lastRecorded = now;
            record(slug, furthest);
        };
        // The first measurement waits for layout: images and the prose block land
        // after mount, and measuring too early reports a misleadingly deep read.
        const initial = setTimeout(measure, 500);
        window.addEventListener('scroll', onScroll, {
            passive: true
        });
        window.addEventListener('resize', measure, {
            passive: true
        });
        return ()=>{
            clearTimeout(initial);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', measure);
            measure();
            record(slug, furthest);
        };
    }, [
        slug,
        record
    ]);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__46cab655._.js.map