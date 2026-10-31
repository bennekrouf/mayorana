// The body of a desktop tool's detail page, shared by the two places it is
// shown: the page of its own at /apps/[slug], and the side panel that opens
// over the catalogue when a card is clicked there (the intercepted route in
// apps/@panel). Both render the same copy; only the frame differs, which is
// what `variant` is for.

import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Check, Download, Github, Scale, Sparkles, Terminal } from 'lucide-react';
import { McpInstall } from '@/components/apps/McpInstall';
import { InstallCommands, type InstallRow } from '@/components/apps/InstallCommands';
import {
  hasPowershellInstall,
  hasShellInstall,
  powershellInstallCommand,
  powershellInstallUrl,
  shellInstallCommand,
  shellInstallUrl,
} from '@/lib/install-scripts';
import { ComparisonTable, type Comparison } from '@/components/ui/ComparisonTable';
import {
  DataSourceBadge,
  DownloadButtonsLarge,
  StatusBadge,
} from '@/components/ui/ToolVisuals';
import {
  appI18nKey,
  getRelatedTools,
  getToolBySlug,
  LICENCE_URL,
  mcpInstallCommands,
  type DesktopToolConfig,
} from '@/data/tools';
import { getPostBySlug } from '@/lib/blog';
import { isClaudeSkillPublished } from '@/lib/claudeSkill';
import { formatReleaseDate, getReleaseFeed, releaseAnchor } from '@/lib/releases';

// Shapes of the array-valued copy, read with t.raw() because next-intl only
// returns strings from t().
type Feature = { title: string; body: string };
type FaqEntry = { q: string; a: string };

export type ToolDetailVariant = 'page' | 'panel';

// Everything the page needs from the copy, resolved once so generateMetadata
// and the component agree on what they are rendering.
export async function loadContent(locale: string, tool: DesktopToolConfig) {
  const t = await getTranslations({ locale, namespace: 'app_detail' });
  const tApps = await getTranslations({ locale, namespace: 'apps' });
  const key = appI18nKey[tool.id];

  return {
    t,
    tagline: tApps(`${key}_tagline`),
    shortDescription: tApps(`${key}_description`),
    seoTitle: t(`apps.${key}.seo_title`),
    seoDescription: t(`apps.${key}.seo_description`),
    overview: t.raw(`apps.${key}.overview`) as string[],
    features: t.raw(`apps.${key}.features`) as Feature[],
    requirements: t.raw(`apps.${key}.requirements`) as string[],
    faq: t.raw(`apps.${key}.faq`) as FaqEntry[],
    articleSlug: t(`apps.${key}.article_slug`),
    // Optional: a tool without a comparison in the copy simply has no table.
    comparison: t.has(`apps.${key}.comparison`)
      ? (t.raw(`apps.${key}.comparison`) as Comparison)
      : null,
  };
}

// The copy plus everything else the body draws on, for a slug that is known
// to exist. Returns null for an unknown slug so each caller can 404 its own way.
export async function loadToolDetail(locale: string, slug: string) {
  const tool = getToolBySlug(slug);
  if (!tool) return null;

  const content = await loadContent(locale, tool);

  // The blog post about this tool, when there is one. The post already links
  // here; this closes the loop so a crawler arriving at either one finds the
  // other. Slugs differ per locale, so the lookup is locale-scoped.
  const article = content.articleSlug ? getPostBySlug(content.articleSlug, locale) : null;

  // The versions this tool has shipped, when it publishes them. A tool that
  // does not simply renders none of this — nothing here is required.
  const feed = await getReleaseFeed(slug);

  // The tool's Claude skill, once its release CI has published it.
  const skillHref =
    tool.claudeSkill && (await isClaudeSkillPublished(tool.claudeSkill)) ? tool.claudeSkill : null;

  return {
    tool,
    content,
    article,
    latest: feed?.releases[0],
    recent: feed?.releases.slice(0, 4) ?? [],
    skillHref,
    related: getRelatedTools(slug),
  };
}

export type ToolDetail = NonNullable<Awaited<ReturnType<typeof loadToolDetail>>>;

