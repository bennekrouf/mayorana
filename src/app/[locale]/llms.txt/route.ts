// /<locale>/llms.txt — see src/lib/markdown-export.ts.

import { llmsTxt, textResponse } from '@/lib/markdown-export';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function GET(_: Request, { params }: { params: Promise<{ locale: string }> }) {
  return textResponse(await llmsTxt((await params).locale));
}
