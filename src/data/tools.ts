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
  /** Public source repository. All seven are source-available on GitHub. */
  source: string;
}

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
  },
  {
    id: 'ais-monitor',
    source: 'https://github.com/Bennekrouf/ais-monitor',
    name: 'AIS Monitor',
    tech: 'Rust · Dioxus · Azure CLI · ais-chain · D3.js',
    status: 'beta',
    tags: ['azure'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${monitorDl}/ais-monitor-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${monitorDl}/ais-monitor-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${monitorDl}/ais-monitor-setup.exe` },
    ],
  },
  {
    id: 'ais-tracing',
    source: 'https://github.com/Bennekrouf/ais-tracing',
    name: 'AIS Tracing',
    tech: 'Rust · Dioxus · Azure Cosmos DB',
    status: 'beta',
    tags: ['azure'],
    dataSource: cosmosSource,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${tracingDl}/ais-tracing-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${tracingDl}/ais-tracing-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${tracingDl}/ais-tracing-setup.exe` },
    ],
  },
  {
    id: 'ais-analytics',
    source: 'https://github.com/Bennekrouf/ais-analytics',
    name: 'AIS Analytics',
    tech: 'Rust · Dioxus · Azure Log Analytics',
    status: 'beta',
    tags: ['azure'],
    dataSource: logAnalyticsSource,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${analyticsDl}/ais-analytics-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${analyticsDl}/ais-analytics-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${analyticsDl}/ais-analytics-setup.exe` },
    ],
  },
  {
    id: 'blog-toolkit',
    source: 'https://github.com/Bennekrouf/blog-toolkit',
    name: 'Blog Toolkit',
    tech: 'Rust · Dioxus · DeepSeek / Claude · Markdown',
    status: 'live',
    tags: ['blog'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${blogtkDl}/blog-toolkit-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${blogtkDl}/blog-toolkit-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${blogtkDl}/blog-toolkit-setup.exe` },
    ],
  },
  {
    id: 'appscreens',
    source: 'https://github.com/Bennekrouf/appscreens',
    name: 'AppScreens',
    tech: 'Rust · Dioxus · Xcode · Gradle · image · imageproc',
    status: 'beta',
    tags: ['tools'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${screensDl}/appscreens-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64 (.deb)', href: `${screensDl}/appscreens-linux-x86_64.deb` },
      { os: 'windows', label: 'Windows', href: `${screensDl}/appscreens-windows-setup.msi` },
    ],
  },
  {
    id: 'gitagent',
    source: 'https://github.com/Bennekrouf/gitagent',
    name: 'GitAgent',
    tech: 'Rust · Dioxus · ollama / DeepSeek · git · gh',
    status: 'wip',
    tags: ['git'],
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${gitagentDl}/gitagent-macos-arm64.dmg` },
      { os: 'linux', label: 'Linux x86_64', href: `${gitagentDl}/gitagent-linux-x86_64.tar.gz` },
      { os: 'windows', label: 'Windows', href: `${gitagentDl}/gitagent-setup.exe` },
    ],
  },
];

// Map tool id → translation key prefix in messages/{en,fr}.json "apps".
export const appI18nKey: Record<string, string> = {
  'ais-runner': 'ais_runner',
  'ais-monitor': 'ais_monitor',
  'ais-tracing': 'ais_tracing',
  'ais-analytics': 'ais_analytics',
  'blog-toolkit': 'blog_toolkit',
  appscreens: 'appscreens',
  gitagent: 'gitagent',
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
export const LICENCE_URL = 'https://polyformproject.org/licenses/noncommercial/1.0.0/';

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

// Every desktop tool gets its own page at /{locale}/apps/{id}. The id is
// already URL-safe and stable, so it doubles as the route slug — no separate
// slug field to keep in sync.
export const toolSlugs = desktopToolsConfig.map((t) => t.id);

export function getToolBySlug(slug: string): DesktopToolConfig | undefined {
  return desktopToolsConfig.find((t) => t.id === slug);
}

// Sibling tools for the "related" strip on a detail page: same tag first
// (the AIS suite hangs together this way), topped up to `limit` with whatever
// else is in the catalogue so a single-tag tool never renders an empty strip.
export function getRelatedTools(slug: string, limit = 3): DesktopToolConfig[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  const others = desktopToolsConfig.filter((t) => t.id !== slug);
  const sameTag = others.filter((t) => t.tags.some((tag) => tool.tags.includes(tag)));
  const rest = others.filter((t) => !sameTag.includes(t));
  return [...sameTag, ...rest].slice(0, limit);
}
