'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { FaGithub, FaApple, FaLinux, FaWindows } from 'react-icons/fa';
import { Brain, Shield, Zap, Code, ExternalLink, ArrowRight, Database, BarChart3 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';

type Status = 'live' | 'beta' | 'wip' | 'mvp' | 'coming_soon';

interface DownloadLink {
  os: 'mac' | 'linux' | 'windows';
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface DataSource {
  label: string;
  icon: React.ReactNode;
  colorClasses: string;
  borderClass: string;
}

// What the card's action area renders. One shape per kind, so a tool with a
// GitHub build gets download buttons, a hosted product gets a single link,
// and a source-only project gets a "run from source" button — the card
// doesn't need to know which of these it is beyond this tag.
type ToolAction =
  | { kind: 'downloads'; downloads: DownloadLink[]; github: string }
  | { kind: 'source'; github: string }
  | { kind: 'external'; href: string; label: string }
  | { kind: 'internal'; href: string; label: string }
  | { kind: 'disabled'; label: string };

interface Tool {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  tech: string;
  status: Status;
  tags: string[];
  icon?: React.ReactNode;
  dataSource?: DataSource;
  action: ToolAction;
}

const runner  = 'https://github.com/Bennekrouf/ais-runner';
const monitor = 'https://github.com/Bennekrouf/ais-monitor';
const tracing = 'https://github.com/bennekrouf/ais-tracing';
const analytics = 'https://github.com/bennekrouf/ais-analytics';
const blogtk = 'https://github.com/Bennekrouf/blog-toolkit';
const screens = 'https://github.com/bennekrouf/appscreens';
const gitagent = 'https://github.com/bennekrouf/gitagent';

const cosmosSource: DataSource = {
  label: 'Cosmos DB',
  icon: <Database className="w-3.5 h-3.5" />,
  colorClasses: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  borderClass: 'border-l-4 border-l-violet-500',
};
const logAnalyticsSource: DataSource = {
  label: 'Log Analytics',
  icon: <BarChart3 className="w-3.5 h-3.5" />,
  colorClasses: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  borderClass: 'border-l-4 border-l-teal-500',
};

// Per-app static config. Translatable strings (tagline, description) live in
// messages/{en,fr}.json under the "apps"/"portfolio" namespaces and are
// looked up by id in the component below.
type DesktopToolConfig = {
  id: string;
  name: string;
  tech: string;
  status: Status;
  tags: string[];
  github: string;
  downloads: DownloadLink[];
  dataSource?: DataSource;
};

const desktopToolsConfig: DesktopToolConfig[] = [
  {
    id: 'ais-runner',
    name: 'AIS Runner',
    tech: 'Rust · Dioxus · Azure CLI · Azurite · Azure Functions',
    status: 'live',
    tags: ['azure'],
    github: runner,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${runner}/releases/latest/download/ais-runner-macos-arm64.dmg`, icon: <FaApple className="w-4 h-4" /> },
      { os: 'linux', label: 'Linux x86_64', href: `${runner}/releases/latest/download/ais-runner-linux-x86_64.tar.gz`, icon: <FaLinux className="w-4 h-4" /> },
      { os: 'windows', label: 'Windows', href: `${runner}/releases/latest/download/ais-runner-setup.exe`, icon: <FaWindows className="w-4 h-4" /> },
    ],
  },
  {
    id: 'ais-monitor',
    name: 'AIS Monitor',
    tech: 'Rust · Dioxus · Azure CLI · ais-chain · D3.js',
    status: 'beta',
    tags: ['azure'],
    github: monitor,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${monitor}/releases/latest/download/ais-monitor-macos-arm64.dmg`, icon: <FaApple className="w-4 h-4" /> },
      { os: 'linux', label: 'Linux x86_64', href: `${monitor}/releases/latest/download/ais-monitor-linux-x86_64.tar.gz`, icon: <FaLinux className="w-4 h-4" /> },
      { os: 'windows', label: 'Windows', href: `${monitor}/releases/latest/download/ais-monitor-setup.exe`, icon: <FaWindows className="w-4 h-4" /> },
    ],
  },
  {
    id: 'ais-tracing',
    name: 'AIS Tracing',
    tech: 'Rust · Dioxus · Azure Cosmos DB',
    status: 'beta',
    tags: ['azure'],
    github: tracing,
    dataSource: cosmosSource,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${tracing}/releases/latest/download/ais-tracing-macos-arm64.dmg`, icon: <FaApple className="w-4 h-4" /> },
      { os: 'linux', label: 'Linux x86_64', href: `${tracing}/releases/latest/download/ais-tracing-linux-x86_64.tar.gz`, icon: <FaLinux className="w-4 h-4" /> },
      { os: 'windows', label: 'Windows', href: `${tracing}/releases/latest/download/ais-tracing-setup.exe`, icon: <FaWindows className="w-4 h-4" /> },
    ],
  },
  {
    id: 'ais-analytics',
    name: 'AIS Analytics',
    tech: 'Rust · Dioxus · Azure Log Analytics',
    status: 'beta',
    tags: ['azure'],
    github: analytics,
    dataSource: logAnalyticsSource,
    // Same signing situation as ais-tracing: no macOS build until the Apple
    // signing secrets are configured.
    downloads: [
      { os: 'linux', label: 'Linux x86_64', href: `${analytics}/releases/latest/download/ais-analytics-linux-x86_64.tar.gz`, icon: <FaLinux className="w-4 h-4" /> },
      { os: 'windows', label: 'Windows', href: `${analytics}/releases/latest/download/ais-analytics-setup.exe`, icon: <FaWindows className="w-4 h-4" /> },
    ],
  },
  {
    id: 'blog-toolkit',
    name: 'Blog Toolkit',
    tech: 'Rust · Dioxus · DeepSeek / Claude · Markdown',
    status: 'live',
    tags: ['blog'],
    github: blogtk,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${blogtk}/releases/latest/download/blog-toolkit-macos-arm64.dmg`, icon: <FaApple className="w-4 h-4" /> },
      { os: 'linux', label: 'Linux x86_64', href: `${blogtk}/releases/latest/download/blog-toolkit-linux-x86_64.tar.gz`, icon: <FaLinux className="w-4 h-4" /> },
      { os: 'windows', label: 'Windows', href: `${blogtk}/releases/latest/download/blog-toolkit-setup.exe`, icon: <FaWindows className="w-4 h-4" /> },
    ],
  },
  {
    id: 'appscreens',
    name: 'AppScreens',
    tech: 'Rust · Dioxus · Xcode · Gradle · image · imageproc',
    status: 'beta',
    tags: ['tools'],
    github: screens,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${screens}/releases/latest/download/appscreens-macos-arm64.dmg`, icon: <FaApple className="w-4 h-4" /> },
      { os: 'linux', label: 'Linux x86_64 (.deb)', href: `${screens}/releases/latest/download/appscreens-linux-x86_64.deb`, icon: <FaLinux className="w-4 h-4" /> },
      { os: 'windows', label: 'Windows', href: `${screens}/releases/latest/download/appscreens-windows-setup.msi`, icon: <FaWindows className="w-4 h-4" /> },
    ],
  },
  {
    id: 'gitagent',
    name: 'GitAgent',
    tech: 'Rust · Dioxus · ollama / DeepSeek · git · gh',
    status: 'wip',
    tags: ['git'],
    github: gitagent,
    downloads: [
      { os: 'mac', label: 'macOS (Apple Silicon)', href: `${gitagent}/releases/latest/download/gitagent-macos-arm64.dmg`, icon: <FaApple className="w-4 h-4" /> },
      { os: 'linux', label: 'Linux x86_64', href: `${gitagent}/releases/latest/download/gitagent-linux-x86_64.tar.gz`, icon: <FaLinux className="w-4 h-4" /> },
      { os: 'windows', label: 'Windows', href: `${gitagent}/releases/latest/download/gitagent-setup.exe`, icon: <FaWindows className="w-4 h-4" /> },
    ],
  },
];

// Map DesktopToolConfig.id → translation key prefix in messages/{en,fr}.json "apps"
const appI18nKey: Record<string, string> = {
  'ais-runner':   'ais_runner',
  'ais-monitor':  'ais_monitor',
  'ais-tracing':  'ais_tracing',
  'ais-analytics': 'ais_analytics',
  'blog-toolkit': 'blog_toolkit',
  'appscreens':   'appscreens',
  'gitagent':     'gitagent',
};

const osColors: Record<string, string> = {
  mac:     'bg-neutral-800 hover:bg-neutral-700 text-white',
  linux:   'bg-orange-600  hover:bg-orange-500  text-white',
  windows: 'bg-blue-600    hover:bg-blue-500    text-white',
};

const statusBadge: Record<string, string> = {
  live: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  beta: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  mvp:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  wip:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  coming_soon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
};

// The grid's display order, by tool id. Anything built above but missing
// here simply wouldn't render — every id from desktopToolsConfig/webTools/
// consultingTool must appear exactly once.
const TOOL_ORDER: string[] = [
  'gitagent',
  'ais-runner',
  'ais-monitor',
  'ais-tracing',
  'cvenom',
  'ais-analytics',
  'solanize',
  'consulting',
  'appscreens',
  'api0',
  'blog-toolkit',
];

// Display order and label for each filter chip. A tool can carry tags outside
// this list — they just won't get a chip of their own or be filterable — but
// every tag assigned to a tool above is expected to appear here.
const FILTER_TAGS: { id: string; label: string }[] = [
  { id: 'azure', label: 'Azure' },
  { id: 'git', label: 'Git' },
  { id: 'blog', label: 'Blog' },
  { id: 'api', label: 'API' },
  { id: 'mcp', label: 'MCP' },
  { id: 'ai', label: 'AI' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'tools', label: 'Tools' },
  { id: 'services', label: 'Services' },
];

const tagChipClasses = (active: boolean) =>
  active
    ? 'bg-primary text-white border-primary'
    : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground';

function ToolTags({ tool }: { tool: Tool }) {
  if (tool.tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tool.tags.map((tagId) => {
        const tag = FILTER_TAGS.find((t) => t.id === tagId);
        if (!tag) return null;
        return (
          <span
            key={tagId}
            className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-muted-foreground"
          >
            {tag.label}
          </span>
        );
      })}
    </div>
  );
}

function ToolActionButtons({ action, tApps }: { action: ToolAction; tApps: ReturnType<typeof useTranslations> }) {
  switch (action.kind) {
    case 'downloads':
      return (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {tApps('download_label')}
          </p>
          <div className="flex flex-wrap gap-2">
            {action.downloads.map((dl) => (
              <a
                key={dl.os}
                href={dl.href}
                title={dl.label}
                aria-label={dl.label}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${osColors[dl.os]}`}
              >
                {dl.icon}
              </a>
            ))}
            <a
              href={action.github}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
              aria-label="GitHub"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
            >
              <FaGithub className="w-4 h-4" />
            </a>
          </div>
          <a
            href={`${action.github}/releases/latest`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {tApps('all_releases')}
          </a>
        </div>
      );
    case 'source':
      return (
        <a
          href={action.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-secondary hover:bg-secondary/70 text-foreground border border-border"
        >
          <FaGithub className="w-4 h-4" />
          {tApps('run_from_source')}
        </a>
      );
    case 'external':
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-primary text-white hover:bg-primary/90"
        >
          {action.label}
          <ExternalLink className="ml-1.5 w-3.5 h-3.5" />
        </a>
      );
    case 'internal':
      return (
        <Link
          href={action.href}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          {action.label}
          <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
        </Link>
      );
    case 'disabled':
      return (
        <button
          onClick={() => alert('Coming Soon!')}
          className="inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-400 text-white cursor-not-allowed opacity-70"
        >
          {action.label}
        </button>
      );
  }
}

