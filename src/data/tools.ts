// Single source of truth for the desktop tool catalogue.
//
// Extracted out of the Apps page so the Solutions pages can render the same
// tools without a second copy of the download URLs drifting out of date.
// Kept free of JSX so it stays a plain data module: `os` and `dataSource.id`
// are tags that the rendering components map to icons.

export type Status = 'live' | 'beta' | 'wip' | 'mvp' | 'coming_soon';

export type OS = 'mac' | 'linux' | 'windows';

export interface DownloadLink {
  os: OS;
  label: string;
  href: string;
}

export type DataSourceId = 'cosmos' | 'log-analytics';

export interface DataSource {
  id: DataSourceId;
  label: string;
  colorClasses: string;
  borderClass: string;
}

export interface DesktopToolConfig {
  id: string;
  name: string;
  tech: string;
  status: Status;
  tags: string[];
  downloads: DownloadLink[];
  dataSource?: DataSource;
  /** Public source repository. Every tool is source-available on GitHub. */
  source: string;
  /** schema.org applicationCategory for the detail page. Defaults to DeveloperApplication. */
  applicationCategory?: string;
  /**
   * The tool has a Pro edition, unlocked by a plan that lists it (see
   * src/lib/plans.ts and /pricing). The detail page links to the plans.
   *
   * `product` is the id the plans and licences use, when it is not the tool's
   * id: TrackCut, SpreadRadar and PolishCast were renamed, and the apps still
   * check for their old ids.
   *
   * `monthlySearches`, by plan id, is what a plan sets for a tool whose plans
   * differ by searches a month rather than by AI credits (JobScout; `free` is
   * the app without a plan). The app enforces the same numbers.
   */
  pro?: { product?: string; monthlySearches?: Record<string, number> };
  /**
   * A Claude skill for the people using the tool, packaged by the tool's
   * release CI next to its builds. The detail page only shows it once the file
   * is actually there — see src/lib/claudeSkill.ts.
   */
  claudeSkill?: string;
  /**
   * The tool's MCP server, where each installer puts it, so the detail page
   * can give the one line that adds it to Claude Code. Same paths the apps'
   * own MCP windows show, for a default install: /Applications on macOS, the
   * per-user Inno Setup folder on Windows, and the extracted archive (or the
   * .deb's /usr/bin) on Linux. `args` is what the executable needs to start
   * as a server; AIS Runner ships a separate binary that needs none.
   */
  mcp?: { mac: string; windows: string; linux?: string; args?: string };
  /**
   * A screenshot of the app's main window, in public/, shown under the
   * download on the detail page. The same image heads the app's README. Its
   * size is given so the page keeps the space before the image loads; the alt
   * text is in the copy, under app_detail.apps.<key>.screenshot_alt.
   */
  screenshot?: { src: string; width: number; height: number };
}

// Builds are served from mayorana.ch; `latest/` is overwritten by release CI,
// so these URLs never need bumping. The repositories themselves are public and
// source-available under PolyForm Noncommercial 1.0.0, so each tool also links
// to its source — see `source` on each entry and LICENCE_URL below.
//
// ShipScreen, PublishKit, TrackCut, SpreadRadar and PolishCast were renamed
// from AppScreens, Blog Toolkit, Splitter, Spreadwatch and Small Video; their
// builds were given the new names on the server by
// scripts/migrate-renamed-downloads.sh.
const runnerDl = 'https://mayorana.ch/downloads/ais-runner/latest';
const monitorDl = 'https://mayorana.ch/downloads/ais-monitor/latest';
const tracingDl = 'https://mayorana.ch/downloads/ais-tracing/latest';
const analyticsDl = 'https://mayorana.ch/downloads/ais-analytics/latest';
const gitagentDl = 'https://mayorana.ch/downloads/gitagent/latest';
const publishkitDl = 'https://mayorana.ch/downloads/publishkit/latest';
const shipscreenDl = 'https://mayorana.ch/downloads/shipscreen/latest';
const trackcutDl = 'https://mayorana.ch/downloads/trackcut/latest';
const spreadradarDl = 'https://mayorana.ch/downloads/spreadradar/latest';
const polishcastDl = 'https://mayorana.ch/downloads/polishcast/latest';
const jobscoutDl = 'https://mayorana.ch/downloads/jobscout/latest';
const surfacewatchDl = 'https://mayorana.ch/downloads/surfacewatch/latest';

