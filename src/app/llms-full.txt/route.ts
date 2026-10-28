// /llms-full.txt, where agents look for it: the English index, which links the
// French one (/fr/llms-full.txt). See src/lib/markdown-export.ts.

import { llmsFullTxt, textResponse } from '@/lib/markdown-export';

export const dynamic = 'force-static';

export async function GET() {
  return textResponse(await llmsFullTxt('en'));
}
