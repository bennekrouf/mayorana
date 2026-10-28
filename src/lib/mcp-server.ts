// Mayorana's public MCP server: the site, readable by AI agents as tools.
//
//   claude mcp add --transport http mayorana https://mayorana.ch/mcp
//
// Read-only and stateless: every tool answers from the same data as the pages
// (the search index, the markdown twins, the release feeds, the plans), and
// no session is kept between requests. It speaks the Streamable HTTP transport
// with plain JSON responses — no server-sent events, since nothing here is
// long-running — and handles one JSON-RPC message per POST.
//
// Hand-written rather than built on @modelcontextprotocol/sdk: the surface is
// initialize, ping, tools/list and tools/call, and the SDK's server transport
// expects a Node request/response pair a route handler does not have.

import { getTranslations } from 'next-intl/server';
import { getTrack, getTracks } from './blog';
import { appMarkdown, postMarkdown } from './markdown-export';
import { fetchPlans, formatPlanPrice } from './plans';
import { getReleaseFeed } from './releases';
import { search } from './search-client';
import { buildSearchIndex, type SearchIndex } from './search-index';
import { SITE_URL } from './seo';
import { appI18nKey, desktopToolsConfig, getToolBySlug } from '@/data/tools';

export const SERVER_INFO = { name: 'mayorana', title: 'Mayorana', version: '1.0.0' };
const PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const LATEST_PROTOCOL = PROTOCOL_VERSIONS[0];

const INSTRUCTIONS =
  'Mayorana is a Swiss company: api0, a Rust MCP gateway, and native desktop apps (GitAgent, ShipScreen, ' +
  'JobScout, the Azure Integration Suite and more), plus a blog on Rust, LLMs and Azure integration. Use ' +
  '`search` first to find a page, then `get_app` or `get_post` for its full text. Every answer links to the ' +
  'page on mayorana.ch; cite it. Content exists in English (en) and French (fr).';

type Json = Record<string, unknown>;
type Locale = 'en' | 'fr';

const localeProp = {
  type: 'string',
  enum: ['en', 'fr'],
  default: 'en',
  description: 'Language of the content: en or fr.',
};

const TOOLS = [
  {
    name: 'search',
    title: 'Search mayorana.ch',
    description: 'Search the apps, blog articles, learning paths and pages of mayorana.ch. Returns titles, URLs and one-line summaries, best match first.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Words to look for, e.g. "borrow checker" or "correlation id".' },
        locale: localeProp,
        limit: { type: 'integer', minimum: 1, maximum: 25, default: 10 },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_apps',
    title: 'List the apps',
    description: 'Every Mayorana desktop app: id, name, what it does, platforms, latest version and page URL.',
    inputSchema: { type: 'object', properties: { locale: localeProp } },
  },
  {
    name: 'get_app',
    title: 'Read an app page',
    description: 'The full page for one app, as markdown: overview, features, requirements, downloads, one-line install, MCP setup, FAQ.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'App id from list_apps, e.g. "gitagent".' }, locale: localeProp },
      required: ['id'],
    },
  },
  {
    name: 'get_release_notes',
    title: 'Read release notes',
    description: "An app's recent releases: version, date and what changed, newest first.",
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'App id from list_apps.' },
        limit: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_post',
    title: 'Read a blog article',
    description: 'One blog article as markdown, with its title, date, tags and URL. Get the slug from search.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'The article slug, the last part of its URL.' }, locale: localeProp },
      required: ['slug'],
    },
  },
  {
    name: 'get_learning_path',
    title: 'Read a learning path',
    description: 'Without a track: the learning paths (ordered reading lists through the blog). With one: its articles in reading order.',
    inputSchema: {
      type: 'object',
      properties: { track: { type: 'string', description: 'Track id, e.g. "rust" or "llm". Omit to list them.' }, locale: localeProp },
    },
  },
  {
    name: 'get_pricing',
    title: 'Plans and prices',
    description: 'The plans on sale: price per month, monthly AI credits, and which apps each unlocks.',
    inputSchema: { type: 'object', properties: { locale: localeProp } },
  },
].map((tool) => ({ ...tool, annotations: { readOnlyHint: true, openWorldHint: false } }));

// ── Tool implementations ─────────────────────────────────────────────────────

const indexes = new Map<Locale, Promise<SearchIndex>>();
function indexFor(locale: Locale) {
  if (!indexes.has(locale)) indexes.set(locale, buildSearchIndex(locale));
  return indexes.get(locale)!;
}

function localeOf(args: Json): Locale {
  return args.locale === 'fr' ? 'fr' : 'en';
}

function intArg(value: unknown, fallback: number, max: number) {
  const n = typeof value === 'number' ? Math.floor(value) : fallback;
  return Math.max(1, Math.min(max, n));
}

export class ToolError extends Error {}

