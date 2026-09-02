'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import LayoutTemplate from '@/components/layout/LayoutTemplate';
import { motion } from '@/components/ui/Motion';
import { Brain, Shield, Zap, Code, ExternalLink, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { getLocalizedPath } from '@/lib/i18n-utils';
import {
  appI18nKey,
  desktopToolsConfig,
  type DataSource,
  type DownloadLink,
  type Status,
} from '@/data/tools';
import { DataSourceBadge, DownloadButtons, StatusBadge } from '@/components/ui/ToolVisuals';

// What the card's action area renders. One shape per kind, so a desktop tool
// gets its per-OS download buttons and a hosted product gets a single link —
// the card doesn't need to know which of these it is beyond this tag.
type ToolAction =
  | { kind: 'downloads'; downloads: DownloadLink[] }
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

// Display order by tool id, split into the two sections the page renders.
// Anything built below but missing from both lists simply wouldn't render —
// every id from desktopToolsConfig/webTools/consultingTool must appear exactly
// once across the two.

// The tools that carry the positioning: Azure workflows and AI agents.
const PRIMARY_ORDER: string[] = [
  'ais-runner',
  'ais-monitor',
  'ais-tracing',
  'ais-analytics',
  'api0',
  'gitagent',
];

// Built on the same stack, but outside the core offer. `consulting` stays last
// as the "your project" CTA card.
const SECONDARY_ORDER: string[] = [
  'cvenom',
  'appscreens',
  'blog-toolkit',
  'solanize',
  'consulting',
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

function ToolActionButtons({ action }: { action: ToolAction }) {
  switch (action.kind) {
    case 'downloads':
      return <DownloadButtons downloads={action.downloads} />;
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

// One card, used by both sections. `muted` gives the secondary section a
// quieter surface — content and controls are identical either way.
function ToolCard({
  tool,
  index,
  muted = false,
}: {
  tool: Tool;
  index: number;
  muted?: boolean;
}) {
  const surface = muted
    ? 'bg-background/60 hover:shadow-lg'
    : 'bg-gradient-to-br from-secondary/50 to-secondary/20 hover:shadow-2xl';

  return (
    <motion.div
      id={tool.id}
      className={`scroll-mt-24 group relative overflow-hidden rounded-2xl border border-border p-6 transition-all duration-300 flex flex-col ${surface} ${tool.dataSource?.borderClass ?? ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.05 }}
    >
      <div className="flex items-start justify-between mb-3 gap-2">
        {tool.icon ? (
          <div className="p-3 bg-primary/10 rounded-full text-primary">{tool.icon}</div>
        ) : (
          <h3 className="text-xl font-bold text-primary">{tool.name}</h3>
        )}
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={tool.status} />
          {tool.dataSource && <DataSourceBadge dataSource={tool.dataSource} />}
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
        <ToolActionButtons action={tool.action} />
      </div>
    </motion.div>
  );
}

export default function AppsPage() {
  const tPortfolio = useTranslations('portfolio');
  const tApps = useTranslations('apps');
  const locale = useLocale();
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const toggleTag = (id: string) => {
    setActiveTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const tools = useMemo<{ primary: Tool[]; secondary: Tool[] }>(() => {
    const desktopTools: Tool[] = desktopToolsConfig.map((app) => ({
      id: app.id,
      name: app.name,
      tagline: tApps(`${appI18nKey[app.id]}_tagline`),
      description: tApps(`${appI18nKey[app.id]}_description`),
      tech: app.tech,
      status: app.status,
      tags: app.tags,
      dataSource: app.dataSource,
      action: { kind: 'downloads', downloads: app.downloads },
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
    const inOrder = (order: string[]) =>
      order
        .map((id) => all.find((t) => t.id === id))
        .filter((t): t is Tool => t !== undefined);

    return { primary: inOrder(PRIMARY_ORDER), secondary: inOrder(SECONDARY_ORDER) };
  }, [tApps, tPortfolio, locale]);

  // Filters apply across both sections; a section with no matches is hidden
  // rather than left as an empty heading.
  const visible = useMemo(() => {
    const match = (list: Tool[]) =>
      activeTags.length === 0
        ? list
        : list.filter((tool) => tool.tags.some((t) => activeTags.includes(t)));
    return { primary: match(tools.primary), secondary: match(tools.secondary) };
  }, [tools, activeTags]);

  const nothingMatches = visible.primary.length === 0 && visible.secondary.length === 0;

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

      {/* Intro + filters */}
      <section className="pt-12 bg-background">
        <div className="container max-w-6xl">
          <p className="text-muted-foreground max-w-3xl mb-8">{tApps('intro')}</p>

          <div className="flex flex-wrap gap-2 mb-4">
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

          {nothingMatches && (
            <p className="py-12 text-center text-muted-foreground">{tApps('no_matching_tools')}</p>
          )}
        </div>
      </section>

      {/* Primary tools — the ones carrying the positioning */}
      {visible.primary.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container max-w-6xl">
            <h2 className="text-2xl font-bold mb-8">{tApps('primary_heading')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.primary.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Also built with our stack — quieter treatment, same card content */}
      {visible.secondary.length > 0 && (
        <section className="py-12 bg-secondary/30 border-t border-border">
          <div className="container max-w-6xl">
            <h2 className="text-2xl font-bold mb-2">{tApps('secondary_heading')}</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-2xl">
              {tApps('secondary_intro')}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.secondary.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} muted />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <section className="py-16 bg-secondary">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-4">{tApps('more_coming_soon')}</h2>
          <p className="text-muted-foreground mb-6">
            {tApps('more_coming_soon_subtitle')}
          </p>
          <Link
            href={getLocalizedPath(locale, '/contact')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {tApps('more_coming_soon_cta')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </LayoutTemplate>
  );
}