export const cosmosSource: DataSource = {
  id: 'cosmos',
  label: 'Cosmos DB',
  colorClasses: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  borderClass: 'border-l-4 border-l-violet-500',
};

export const logAnalyticsSource: DataSource = {
  id: 'log-analytics',
  label: 'Log Analytics',
  colorClasses: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  borderClass: 'border-l-4 border-l-teal-500',
};

// Per-app static config. Translatable strings (tagline, description) live in
// messages/{en,fr}.json under the "apps"/"portfolio" namespaces and are looked
// up by id via `appI18nKey`.
export const desktopToolsConfig: DesktopToolConfig[] = [
  {
    id: 'ais-runner',
    source: 'https://github.com/Bennekrouf/ais-runner',
    name: 'AIS Runner',
    tech: 'Rust · Dioxus · Azure CLI · Azurite · Azure Functions',
    status: 'live',
    tags: ['azure'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${runnerDl}/ais-runner-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${runnerDl}/ais-runner-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${runnerDl}/ais-runner-setup.exe` },
    ],
    claudeSkill: `${runnerDl}/ais-runner-claude-skill.zip`,
    mcp: {
      mac: '/Applications/AIS Runner.app/Contents/MacOS/ais-mcp',
      windows: '%LOCALAPPDATA%\\Programs\\AIS Runner\\ais-mcp.exe',
      linux: '$HOME/ais-runner-linux-x86_64/ais-mcp',
    },
  },
  {
    id: 'ais-monitor',
    source: 'https://github.com/Bennekrouf/ais-monitor',
    name: 'AIS Monitor',
    tech: 'Rust · Dioxus · Azure CLI · ais-chain · D3.js',
    status: 'live',
    tags: ['azure'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${monitorDl}/ais-monitor-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${monitorDl}/ais-monitor-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${monitorDl}/ais-monitor-setup.exe` },
    ],
    claudeSkill: `${monitorDl}/ais-monitor-claude-skill.zip`,
  },
  {
    id: 'ais-tracing',
    source: 'https://github.com/Bennekrouf/ais-tracing',
    name: 'AIS Tracing',
    tech: 'Rust · Dioxus · Azure Cosmos DB',
    status: 'live',
    tags: ['azure'],
    dataSource: cosmosSource,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${tracingDl}/ais-tracing-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${tracingDl}/ais-tracing-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${tracingDl}/ais-tracing-setup.exe` },
    ],
    claudeSkill: `${tracingDl}/ais-tracing-claude-skill.zip`,
  },
  {
    id: 'ais-analytics',
    source: 'https://github.com/Bennekrouf/ais-analytics',
    name: 'AIS Analytics',
    tech: 'Rust · Dioxus · Azure Log Analytics',
    status: 'live',
    tags: ['azure'],
    dataSource: logAnalyticsSource,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${analyticsDl}/ais-analytics-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${analyticsDl}/ais-analytics-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${analyticsDl}/ais-analytics-setup.exe` },
    ],
    claudeSkill: `${analyticsDl}/ais-analytics-claude-skill.zip`,
  },
  {
    id: 'publishkit',
    source: 'https://github.com/bennekrouf/publishkit',
    name: 'PublishKit',
    screenshot: { src: '/image/apps/publishkit.png', width: 1920, height: 1248 },
    tech: 'Rust · Dioxus · Mistral / Claude · Markdown',
    status: 'live',
    tags: ['blog'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${publishkitDl}/publishkit-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${publishkitDl}/publishkit-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${publishkitDl}/publishkit-setup.exe` },
    ],
    mcp: {
      mac: '/Applications/PublishKit.app/Contents/MacOS/publishkit',
      // The Windows installer still installs under its old name.
      windows: '%LOCALAPPDATA%\\Programs\\Blog Manager\\publishkit.exe',
      linux: '$HOME/publishkit-linux-x86_64/publishkit',
      args: 'mcp',
    },
  },
  {
    id: 'shipscreen',
    pro: {},
    source: 'https://github.com/bennekrouf/shipscreen',
    name: 'ShipScreen',
    screenshot: { src: '/image/apps/shipscreen.png', width: 1920, height: 1679 },
    tech: 'Rust · Dioxus · Xcode · Gradle · image · imageproc',
    status: 'live',
    tags: ['tools'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${shipscreenDl}/shipscreen-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64 (.deb)', href: `${shipscreenDl}/shipscreen-linux-x86_64.deb` },
      { os: 'windows', label: 'Windows', href: `${shipscreenDl}/shipscreen-windows-setup.exe` },
    ],
    mcp: {
      mac: '/Applications/ShipScreen.app/Contents/MacOS/shipscreen',
      windows: '%LOCALAPPDATA%\\Programs\\ShipScreen\\shipscreen.exe',
      linux: '/usr/bin/shipscreen',
      args: 'mcp',
    },
  },
  {
    id: 'gitagent',
    pro: {},
    source: 'https://github.com/Bennekrouf/gitagent',
    name: 'GitAgent',
    screenshot: { src: '/image/apps/gitagent.png', width: 1921, height: 1028 },
    tech: 'Rust · Dioxus · ollama / Mistral · git · gh',
    status: 'live',
    tags: ['git'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${gitagentDl}/gitagent-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${gitagentDl}/gitagent-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${gitagentDl}/gitagent-setup.exe` },
    ],
    claudeSkill: `${gitagentDl}/gitagent-claude-skill.zip`,
    mcp: {
      mac: '/Applications/GitAgent.app/Contents/MacOS/gitagent',
      windows: '%LOCALAPPDATA%\\Programs\\GitAgent\\gitagent.exe',
      linux: '$HOME/gitagent-linux-x86_64/gitagent',
      args: 'mcp',
    },
  },
  {
    id: 'trackcut',
    source: 'https://github.com/bennekrouf/trackcut',
    name: 'TrackCut',
    screenshot: { src: '/image/apps/trackcut.png', width: 1920, height: 1278 },
    tech: 'Rust · Dioxus · symphonia · LAME · FLAC · yt-dlp',
    status: 'live',
    tags: ['audio'],
    applicationCategory: 'MultimediaApplication',
    pro: { product: 'splitter' },
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${trackcutDl}/trackcut-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${trackcutDl}/trackcut-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${trackcutDl}/trackcut-setup.exe` },
    ],
    mcp: {
      mac: '/Applications/TrackCut.app/Contents/MacOS/trackcut',
      windows: '%LOCALAPPDATA%\\Programs\\TrackCut\\trackcut.exe',
      linux: '$HOME/trackcut-linux-x86_64/trackcut',
      args: 'mcp',
    },
  },
  {
    id: 'spreadradar',
    source: 'https://github.com/bennekrouf/spreadradar',
    name: 'SpreadRadar',
    screenshot: { src: '/image/apps/spreadradar.png', width: 1920, height: 1314 },
    tech: 'Rust · Dioxus · WebSockets · Solana · Jupiter',
    status: 'live',
    tags: ['crypto'],
    applicationCategory: 'FinanceApplication',
    pro: { product: 'spreadwatch' },
    downloads: [
      // One universal DMG: Apple Silicon and Intel.
      { os: 'mac', label: 'macOS (Apple Silicon & Intel)', href: `${spreadradarDl}/spreadradar-macos.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${spreadradarDl}/spreadradar-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${spreadradarDl}/spreadradar-setup.exe` },
    ],
    mcp: {
      mac: '/Applications/SpreadRadar.app/Contents/MacOS/spreadradar',
      windows: '%LOCALAPPDATA%\\Programs\\SpreadRadar\\spreadradar.exe',
      linux: '$HOME/spreadradar-linux-x86_64/spreadradar',
      args: 'mcp',
    },
  },
  {
    id: 'polishcast',
    pro: { product: 'small-video' },
    source: 'https://github.com/bennekrouf/polishcast',
    name: 'PolishCast',
    screenshot: { src: '/image/apps/polishcast.png', width: 1920, height: 1278 },
    tech: 'Rust · Dioxus · ScreenCaptureKit · ffmpeg',
    status: 'live',
    tags: ['tools'],
    applicationCategory: 'MultimediaApplication',
    downloads: [
      { os: 'mac', label: 'macOS 15+ (Apple Silicon)', href: `${polishcastDl}/polishcast-macos-arm64.dmg` },
      // No Linux build: recording is not supported there (see the app's FAQ).
      { os: 'windows', label: 'Windows 10+', href: `${polishcastDl}/polishcast-setup.exe` },
    ],
    mcp: {
      mac: '/Applications/PolishCast.app/Contents/MacOS/polishcast',
      windows: '%LOCALAPPDATA%\\Programs\\PolishCast\\polishcast.exe',
      args: 'mcp',
    },
  },
  {
    id: 'jobscout',
    pro: { monthlySearches: { free: 10, basic: 50, pro: 500, max: 1000 } },
    source: 'https://github.com/bennekrouf/jobscout',
    name: 'JobScout',
    screenshot: { src: '/image/apps/jobscout.png', width: 1920, height: 1259 },
    tech: 'Rust · Dioxus · Mistral / ollama · WebKit · Camoufox',
    status: 'live',
    tags: ['ai'],
    applicationCategory: 'BusinessApplication',
    downloads: [
      // One universal DMG: Apple Silicon and Intel.
      { os: 'mac', label: 'macOS (Apple Silicon & Intel)', href: `${jobscoutDl}/jobscout-macos.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${jobscoutDl}/jobscout-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${jobscoutDl}/jobscout-setup.exe` },
    ],
    mcp: {
      mac: '/Applications/JobScout.app/Contents/MacOS/jobscout',
      windows: '%LOCALAPPDATA%\\Programs\\JobScout\\jobscout.exe',
      linux: '$HOME/jobscout-linux-x86_64/jobscout',
      args: 'mcp',
    },
  },
  {
    id: 'surfacewatch',
    // Licences name it by its id from before SurfaceWatch.
    pro: { product: 'surface-watch' },
    source: 'https://github.com/bennekrouf/surface-watch',
    name: 'SurfaceWatch',
    screenshot: { src: '/image/apps/surfacewatch.png', width: 1920, height: 1278 },
    tech: 'Rust · Dioxus · REA · Node.js · Chrome',
    status: 'beta',
    tags: ['security'],
    applicationCategory: 'SecurityApplication',
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${surfacewatchDl}/surfacewatch-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${surfacewatchDl}/surfacewatch-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${surfacewatchDl}/surfacewatch-setup.exe` },
    ],
  },
];