/** One tool's answer as text; also what Ask Mayorana (src/lib/ask.ts) reads the plans and apps from. */
export async function callTool(name: string, args: Json): Promise<string> {
  const locale = localeOf(args);
  switch (name) {
    case 'search': {
      const query = String(args.query ?? '').trim();
      if (!query) throw new ToolError('query is required.');
      const hits = search(await indexFor(locale), query, intArg(args.limit, 10, 25));
      if (hits.length === 0) return `Nothing on mayorana.ch matches "${query}".`;
      return hits
        .map((hit) => `- [${hit.type}] ${hit.title}\n  ${SITE_URL}${hit.url}\n  ${hit.text}`)
        .join('\n');
    }

    case 'list_apps': {
      const tApps = await getTranslations({ locale, namespace: 'apps' });
      const lines = await Promise.all(
        desktopToolsConfig.map(async (tool) => {
          const latest = (await getReleaseFeed(tool.id))?.releases[0];
          return [
            `- ${tool.name} (id: ${tool.id}): ${tApps(`${appI18nKey[tool.id]}_tagline`)}`,
            `  Platforms: ${tool.downloads.map((d) => d.label).join(', ')}`,
            ...(latest ? [`  Latest: ${latest.version} (${latest.date})`] : []),
            `  ${SITE_URL}/${locale}/apps/${tool.id}`,
          ].join('\n');
        }),
      );
      return lines.join('\n');
    }

    case 'get_app': {
      const md = await appMarkdown(locale, String(args.id ?? ''));
      if (!md) throw new ToolError(`No app "${args.id}". Call list_apps for the ids.`);
      return md;
    }

    case 'get_release_notes': {
      const tool = getToolBySlug(String(args.id ?? ''));
      if (!tool) throw new ToolError(`No app "${args.id}". Call list_apps for the ids.`);
      const feed = await getReleaseFeed(tool.id);
      if (!feed) return `${tool.name} does not publish release notes.`;
      return feed.releases
        .slice(0, intArg(args.limit, 5, 20))
        .map((release) =>
          [
            `## ${tool.name} ${release.version} (${release.date})`,
            ...release.sections.flatMap((section) => [
              ...(section.heading ? [`### ${section.heading}`] : []),
              ...section.items.map((item) => `- ${item}`),
            ]),
          ].join('\n'),
        )
        .join('\n\n') + `\n\nAll releases: ${SITE_URL}/en/apps/${tool.id}/releases`;
    }

    case 'get_post': {
      const md = postMarkdown(locale, String(args.slug ?? ''));
      if (!md) throw new ToolError(`No ${locale} article with slug "${args.slug}". Use search to find it.`);
      return md;
    }

    case 'get_learning_path': {
      const tLearn = await getTranslations({ locale, namespace: 'learn' });
      if (!args.track) {
        return getTracks(locale)
          .map((track) => `- ${tLearn(`tracks.${track.id}.title`)} (track: ${track.id}, ${track.total} articles): ${tLearn(`tracks.${track.id}.intro`)}\n  ${SITE_URL}/${locale}/learn/${track.id}`)
          .join('\n');
      }
      const track = getTrack(String(args.track), locale);
      if (!track) throw new ToolError(`No learning path "${args.track}". Call get_learning_path without a track for the list.`);
      return [
        `# ${tLearn(`tracks.${track.id}.title`)}`,
        tLearn(`tracks.${track.id}.intro`),
        ...track.sections.flatMap((section) => [
          `\n## ${tLearn(`sections.${section.id}`)}`,
          ...section.posts.map((post) => `${post.step}. ${post.title} (${post.readingTime}): ${SITE_URL}/${locale}/blog/${post.slug}`),
        ]),
      ].join('\n');
    }

    case 'get_pricing': {
      const { plans } = await fetchPlans({ next: { revalidate: 3600 } });
      const names = new Map(desktopToolsConfig.map((tool) => [tool.pro?.product ?? tool.id, tool.name]));
      return (
        plans
          .map((plan) => {
            const apps = plan.products.includes('*') ? 'every app' : plan.products.map((p) => names.get(p) ?? p).join(', ');
            return `- ${plan.name}: ${formatPlanPrice(plan, locale)} a month, ${plan.monthly_credits} AI credits a month, unlocks ${apps}. ${plan.description}`;
          })
          .join('\n') +
        `\n\nThe apps are free for personal, educational and non-profit use; commercial use needs a plan. ${SITE_URL}/${locale}/pricing`
      );
    }

    default:
      throw new ToolError(`Unknown tool "${name}".`);
  }
}

// ── JSON-RPC ─────────────────────────────────────────────────────────────────

const rpcError = (id: unknown, code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
const rpcResult = (id: unknown, result: unknown) => ({ jsonrpc: '2.0', id, result });

/** The response to one JSON-RPC message, or null for a notification. */
export async function handleMessage(message: unknown): Promise<Json | null> {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return rpcError(null, -32600, 'Expected one JSON-RPC request object.');
  }
  const { id, method, params } = message as { id?: unknown; method?: unknown; params?: Json };
  if (typeof method !== 'string') return rpcError(id, -32600, 'Missing method.');
  // Notifications (no id) get no response: notifications/initialized and friends.
  if (id === undefined) return null;

  switch (method) {
    case 'initialize': {
      const requested = String(params?.protocolVersion ?? '');
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : LATEST_PROTOCOL,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, { tools: TOOLS });
    case 'tools/call': {
      const name = String(params?.name ?? '');
      const args = (params?.arguments ?? {}) as Json;
      if (!TOOLS.some((tool) => tool.name === name)) return rpcError(id, -32602, `Unknown tool "${name}".`);
      try {
        return rpcResult(id, { content: [{ type: 'text', text: await callTool(name, args) }] });
      } catch (error) {
        // A tool's own failure is a result the model can read and recover
        // from, not a protocol error.
        const text = error instanceof ToolError ? error.message : 'The tool failed; try again shortly.';
        if (!(error instanceof ToolError)) console.error(`MCP tool ${name} failed:`, error);
        return rpcResult(id, { content: [{ type: 'text', text }], isError: true });
      }
    }
    default:
      return rpcError(id, -32601, `Method "${method}" is not supported.`);
  }
}
