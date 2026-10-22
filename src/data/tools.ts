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
const surfaceWatchDl = 'https://mayorana.ch/downloads/surface-watch/latest';

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
    tech: 'Rust · Dioxus · Mistral / Claude · Markdown',
    status: 'live',
    tags: ['blog'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${publishkitDl}/publishkit-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${publishkitDl}/publishkit-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${publishkitDl}/publishkit-setup.exe` },
    ],
  },
  {
    id: 'shipscreen',
    pro: {},
    source: 'https://github.com/bennekrouf/shipscreen',
    name: 'ShipScreen',
    tech: 'Rust · Dioxus · Xcode · Gradle · image · imageproc',
    status: 'live',
    tags: ['tools'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${shipscreenDl}/shipscreen-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64 (.deb)', href: `${shipscreenDl}/shipscreen-linux-x86_64.deb` },
      { os: 'windows', label: 'Windows', href: `${shipscreenDl}/shipscreen-windows-setup.exe` },
    ],
  },
  {
    id: 'gitagent',
    pro: {},
    source: 'https://github.com/Bennekrouf/gitagent',
    name: 'GitAgent',
    tech: 'Rust · Dioxus · ollama / Mistral · git · gh',
    status: 'live',
    tags: ['git'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${gitagentDl}/gitagent-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${gitagentDl}/gitagent-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${gitagentDl}/gitagent-setup.exe` },
    ],
    claudeSkill: `${gitagentDl}/gitagent-claude-skill.zip`,
  },
  {
    id: 'trackcut',
    source: 'https://github.com/bennekrouf/trackcut',
    name: 'TrackCut',
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
  },
  {
    id: 'spreadradar',
    source: 'https://github.com/bennekrouf/spreadradar',
    name: 'SpreadRadar',
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
  },
  {
    id: 'polishcast',
    pro: { product: 'small-video' },
    source: 'https://github.com/bennekrouf/polishcast',
    name: 'PolishCast',
    tech: 'Rust · Dioxus · ScreenCaptureKit · ffmpeg',
    status: 'live',
    tags: ['tools'],
    applicationCategory: 'MultimediaApplication',
    downloads: [
      { os: 'mac', label: 'macOS 15+ (Apple Silicon)', href: `${polishcastDl}/polishcast-macos-arm64.dmg` },
      // No Linux build: recording is not supported there (see the app's FAQ).
      { os: 'windows', label: 'Windows 10+', href: `${polishcastDl}/polishcast-setup.exe` },
    ],
  },
  {
    id: 'jobscout',
    pro: { monthlySearches: { free: 10, basic: 50, pro: 500, max: 1000 } },
    source: 'https://github.com/bennekrouf/jobscout',
    name: 'JobScout',
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
  },
  {
    id: 'surface-watch',
    pro: {},
    source: 'https://github.com/bennekrouf/surface-watch',
    name: 'Surface Watch',
    tech: 'Rust · Dioxus · REA · Node.js · Chrome',
    status: 'beta',
    tags: ['security'],
    applicationCategory: 'SecurityApplication',
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${surfaceWatchDl}/surface-watch-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${surfaceWatchDl}/surface-watch-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${surfaceWatchDl}/surface-watch-setup.exe` },
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
  'surface-watch': 'surface_watch',
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
  linux: 'bg-orange-600  hover:bg-orange-500  text-white',
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
  'surface-watch',
];

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
