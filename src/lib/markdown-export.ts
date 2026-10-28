// Plain-markdown versions of the site, for AI agents and answer engines.
//
// Every blog post and app page has a twin at the same URL plus `.md`
// (/en/blog/<slug>.md, /en/apps/<id>.md; the middleware rewrites those to the
// `md` route handlers next to each page), and /llms.txt indexes them the way
// llmstxt.org describes. An agent reading the HTML gets the navbar, the
// footer and a megabyte of React payload around the article; these give it
// the article.
//
// Everything here runs at build time: the routes are force-static, so the
// files are written once per deploy like the pages themselves.

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getTranslations } from 'next-intl/server';
import { getAllPosts, getPostBySlug, type BlogPost } from './blog';
import { SITE_URL } from './seo';
import {
  hasPowershellInstall,
  hasShellInstall,
  powershellInstallCommand,
  shellInstallCommand,
} from './install-scripts';
import { loadToolDetail } from '@/components/apps/ToolDetailContent';
import { appI18nKey, desktopToolsConfig, LICENCE_URL, mcpInstallCommands, type OS } from '@/data/tools';

const OS_LABEL: Record<OS, string> = { mac: 'macOS', windows: 'Windows', linux: 'Linux' };

// The learning path's tracks, in the order llms.txt lists them.
const TRACKS: { id: string; en: string; fr: string }[] = [
  { id: 'rust', en: 'Rust, from first principles', fr: 'Rust, depuis les bases' },
  { id: 'llm', en: 'LLMs from scratch', fr: 'Les LLM depuis zéro' },
  { id: 'azure', en: 'Azure integration', fr: 'Intégration Azure' },
  { id: 'git', en: 'Git tooling', fr: 'Outils git' },
];

export const postMarkdownUrl = (locale: string, slug: string) => `${SITE_URL}/${locale}/blog/${slug}.md`;
export const appMarkdownUrl = (locale: string, id: string) => `${SITE_URL}/${locale}/apps/${id}.md`;

/** Response for a markdown twin: canonical points at the HTML page, so the
 *  two never compete in search. */
export function markdownResponse(body: string, canonical?: string) {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      ...(canonical ? { Link: `<${canonical}>; rel="canonical"` } : {}),
    },
  });
}

