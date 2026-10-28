// /llms.txt, where agents look for it: the English index, which links the
// French one (/fr/llms.txt). See src/lib/markdown-export.ts.

import { llmsTxt, textResponse } from '@/lib/markdown-export';

export const dynamic = 'force-static';

export async function GET() {
  return textResponse(await llmsTxt('en'));
}