export async function ToolDetailContent({
  locale,
  slug,
  detail,
  variant,
}: {
  locale: string;
  slug: string;
  detail: ToolDetail;
  variant: ToolDetailVariant;
}) {
  const { tool, content, article, latest, recent, skillHref, related } = detail;
  const { t, tagline, shortDescription, features, overview, requirements, faq, comparison } =
    content;
  const inPanel = variant === 'panel';

  // The one-line installers (src/lib/install-scripts.ts), labelled by the
  // platforms this tool actually has builds for.
  const hasMac = tool.downloads.some((d) => d.os === 'mac');
  const hasLinux = tool.downloads.some((d) => d.os === 'linux');
  const installRows: InstallRow[] = [
    ...(hasShellInstall(tool)
      ? [{
          label: t(hasMac && hasLinux ? 'install_unix' : hasMac ? 'install_mac' : 'install_linux'),
          command: shellInstallCommand(tool.id),
          scriptUrl: shellInstallUrl(tool.id),
        }]
      : []),
    ...(hasPowershellInstall(tool)
      ? [{
          label: t('install_windows'),
          command: powershellInstallCommand(tool.id),
          scriptUrl: powershellInstallUrl(tool.id),
        }]
      : []),
  ];
  const mcpCommands = mcpInstallCommands(tool, 'claude');

  // The page centres each section in the site container; the panel is already
  // narrow, so its sections just take an even gutter.
  const box = (maxWidth: string) => (inPanel ? 'px-6 sm:px-8' : `container ${maxWidth}`);
  // The page's two-column rows go by the viewport; in a panel that is never
  // wider than a tablet they stay one column until the panel itself is wide.
  const twoCols = inPanel ? 'sm:grid-cols-2' : 'md:grid-cols-2';
  const sectionY = inPanel ? 'py-10' : 'py-14';

  const statusNote =
    tool.status === 'wip'
      ? t('status_note_wip')
      : tool.status === 'beta'
        ? t('status_note_beta')
        : null;

  return (
    <>
      {/* Hero: name, what it is, and the download — the download is the point
          of the page, so it sits above the fold rather than after the copy. */}
      <section
        className={`${inPanel ? 'pt-6' : 'pt-10'} pb-8 bg-gradient-to-b from-secondary to-background`}
      >
        <div className={box('max-w-4xl')}>
          {/* In the panel, the way back to the catalogue is the close button. */}
          {!inPanel && (
            <Link
              href={`/${locale}/apps`}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('back_to_apps')}
            </Link>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge status={tool.status} />
            {tool.dataSource && <DataSourceBadge dataSource={tool.dataSource} />}
            {/* The version a download gets today, and when it shipped: the
                first thing that says this is a live product. Links to that
                release's notes. */}
            {latest && (
              <Link
                href={`/${locale}/apps/${slug}/releases#${releaseAnchor(latest.version)}`}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {t('latest_badge', { version: latest.version, date: formatReleaseDate(latest.date, locale) })}
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>

          {inPanel ? (
            <h2 className="text-3xl font-bold mb-3">{tool.name}</h2>
          ) : (
            <h1 className="text-4xl font-bold mb-3">{tool.name}</h1>
          )}
          <p className="text-xl text-muted-foreground mb-6">{tagline}</p>
          <p className="text-base text-muted-foreground mb-8 max-w-3xl">{shortDescription}</p>

          <DownloadButtonsLarge app={tool.id} appName={tool.name} downloads={tool.downloads} />
          <p className="text-xs text-muted-foreground mt-3 max-w-2xl">
            {t(tool.pro ? `apps.${appI18nKey[tool.id]}.pro_download_intro` : 'download_intro')}
          </p>
          {tool.downloads.some((d) => d.os === 'mac') && (
            <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl">{t('signing_note_mac')}</p>
          )}

          {installRows.length > 0 && (
            <InstallCommands
              heading={t('install_heading')}
              rows={installRows}
              labels={{ copy: t('mcp_copy'), copied: t('mcp_copied'), view: t('install_view') }}
            />
          )}

          {statusNote && (
            <p className="mt-6 text-sm text-muted-foreground border-l-2 border-border pl-4">
              {statusNote}
            </p>
          )}

          {/* What the app looks like, right under the download: the hero
              says what it does, this shows it. */}
          {tool.screenshot && (
            <Image
              src={tool.screenshot.src}
              width={tool.screenshot.width}
              height={tool.screenshot.height}
              alt={t(`apps.${appI18nKey[tool.id]}.screenshot_alt`)}
              sizes={inPanel ? '(min-width: 768px) 720px, 100vw' : '(min-width: 1024px) 896px, 100vw'}
              priority={!inPanel}
              className="mt-10 w-full h-auto rounded-xl border border-border shadow-lg"
            />
          )}
        </div>
      </section>

      {/* Straight after the download: the question a visitor has once they
          know what the tool is, is why this one rather than what they use. */}
      {comparison && (
        <section className="py-12 bg-background">
          <div className={box('max-w-5xl')}>
            <h2 className="text-2xl font-bold mb-2">
              {t('comparison_heading', { name: tool.name })}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
              {t('comparison_intro', { name: tool.name })}
            </p>
            <ComparisonTable
              name={tool.name}
              comparison={comparison}
              labels={{
                feature: t('comparison_feature'),
                yes: t('comparison_yes'),
                no: t('comparison_no'),
                na: t('comparison_na'),
              }}
            />
            <p className="text-xs text-muted-foreground mt-3">
              {t('comparison_note')}{' '}
              <Link
                href={`/${locale}/contact`}
                className="text-primary underline underline-offset-4"
              >
                {t('comparison_note_link')}
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* The second things to download, after the table rather than in the
          hero: the hero is kept short so the comparison is in view on arrival. */}
      {(skillHref || tool.pro || mcpCommands.length > 0) && (
        <section className="pb-12 bg-background">
          <div className={`${box('max-w-4xl')} space-y-8`}>
            {skillHref && (
              <div className="max-w-2xl rounded-xl border border-border bg-background/60 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 sm:flex-1">
                    <p className="text-sm font-semibold">{t('skill_heading')}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t('skill_body', { name: tool.name })}
                    </p>
                  </div>
                  <a
                    href={skillHref}
                    download
                    className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    <Download className="h-4 w-4" />
                    {t('skill_download')}
                  </a>
                </div>
                <details className="mt-3 text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    {t('skill_install_summary')}
                  </summary>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4">
                    <li>{t('skill_install_claude_ai')}</li>
                    <li>{t('skill_install_claude_code', { id: tool.id })}</li>
                  </ul>
                </details>
              </div>
            )}

            {mcpCommands.length > 0 && (
              <div className="max-w-2xl rounded-xl border border-border bg-background/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Terminal className="h-4 w-4 text-primary" />
                  {t('mcp_heading')}
                </p>
                <div className="mt-3">
                  <McpInstall
                    clients={[
                      {
                        id: 'claude',
                        label: 'Claude Code',
                        body: t('mcp_body', { name: tool.name }),
                        commands: mcpCommands,
                      },
                      {
                        id: 'codex',
                        label: 'Codex',
                        body: t('mcp_body_codex', { name: tool.name }),
                        commands: mcpInstallCommands(tool, 'codex'),
                      },
                    ]}
                    labels={{
                      os: { mac: 'macOS', windows: t('mcp_os_windows'), linux: 'Linux' },
                      copy: t('mcp_copy'),
                      copied: t('mcp_copied'),
                    }}
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{t('mcp_note', { name: tool.name })}</p>
              </div>
            )}

            {/* Pro comes with a plan, on the one pricing page for every app. */}
            {tool.pro && (
              <div>
                <Link
                  href={`/${locale}/pricing`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('plans_button')}
                </Link>
                <p className="text-xs text-muted-foreground mt-3 max-w-2xl">{t('plans_note', { name: tool.name })}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* The tool at work, ahead of the overview: what the copy below claims,
          shown in thirty seconds. Muted and looping, so it can play on its own
          without startling anyone. */}
      {tool.video && (
        <section className={`${sectionY} bg-secondary/30 border-t border-border`}>
          <div className={box('max-w-4xl')}>
            <h2 className="text-2xl font-bold mb-5">
              {t(`apps.${appI18nKey[tool.id]}.video_heading`)}
            </h2>
            <div className="space-y-4 mb-8">
              {(t.raw(`apps.${appI18nKey[tool.id]}.video_body`) as string[]).map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <video
              src={tool.video.src}
              poster={tool.video.poster}
              width={tool.video.width}
              height={tool.video.height}
              aria-label={t(`apps.${appI18nKey[tool.id]}.video_label`)}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              className="w-full h-auto rounded-xl border border-border shadow-lg bg-background"
            />
            <p className="text-xs text-muted-foreground mt-3">
              {t(`apps.${appI18nKey[tool.id]}.video_caption`)}
            </p>
          </div>
        </section>
      )}

      <section className={`${sectionY} bg-background${comparison || tool.video ? ' border-t border-border' : ''}`}>
        <div className={box('max-w-4xl')}>
          <h2 className="text-2xl font-bold mb-5">{t('overview_heading')}</h2>
          <div className="space-y-4">
            {overview.map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className={`${sectionY} bg-secondary/30 border-t border-border`}>
        <div className={box('max-w-4xl')}>
          <h2 className="text-2xl font-bold mb-8">{t('features_heading')}</h2>
          <div className={`grid ${twoCols} gap-6`}>
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-background p-5">
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What connecting the tool to an agent costs in the agent's own
          tokens: the question after "what does it do", for anyone paying
          for Claude by usage or watching a context window fill. */}
      {tool.mcpCost && (
        <section className={`${sectionY} bg-background border-t border-border`}>
          <div className={box('max-w-4xl')}>
            <h2 className="text-2xl font-bold mb-5">{t('mcp_cost_heading')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              {t('mcp_cost_intro', { name: tool.name })}
            </p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-left">
                  <tr>
                    <th className="px-4 py-2 font-semibold">{t('mcp_cost_what')}</th>
                    <th className="px-4 py-2 font-semibold text-right whitespace-nowrap">{t('mcp_cost_tokens')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">{t('mcp_cost_instructions')}</td>
                    <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">≈ {tool.mcpCost.instructions.toLocaleString(locale)}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2">{t('mcp_cost_definitions')}</td>
                    <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">≈ {tool.mcpCost.definitions.toLocaleString(locale)}</td>
                  </tr>
                  {tool.mcpCost.calls.map((call) => (
                    <tr key={call.tool} className="border-t border-border">
                      <td className="px-4 py-2">
                        {t('mcp_cost_call')} <code className="text-xs">{call.tool}</code>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums whitespace-nowrap">≈ {call.tokens.toLocaleString(locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3 max-w-3xl">
              {t('mcp_cost_note', { name: tool.name, version: tool.mcpCost.version, date: tool.mcpCost.measured })}
            </p>
          </div>
        </section>
      )}

      <section className={`${sectionY} bg-background border-t border-border`}>
        <div className={`${box('max-w-4xl')} grid ${twoCols} gap-10`}>
          <div>
            <h2 className="text-2xl font-bold mb-5">{t('requirements_heading')}</h2>
            <ul className="space-y-2.5">
              {requirements.map((requirement) => (
                <li key={requirement} className="flex gap-2.5 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-5">{t('tech_heading')}</h2>
            <p className="text-sm font-mono text-muted-foreground">{tool.tech}</p>
          </div>
        </div>
      </section>

      {/* What shipped recently. The dates are the point: a visitor deciding
          whether a tool is maintained looks for them, and so does a crawler
          working out how often this corner of the site changes. */}
      {latest && (
        <section className={`${sectionY} bg-background border-t border-border`}>
          <div className={box('max-w-4xl')}>
            <h2 className="text-2xl font-bold mb-4">{t('releases_heading')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-3xl">
              {t('releases_body', {
                version: latest.version,
                date: formatReleaseDate(latest.date, locale),
                name: tool.name,
              })}
            </p>
            <ul className="space-y-2.5 mb-6">
              {recent.map((release) => (
                <li key={release.version} className="flex flex-wrap items-baseline gap-x-3 text-sm">
                  <Link
                    href={`/${locale}/apps/${slug}/releases#${releaseAnchor(release.version)}`}
                    className="font-mono text-primary hover:underline underline-offset-4"
                  >
                    {release.version}
                  </Link>
                  <time dateTime={release.date} className="text-xs text-muted-foreground">
                    {formatReleaseDate(release.date, locale)}
                  </time>
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/apps/${slug}/releases`}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4"
            >
              {t('releases_link')}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* Licence and source. The licence is not a footnote for these tools —
          "free" is only true for personal and non-profit use, so a visitor
          deciding whether to download at work needs it before the FAQ. */}
      <section className={`${sectionY} bg-background border-t border-border`}>
        <div className={`${box('max-w-4xl')} grid ${twoCols} gap-10`}>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Scale className="w-5 h-5 text-primary" />
              {t('licence_heading')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t(tool.pro ? `apps.${appI18nKey[tool.id]}.pro_licence_body` : 'licence_body')}
            </p>
            {/* Every tool ships under the same noncommercial licence, so its
                text is always one click away. A tool sold as Pro has nothing
                to enquire about: Pro is its commercial licence, bought above. */}
            <div className="flex flex-wrap gap-4">
              <a
                href={LICENCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline underline-offset-4"
              >
                {t('licence_link')}
              </a>
              {!tool.pro && (
                <Link
                  href={`/${locale}/contact?service=licence`}
                  className="text-sm text-primary hover:underline underline-offset-4"
                >
                  {t('licence_cta')}
                </Link>
              )}
            </div>
          </div>
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold mb-4">
              <Github className="w-5 h-5 text-primary" />
              {t('source_heading')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t('source_body')}
            </p>
            <a
              href={tool.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              {t('source_link')}
            </a>
          </div>
        </div>
      </section>

      <section className={`${sectionY} bg-secondary/30 border-t border-border`}>
        <div className={box('max-w-4xl')}>
          <h2 className="text-2xl font-bold mb-8">{t('faq_heading')}</h2>
          <div className="space-y-6">
            {faq.map((entry) => (
              <div key={entry.q}>
                <h3 className="font-semibold mb-1.5">{entry.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{entry.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {article && (
        <section className={`${sectionY} bg-background border-t border-border`}>
          <div className={box('max-w-4xl')}>
            <h2 className="text-2xl font-bold mb-6">{t('article_heading')}</h2>
            <Link
              href={`/${locale}/blog/${article.slug}`}
              className="block rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-lg font-semibold text-primary mb-2">{article.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
            </Link>
          </div>
        </section>
      )}

      {/* Internal links out to the sibling tools: a new page with nothing
          pointing at it and nothing pointing out of it gets crawled slowly. */}
      {related.length > 0 && (
        <section className={`${sectionY} bg-background border-t border-border`}>
          <div className={box('max-w-4xl')}>
            <h2 className="text-2xl font-bold mb-8">{t('related_heading')}</h2>
            <div className={`grid ${inPanel ? 'sm:grid-cols-3' : 'md:grid-cols-3'} gap-4`}>
              {related.map((other) => (
                <RelatedCard key={other.id} locale={locale} tool={other} inPanel={inPanel} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${inPanel ? 'py-12' : 'py-16'} bg-secondary border-t border-border`}>
        <div className={`${box('max-w-3xl')} text-center`}>
          <h2 className="text-2xl font-bold mb-4">{t('cta_heading')}</h2>
          <p className="text-muted-foreground mb-6">{t('cta_body')}</p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            {t('cta_button')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

async function RelatedCard({
  locale,
  tool,
  inPanel,
}: {
  locale: string;
  tool: DesktopToolConfig;
  inPanel: boolean;
}) {
  const tApps = await getTranslations({ locale, namespace: 'apps' });
  const key = appI18nKey[tool.id];

  return (
    <Link
      href={`/${locale}/apps/${tool.id}`}
      // In the panel a sibling opens in the same panel, replacing this one, so
      // closing it returns to the catalogue rather than to the previous tool.
      replace={inPanel}
      scroll={!inPanel}
      className="block rounded-xl border border-border bg-background p-5 hover:border-primary/50 transition-colors"
    >
      <h3 className="font-semibold text-primary mb-1.5">{tool.name}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{tApps(`${key}_tagline`)}</p>
    </Link>
  );
}