// Map tool id → translation key prefix in messages/{en,fr}.json "apps".
/** The id plans and licences know this tool by, for a tool with a Pro edition. */
export function planProductId(tool: DesktopToolConfig) {
  return tool.pro ? (tool.pro.product ?? tool.id) : undefined;
}

/** The tools a plan's `products` make Pro; "*" is every one of them. */
export function toolsForPlanProducts(products: string[]) {
  return desktopToolsConfig.filter((tool) => {
    const id = planProductId(tool);
    return !!id && (products.includes('*') || products.includes(id));
  });
}

export const appI18nKey: Record<string, string> = {
  'ais-runner': 'ais_runner',
  'ais-monitor': 'ais_monitor',
  'ais-tracing': 'ais_tracing',
  'ais-analytics': 'ais_analytics',
  publishkit: 'publishkit',
  shipscreen: 'shipscreen',
  gitagent: 'gitagent',
  trackcut: 'trackcut',
  spreadradar: 'spreadradar',
  polishcast: 'polishcast',
  jobscout: 'jobscout',
  surfacewatch: 'surfacewatch',
};

// The Azure Integration Suite, in the order the Solutions page presents them:
// develop locally → see how workflows connect → trace one value through them.
export const AIS_TOOL_IDS = ['ais-runner', 'ais-monitor', 'ais-tracing', 'ais-analytics'] as const;

