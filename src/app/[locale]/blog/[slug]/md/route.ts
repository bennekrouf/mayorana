// /<locale>/blog/<slug>.md — the post as plain markdown (see
// src/lib/markdown-export.ts). The middleware rewrites the .md URL here.

import { getAllPosts } from '@/lib/blog';
import { markdownResponse, postMarkdown } from '@/lib/markdown-export';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return ['en', 'fr'].flatMap((locale) => getAllPosts(locale).map((post) => ({ locale, slug: post.slug })));
}

export async function GET(_: Request, { params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const body = postMarkdown(locale, slug);
  if (!body) return new Response('Not found', { status: 404 });
  return markdownResponse(body, `${SITE_URL}/${locale}/blog/${slug}`);
}