export function textResponse(body: string) {
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

// Root-relative links and images resolve against the HTML page in a browser,
// but against nothing once the markdown is pasted into a model's context.
function absolutize(markdown: string) {
  return markdown.replace(/\]\(\//g, `](${SITE_URL}/`);
}

// The posts' markdown sources by locale and slug. The slug rule is the one
// scripts/generate-blog-data.js applies; a post without an explicit slug falls
// back to the generated JSON, which never carries the source.
let sources: Map<string, string> | null = null;
function sourceFor(locale: string, slug: string): string | null {
  if (!sources) {
    sources = new Map();
    for (const loc of ['en', 'fr']) {
      const dir = path.join(process.cwd(), 'content', loc, 'blog');
      if (!fs.existsSync(dir)) continue;
      for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
        const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
        if (data.slug) sources.set(`${loc}/${data.slug}`, content.trim());
      }
    }
  }
  return sources.get(`${locale}/${slug}`) ?? null;
}

function frontMatter(fields: Record<string, string | string[] | undefined>) {
  const lines = Object.entries(fields).flatMap(([key, value]) => {
    if (value === undefined || (Array.isArray(value) && value.length === 0)) return [];
    if (Array.isArray(value)) return [`${key}:`, ...value.map((v) => `  - ${JSON.stringify(v)}`)];
    return [`${key}: ${JSON.stringify(value)}`];
  });
  return `---\n${lines.join('\n')}\n---\n\n`;
}

export function postMarkdown(locale: string, slug: string): string | null {
  const post = getPostBySlug(slug, locale);
  if (!post) return null;
  // The source starts with the title as an H1; a post without one gets it here.
  const source = sourceFor(locale, slug);
  const body = source
    ? (/^#\s/m.test(source.split('\n')[0]) ? source : `# ${post.title}\n\n${source}`)
    : null;
  if (!body) return null;
  return (
    frontMatter({
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      language: locale,
      date: post.date.slice(0, 10),
      author: post.author,
      tags: post.tags,
      ...(post.counterpart
        ? { [`${post.counterpart.locale}_version`]: postMarkdownUrl(post.counterpart.locale, post.counterpart.slug) }
        : {}),
    }) + absolutize(body) + '\n'
  );
}

export async function appMarkdown(locale: string, id: string): Promise<string | null> {
  const detail = await loadToolDetail(locale, id);
  if (!detail) return null;
  const { tool, content, article, latest } = detail;
  const { t } = content;
  const pageUrl = `${SITE_URL}/${locale}/apps/${id}`;

  const out: string[] = [
    frontMatter({
      title: content.seoTitle,
      description: content.seoDescription,
      url: pageUrl,
      language: locale,
      ...(latest ? { version: latest.version, released: latest.date } : {}),
    }).trimEnd() + '\n',
    `# ${tool.name}: ${content.tagline}`,
    '',
    `> ${content.seoDescription}`,
    '',
    `- Platforms: ${tool.downloads.map((d) => d.label).join(', ')}`,
    `- Built with: ${tool.tech}`,
    ...(latest ? [`- Latest version: ${latest.version} (${latest.date}), release notes: ${pageUrl}/releases`] : []),
    `- Source: ${tool.source}`,
    `- Licence: PolyForm Noncommercial 1.0.0 (${LICENCE_URL}); commercial use needs a plan: ${SITE_URL}/${locale}/pricing`,
    '',
    `## ${t('overview_heading')}`,
    '',
    ...content.overview.flatMap((p) => [p, '']),
    `## ${t('features_heading')}`,
    '',
    ...content.features.flatMap((f) => [`### ${f.title}`, '', f.body, '']),
    `## ${t('requirements_heading')}`,
    '',
    ...content.requirements.map((r) => `- ${r}`),
    '',
    `## ${t('download_heading')}`,
    '',
    ...tool.downloads.map((d) => `- [${d.label}](${d.href})`),
    '',
  ];

  if (hasShellInstall(tool) || hasPowershellInstall(tool)) {
    out.push(`### ${t('install_heading')}`, '');
    if (hasShellInstall(tool)) {
      const mac = tool.downloads.some((d) => d.os === 'mac');
      const linux = tool.downloads.some((d) => d.os === 'linux');
      const label = t(mac && linux ? 'install_unix' : mac ? 'install_mac' : 'install_linux');
      out.push(`${label}:`, '', '```sh', shellInstallCommand(tool.id), '```', '');
    }
    if (hasPowershellInstall(tool)) {
      out.push(`${t('install_windows')}:`, '', '```powershell', powershellInstallCommand(tool.id), '```', '');
    }
  }

  if (tool.mcp) {
    out.push(`## ${t('mcp_heading')}`, '');
    for (const client of ['claude', 'codex'] as const) {
      out.push(client === 'claude' ? 'Claude Code:' : 'Codex:', '');
      for (const { os, command } of mcpInstallCommands(tool, client)) {
        out.push(`${OS_LABEL[os]}:`, '', '```', command, '```', '');
      }
    }
  }

  out.push(`## ${t('faq_heading')}`, '', ...content.faq.flatMap((e) => [`### ${e.q}`, '', e.a, '']));

  if (article) {
    out.push(`## ${t('article_heading')}`, '', `- [${article.title}](${postMarkdownUrl(locale, article.slug)})`, '');
  }
  return out.join('\n');
}

function postLine(locale: string, post: BlogPost) {
  return `- [${post.title}](${postMarkdownUrl(locale, post.slug)}): ${post.excerpt.replace(/\s+/g, ' ').trim()}`;
}

/** The llms.txt index for one locale: apps, pricing, then the blog by track. */
export async function llmsTxt(locale: string): Promise<string> {
  const fr = locale === 'fr';
  const tMeta = await getTranslations({ locale, namespace: 'metadata' });
  const tApps = await getTranslations({ locale, namespace: 'apps' });
  const posts = getAllPosts(locale);

  const out: string[] = [
    '# Mayorana',
    '',
    `> ${tMeta('site_description')}`,
    '',
    fr
      ? "Chaque page listée ici existe aussi en HTML, à la même adresse sans « .md ». Les applications sont source-available (PolyForm Noncommercial 1.0.0) : gratuites pour un usage personnel, éducatif ou non lucratif ; l'usage commercial passe par un abonnement."
      : 'Every page listed here also exists as HTML at the same URL without ".md". The apps are source-available (PolyForm Noncommercial 1.0.0): free for personal, educational and non-profit use; commercial use needs a plan.',
    '',
    fr ? '## Serveur MCP' : '## MCP server',
    '',
    fr
      ? `- ${SITE_URL}/mcp : serveur MCP public en lecture seule (Streamable HTTP) avec les outils search, list_apps, get_app, get_release_notes, get_post, get_learning_path et get_pricing. Claude Code : \`claude mcp add --transport http mayorana ${SITE_URL}/mcp\``
      : `- ${SITE_URL}/mcp: a public, read-only MCP server (Streamable HTTP) with the tools search, list_apps, get_app, get_release_notes, get_post, get_learning_path and get_pricing. Claude Code: \`claude mcp add --transport http mayorana ${SITE_URL}/mcp\``,
    '',
    fr ? '## Applications' : '## Apps',
    '',
    ...desktopToolsConfig.map(
      (tool) => `- [${tool.name}](${appMarkdownUrl(locale, tool.id)}): ${tApps(`${appI18nKey[tool.id]}_tagline`)}`,
    ),
    '',
    fr ? '## Offres' : '## Plans',
    '',
    fr
      ? `- [Tarifs](${SITE_URL}/fr/pricing) : un abonnement débloque les applications qu'il liste et recharge chaque mois des crédits IA.`
      : `- [Pricing](${SITE_URL}/en/pricing): a plan unlocks the apps it lists and refills a monthly allowance of AI credits.`,
    fr
      ? `- [api0](https://api0.ai) : la passerelle MCP en Rust qui met vos logiciels existants dans Teams, WhatsApp, Telegram et Claude.`
      : `- [api0](https://api0.ai): the Rust MCP gateway that puts your existing software into Teams, WhatsApp, Telegram and Claude.`,
    '',
  ];

  for (const track of TRACKS) {
    const inTrack = posts
      .filter((p) => p.track === track.id)
      .sort((a, b) => (a.pathRank ?? 0) - (b.pathRank ?? 0));
    if (inTrack.length === 0) continue;
    out.push(`## Blog: ${fr ? track.fr : track.en}`, '', ...inTrack.map((p) => postLine(locale, p)), '');
  }

  const untracked = posts.filter((p) => !p.track || !TRACKS.some((t) => t.id === p.track));
  if (untracked.length > 0) {
    out.push('## Optional', '', ...untracked.map((p) => postLine(locale, p)), '');
  }

  const other = fr ? 'en' : 'fr';
  out.push(
    '## Other languages',
    '',
    `- [${other === 'fr' ? 'Français' : 'English'}](${SITE_URL}/${other}/llms.txt)`,
    '',
  );
  return out.join('\n');
}

/** Every app page and post in one file, for agents that want the whole site. */
export async function llmsFullTxt(locale: string): Promise<string> {
  const parts = [await llmsTxt(locale)];
  for (const tool of desktopToolsConfig) {
    const md = await appMarkdown(locale, tool.id);
    if (md) parts.push(md);
  }
  for (const post of getAllPosts(locale)) {
    const md = postMarkdown(locale, post.slug);
    if (md) parts.push(md);
  }
  return parts.join('\n\n');
}