export const aisTools = AIS_TOOL_IDS.map((id) => {
  const tool = desktopToolsConfig.find((t) => t.id === id);
  if (!tool) throw new Error(`AIS tool "${id}" missing from desktopToolsConfig`);
  return tool;
});

// Every tool ships under the same licence: free for personal, educational and
// non-profit use, commercial use requires a licence. The site must not describe
// the downloads as simply "free" — that is only half of it.
// No trailing slash: polyformproject.org serves the licence at the bare path
// and 404s on `.../1.0.0/`.
export const LICENCE_URL = 'https://polyformproject.org/licenses/noncommercial/1.0.0';

export const osColors: Record<OS, string> = {
  mac: 'bg-neutral-800 hover:bg-neutral-700 text-white',
  linux: 'bg-orange-700  hover:bg-orange-600  text-white',
  windows: 'bg-blue-600    hover:bg-blue-500    text-white',
};

export const statusBadge: Record<Status, string> = {
  live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  mvp: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  wip: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  coming_soon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

export const statusLabel = (status: Status) => (status === 'coming_soon' ? 'COMING SOON' : status);

// Tools that publish release notes, and so have a page at
// /{locale}/apps/{id}/releases. Kept here, as ids only, because the pages that
// link to it run on the client — importing the notes themselves to answer
// "is there a page?" would ship every release of every tool in the bundle.
// src/lib/releases.ts holds the notes and checks itself against this list.
export const releaseNotesTools: string[] = [
  'ais-runner',
  'ais-monitor',
  'ais-tracing',
  'ais-analytics',
  'publishkit',
  'shipscreen',
  'gitagent',
  'trackcut',
  'spreadradar',
  'polishcast',
  'jobscout',
  'surfacewatch',
];

export type McpClient = 'claude' | 'codex';

/**
 * The line that adds a tool's MCP server to a client for every project, one
 * per OS it has a path for — the same lines the app's own MCP window gives.
 * Codex has no scopes: a server added with `codex mcp add` is always global.
 * Windows uses %LOCALAPPDATA%, which Command Prompt expands.
 */
export function mcpInstallCommands(
  tool: DesktopToolConfig,
  client: McpClient,
): { os: OS; command: string }[] {
  const { mcp } = tool;
  if (!mcp) return [];
  const add = client === 'claude' ? `claude mcp add ${tool.id} --scope user` : `codex mcp add ${tool.id}`;
  const line = (path: string) => `${add} -- "${path}"${mcp.args ? ` ${mcp.args}` : ''}`;
  const paths: [OS, string | undefined][] = [
    ['mac', mcp.mac],
    ['windows', mcp.windows],
    ['linux', mcp.linux],
  ];
  return paths.flatMap(([os, path]) => (path ? [{ os, command: line(path) }] : []));
}

export const hasReleaseNotes = (toolId: string) => releaseNotesTools.includes(toolId);

// Every desktop tool gets its own page at /{locale}/apps/{id}. The id is
// already URL-safe and stable, so it doubles as the route slug — no separate
// slug field to keep in sync.
export const toolSlugs = desktopToolsConfig.map((t) => t.id);

export function getToolBySlug(slug: string): DesktopToolConfig | undefined {
  return desktopToolsConfig.find((t) => t.id === slug);
}

// Sibling tools for the "related" strip on a detail page: same tag first
// (the AIS suite hangs together this way), topped up to `limit` with whatever
// else is in the catalogue. A tool with no same-tag sibling gets no strip at
// all: filling it with unrelated tools (AIS Runner under a crypto app) reads
// as a suggestion that they belong together.
export function getRelatedTools(slug: string, limit = 3): DesktopToolConfig[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  const others = desktopToolsConfig.filter((t) => t.id !== slug);
  const sameTag = others.filter((t) => t.tags.some((tag) => tool.tags.includes(tag)));
  if (sameTag.length === 0) return [];
  const rest = others.filter((t) => !sameTag.includes(t));
  return [...sameTag, ...rest].slice(0, limit);
}