export default function AppsPage() {
  const tPortfolio = useTranslations('portfolio');
  const tApps = useTranslations('apps');
  const locale = useLocale();
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const toggleTag = (id: string) => {
    setActiveTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const tools: Tool[] = useMemo(() => {
    const desktopTools: Tool[] = desktopToolsConfig.map((app) => ({
      id: app.id,
      name: app.name,
      tagline: tApps(`${appI18nKey[app.id]}_tagline`),
      description: tApps(`${appI18nKey[app.id]}_description`),
      tech: app.tech,
      status: app.status,
      tags: app.tags,
      dataSource: app.dataSource,
      action:
        app.downloads.length > 0
          ? { kind: 'downloads', downloads: app.downloads, github: app.github }
          : { kind: 'source', github: app.github },
    }));

    const webTools: Tool[] = [
      {
        id: 'api0',
        name: 'API0.AI',
        description: tPortfolio('api0_description'),
        tech: tPortfolio('api0_tech'),
        status: 'live',
        tags: ['api', 'mcp'],
        icon: <Brain className="w-8 h-8" />,
        action: { kind: 'external', href: 'https://api0.ai', label: tPortfolio('api0_cta') },
      },
      {
        id: 'cvenom',
        name: 'CVENOM',
        description: tPortfolio('cvenom_description'),
        tech: tPortfolio('cvenom_tech'),
        status: 'live',
        tags: ['ai'],
        icon: <Shield className="w-8 h-8" />,
        action: { kind: 'external', href: 'https://cvenom.com', label: tPortfolio('cvenom_cta') },
      },
      {
        id: 'solanize',
        name: 'SOLANIZE',
        description: tPortfolio('solanize_description'),
        tech: tPortfolio('solanize_tech'),
        status: 'mvp',
        tags: ['crypto'],
        icon: <Zap className="w-8 h-8" />,
        action: { kind: 'external', href: 'https://ribh.io', label: tPortfolio('solanize_cta') },
      },
    ];

    const consultingTool: Tool = {
      id: 'consulting',
      name: tPortfolio('consulting_title'),
      description: tPortfolio('consulting_description'),
      tech: tPortfolio('consulting_tech'),
      status: 'live',
      tags: ['services'],
      icon: <Code className="w-8 h-8" />,
      action: { kind: 'internal', href: getLocalizedPath(locale, '/contact'), label: tPortfolio('consulting_cta') },
    };

    const all = [...webTools, ...desktopTools, consultingTool];
    return TOOL_ORDER
      .map((id) => all.find((t) => t.id === id))
      .filter((t): t is Tool => t !== undefined);
  }, [tApps, tPortfolio, locale]);

  const visibleTools = useMemo(() => {
    if (activeTags.length === 0) return tools;
    return tools.filter((tool) => tool.tags.some((t) => activeTags.includes(t)));
  }, [tools, activeTags]);

  return (
    <LayoutTemplate>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-secondary to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tApps('page_title')}
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {tApps('page_subtitle')}
            </motion.p>
          </div>
        </div>
      </section>

      {/* All tools, filterable by tag */}
      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
            <h2 className="text-2xl font-bold">{tApps('tools_heading')}</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTags([])}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tagChipClasses(activeTags.length === 0)}`}
              >
                {tApps('filter_all')}
              </button>
              {FILTER_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${tagChipClasses(activeTags.includes(tag.id))}`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                id={tool.id}
                className={`scroll-mt-24 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/50 to-secondary/20 border border-border p-6 hover:shadow-2xl transition-all duration-300 flex flex-col ${tool.dataSource?.borderClass ?? ''}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  {tool.icon ? (
                    <div className="p-3 bg-primary/10 rounded-full text-primary">{tool.icon}</div>
                  ) : (
                    <h3 className="text-xl font-bold text-primary">{tool.name}</h3>
                  )}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase whitespace-nowrap ${statusBadge[tool.status]}`}>
                      {tool.status === 'coming_soon' ? 'COMING SOON' : tool.status}
                    </span>
                    {tool.dataSource && (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${tool.dataSource.colorClasses}`}>
                        {tool.dataSource.icon}
                        {tool.dataSource.label}
                      </span>
                    )}
                  </div>
                </div>

                {tool.icon && <h3 className="text-xl font-bold mb-1 text-primary">{tool.name}</h3>}
                {tool.tagline && <p className="text-sm font-medium mb-1">{tool.tagline}</p>}
                <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                <p className="text-xs text-muted-foreground/70 font-mono mb-3">{tool.tech}</p>

                <div className="mb-4">
                  <ToolTags tool={tool} />
                </div>

                <div className="mt-auto">
                  <ToolActionButtons action={tool.action} tApps={tApps} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-secondary">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">{tApps('more_coming_soon')}</h2>
          <p className="text-muted-foreground mb-6">
            {tApps('more_coming_soon_subtitle')}
          </p>
          <a
            href="https://github.com/Bennekrouf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            <FaGithub className="w-5 h-5" />
            github.com/Bennekrouf
          </a>
        </div>
      </section>

    </LayoutTemplate>
  );
}
