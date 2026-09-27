module.exports = [
"[project]/src/data/tools.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Single source of truth for the desktop tool catalogue.
//
// Extracted out of the Apps page so the Solutions pages can render the same
// tools without a second copy of the download URLs drifting out of date.
// Kept free of JSX so it stays a plain data module: `os` and `dataSource.id`
// are tags that the rendering components map to icons.
__turbopack_context__.s([
    "AIS_TOOL_IDS",
    ()=>AIS_TOOL_IDS,
    "LICENCE_URL",
    ()=>LICENCE_URL,
    "aisTools",
    ()=>aisTools,
    "appI18nKey",
    ()=>appI18nKey,
    "cosmosSource",
    ()=>cosmosSource,
    "desktopToolsConfig",
    ()=>desktopToolsConfig,
    "getRelatedTools",
    ()=>getRelatedTools,
    "getToolBySlug",
    ()=>getToolBySlug,
    "hasReleaseNotes",
    ()=>hasReleaseNotes,
    "logAnalyticsSource",
    ()=>logAnalyticsSource,
    "osColors",
    ()=>osColors,
    "releaseNotesTools",
    ()=>releaseNotesTools,
    "statusBadge",
    ()=>statusBadge,
    "statusLabel",
    ()=>statusLabel,
    "toolSlugs",
    ()=>toolSlugs
]);
// Builds are served from mayorana.ch; `latest/` is overwritten by release CI,
// so these URLs never need bumping. The repositories themselves are public and
// source-available under PolyForm Noncommercial 1.0.0, so each tool also links
// to its source — see `source` on each entry and LICENCE_URL below.
const runnerDl = 'https://mayorana.ch/downloads/ais-runner/latest';
const monitorDl = 'https://mayorana.ch/downloads/ais-monitor/latest';
const tracingDl = 'https://mayorana.ch/downloads/ais-tracing/latest';
const analyticsDl = 'https://mayorana.ch/downloads/ais-analytics/latest';
const gitagentDl = 'https://mayorana.ch/downloads/gitagent/latest';
const blogtkDl = 'https://mayorana.ch/downloads/blog-toolkit/latest';
const screensDl = 'https://mayorana.ch/downloads/appscreens/latest';
const splitterDl = 'https://mayorana.ch/downloads/splitter/latest';
const spreadwatchDl = 'https://mayorana.ch/downloads/spreadwatch/latest';
const cosmosSource = {
    id: 'cosmos',
    label: 'Cosmos DB',
    colorClasses: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    borderClass: 'border-l-4 border-l-violet-500'
};
const logAnalyticsSource = {
    id: 'log-analytics',
    label: 'Log Analytics',
    colorClasses: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    borderClass: 'border-l-4 border-l-teal-500'
};
const desktopToolsConfig = [
    {
        id: 'ais-runner',
        source: 'https://github.com/Bennekrouf/ais-runner',
        name: 'AIS Runner',
        tech: 'Rust · Dioxus · Azure CLI · Azurite · Azure Functions',
        status: 'live',
        tags: [
            'azure'
        ],
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${runnerDl}/ais-runner-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${runnerDl}/ais-runner-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${runnerDl}/ais-runner-setup.exe`
            }
        ]
    },
    {
        id: 'ais-monitor',
        source: 'https://github.com/Bennekrouf/ais-monitor',
        name: 'AIS Monitor',
        tech: 'Rust · Dioxus · Azure CLI · ais-chain · D3.js',
        status: 'beta',
        tags: [
            'azure'
        ],
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${monitorDl}/ais-monitor-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${monitorDl}/ais-monitor-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${monitorDl}/ais-monitor-setup.exe`
            }
        ]
    },
    {
        id: 'ais-tracing',
        source: 'https://github.com/Bennekrouf/ais-tracing',
        name: 'AIS Tracing',
        tech: 'Rust · Dioxus · Azure Cosmos DB',
        status: 'beta',
        tags: [
            'azure'
        ],
        dataSource: cosmosSource,
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${tracingDl}/ais-tracing-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${tracingDl}/ais-tracing-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${tracingDl}/ais-tracing-setup.exe`
            }
        ]
    },
    {
        id: 'ais-analytics',
        source: 'https://github.com/Bennekrouf/ais-analytics',
        name: 'AIS Analytics',
        tech: 'Rust · Dioxus · Azure Log Analytics',
        status: 'beta',
        tags: [
            'azure'
        ],
        dataSource: logAnalyticsSource,
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${analyticsDl}/ais-analytics-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${analyticsDl}/ais-analytics-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${analyticsDl}/ais-analytics-setup.exe`
            }
        ]
    },
    {
        id: 'blog-toolkit',
        source: 'https://github.com/Bennekrouf/blog-toolkit',
        name: 'Blog Toolkit',
        tech: 'Rust · Dioxus · DeepSeek / Claude · Markdown',
        status: 'live',
        tags: [
            'blog'
        ],
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${blogtkDl}/blog-toolkit-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${blogtkDl}/blog-toolkit-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${blogtkDl}/blog-toolkit-setup.exe`
            }
        ]
    },
    {
        id: 'appscreens',
        source: 'https://github.com/Bennekrouf/appscreens',
        name: 'AppScreens',
        tech: 'Rust · Dioxus · Xcode · Gradle · image · imageproc',
        status: 'beta',
        tags: [
            'tools'
        ],
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${screensDl}/appscreens-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64 (.deb)',
                href: `${screensDl}/appscreens-linux-x86_64.deb`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${screensDl}/appscreens-windows-setup.msi`
            }
        ]
    },
    {
        id: 'gitagent',
        source: 'https://github.com/Bennekrouf/gitagent',
        name: 'GitAgent',
        tech: 'Rust · Dioxus · ollama / DeepSeek · git · gh',
        status: 'wip',
        tags: [
            'git'
        ],
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${gitagentDl}/gitagent-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${gitagentDl}/gitagent-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${gitagentDl}/gitagent-setup.exe`
            }
        ]
    },
    {
        id: 'splitter',
        source: 'https://github.com/Bennekrouf/splitter',
        name: 'Splitter',
        tech: 'Rust · Dioxus · symphonia · LAME · FLAC · yt-dlp',
        status: 'beta',
        tags: [
            'audio'
        ],
        applicationCategory: 'MultimediaApplication',
        pro: {
            edition: 'pro'
        },
        downloads: [
            {
                os: 'mac',
                label: 'macOS (Apple Silicon)',
                href: `${splitterDl}/splitter-macos-arm64.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${splitterDl}/splitter-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${splitterDl}/splitter-setup.exe`
            }
        ]
    },
    {
        id: 'spreadwatch',
        source: 'https://github.com/Bennekrouf/spreadwatch',
        name: 'Spreadwatch',
        tech: 'Rust · Dioxus · WebSockets · Solana · Jupiter',
        status: 'beta',
        tags: [
            'crypto'
        ],
        applicationCategory: 'FinanceApplication',
        downloads: [
            // One universal DMG: Apple Silicon and Intel.
            {
                os: 'mac',
                label: 'macOS (Apple Silicon & Intel)',
                href: `${spreadwatchDl}/spreadwatch-macos.dmg`
            },
            {
                os: 'linux',
                label: 'Linux x86_64',
                href: `${spreadwatchDl}/spreadwatch-linux-x86_64.tar.gz`
            },
            {
                os: 'windows',
                label: 'Windows',
                href: `${spreadwatchDl}/spreadwatch-setup.exe`
            }
        ]
    }
];
const appI18nKey = {
    'ais-runner': 'ais_runner',
    'ais-monitor': 'ais_monitor',
    'ais-tracing': 'ais_tracing',
    'ais-analytics': 'ais_analytics',
    'blog-toolkit': 'blog_toolkit',
    appscreens: 'appscreens',
    gitagent: 'gitagent',
    splitter: 'splitter',
    spreadwatch: 'spreadwatch'
};
const AIS_TOOL_IDS = [
    'ais-runner',
    'ais-monitor',
    'ais-tracing',
    'ais-analytics'
];
const aisTools = AIS_TOOL_IDS.map((id)=>{
    const tool = desktopToolsConfig.find((t)=>t.id === id);
    if (!tool) throw new Error(`AIS tool "${id}" missing from desktopToolsConfig`);
    return tool;
});
const LICENCE_URL = 'https://polyformproject.org/licenses/noncommercial/1.0.0';
const osColors = {
    mac: 'bg-neutral-800 hover:bg-neutral-700 text-white',
    linux: 'bg-orange-600  hover:bg-orange-500  text-white',
    windows: 'bg-blue-600    hover:bg-blue-500    text-white'
};
const statusBadge = {
    live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    mvp: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    wip: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    coming_soon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
};
const statusLabel = (status)=>status === 'coming_soon' ? 'COMING SOON' : status;
const releaseNotesTools = [
    'ais-runner',
    'ais-monitor',
    'ais-tracing',
    'ais-analytics',
    'appscreens',
    'gitagent',
    'splitter',
    'spreadwatch'
];
const hasReleaseNotes = (toolId)=>releaseNotesTools.includes(toolId);
const toolSlugs = desktopToolsConfig.map((t)=>t.id);
function getToolBySlug(slug) {
    return desktopToolsConfig.find((t)=>t.id === slug);
}
function getRelatedTools(slug, limit = 3) {
    const tool = getToolBySlug(slug);
    if (!tool) return [];
    const others = desktopToolsConfig.filter((t)=>t.id !== slug);
    const sameTag = others.filter((t)=>t.tags.some((tag)=>tool.tags.includes(tag)));
    if (sameTag.length === 0) return [];
    const rest = others.filter((t)=>!sameTag.includes(t));
    return [
        ...sameTag,
        ...rest
    ].slice(0, limit);
}
}),
"[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "alt",
    ()=>alt,
    "contentType",
    ()=>contentType,
    "default",
    ()=>ToolOpengraphImage,
    "size",
    ()=>size
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
// Per-tool social card. A link to one app should show that app's name, not the
// same generic site card as every other page — this is what makes a shared
// download link legible in Slack, LinkedIn or a chat window.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$og$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/og.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__ = __turbopack_context__.i("[project]/node_modules/next-intl/dist/esm/development/server/react-server/getTranslations.js [app-rsc] (ecmascript) <export default as getTranslations>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$tools$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/tools.ts [app-rsc] (ecmascript)");
;
;
;
;
const size = {
    width: 1200,
    height: 630
};
const contentType = 'image/png';
const alt = 'Mayorana desktop tool';
async function ToolOpengraphImage({ params }) {
    const { locale, slug } = await params;
    const tool = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$tools$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getToolBySlug"])(slug);
    const tApps = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getTranslations$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getTranslations$3e$__["getTranslations"])({
        locale,
        namespace: 'apps'
    });
    const name = tool?.name ?? 'Mayorana';
    const tagline = tool ? tApps(`${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$tools$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appI18nKey"][tool.id]}_tagline`) : '';
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$og$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ImageResponse"](/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#0B0B0F',
            padding: 80,
            fontFamily: 'sans-serif'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            width: 20,
                            height: 20,
                            borderRadius: 6,
                            background: '#FF6B00'
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 28,
                            color: '#FF6B00',
                            letterSpacing: 2,
                            fontWeight: 700
                        },
                        children: "MAYORANA"
                    }, void 0, false, {
                        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                        lineNumber: 41,
                        columnNumber: 11
                    }, this),
                    tool && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            marginLeft: 12,
                            fontSize: 22,
                            color: '#A1A1AA',
                            border: '1px solid #3F3F46',
                            borderRadius: 999,
                            padding: '4px 18px',
                            textTransform: 'uppercase'
                        },
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$tools$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["statusLabel"])(tool.status)
                    }, void 0, false, {
                        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                        lineNumber: 45,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 82,
                            color: '#FFFFFF',
                            fontWeight: 700,
                            lineHeight: 1.05
                        },
                        children: name
                    }, void 0, false, {
                        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            fontSize: 34,
                            color: '#A1A1AA',
                            lineHeight: 1.35
                        },
                        children: tagline.slice(0, 120)
                    }, void 0, false, {
                        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 24,
                    color: '#71717A'
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: tool?.tech.split('·')[0].trim() ?? 'Rust'
                    }, void 0, false, {
                        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: `mayorana.ch/apps/${slug}`
                    }, void 0, false, {
                        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx",
        lineNumber: 27,
        columnNumber: 7
    }, this), size);
}
}),
"[project]/src/app/[locale]/apps/[slug]/opengraph-image--metadata.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f5b$locale$5d2f$apps$2f5b$slug$5d2f$opengraph$2d$image$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/[locale]/apps/[slug]/opengraph-image.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$lib$2f$metadata$2f$get$2d$metadata$2d$route$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/lib/metadata/get-metadata-route.js [app-rsc] (ecmascript)");
;
;
const imageModule = {
    alt: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f5b$locale$5d2f$apps$2f5b$slug$5d2f$opengraph$2d$image$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["alt"],
    contentType: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f5b$locale$5d2f$apps$2f5b$slug$5d2f$opengraph$2d$image$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["contentType"],
    size: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f5b$locale$5d2f$apps$2f5b$slug$5d2f$opengraph$2d$image$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["size"]
};
async function __TURBOPACK__default__export__(props) {
    const { __metadata_id__: _, ...params } = await props.params;
    const imageUrl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$lib$2f$metadata$2f$get$2d$metadata$2d$route$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fillMetadataSegment"])("/[locale]/apps/[slug]", params, "opengraph-image");
    function getImageMetadata(imageMetadata, idParam) {
        const data = {
            alt: imageMetadata.alt,
            type: imageMetadata.contentType || 'image/png',
            url: imageUrl + (idParam ? '/' + idParam : '') + "?671732b0b3c42c87"
        };
        const { size } = imageMetadata;
        if (size) {
            data.width = size.width;
            data.height = size.height;
        }
        return data;
    }
    return [
        getImageMetadata(imageModule, '')
    ];
}
}),
];

//# sourceMappingURL=src_3532a35c._.js.map