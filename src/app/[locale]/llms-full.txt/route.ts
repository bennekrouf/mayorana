// /<locale>/llms-full.txt — see src/lib/markdown-export.ts.

import { llmsFullTxt, textResponse } from '@/lib/markdown-export';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function GET(_: Request, { params }: { params: Promise<{ locale: string }> }) {
  return textResponse(await llmsFullTxt((await params).locale));
}
