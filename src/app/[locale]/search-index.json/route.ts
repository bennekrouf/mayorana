// /<locale>/search-index.json — see src/lib/search-index.ts.

import { buildSearchIndex } from '@/lib/search-index';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function GET(_: Request, { params }: { params: Promise<{ locale: string }> }) {
  return Response.json(await buildSearchIndex((await params).locale));
}
