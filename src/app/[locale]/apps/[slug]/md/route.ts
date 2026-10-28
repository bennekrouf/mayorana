// /<locale>/apps/<id>.md — the app's page as plain markdown (see
// src/lib/markdown-export.ts). The middleware rewrites the .md URL here.

import { toolSlugs } from '@/data/tools';
import { appMarkdown, markdownResponse } from '@/lib/markdown-export';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return ['en', 'fr'].flatMap((locale) => toolSlugs.map((slug) => ({ locale, slug })));
}

export async function GET(_: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const body = await appMarkdown(locale, slug);
  if (!body) return new Response('Not found', { status: 404 });
  return markdownResponse(body, `${SITE_URL}/${locale}/apps/${slug}`);
}
