// POST /api/ask { question, locale } → { html, sources } — see src/lib/ask.ts.
// Errors answer { error: <code> } with the code the palette words for the
// reader: disabled, empty, limit_ip, limit_day, exhausted, failed.

import { ask, AskError } from '@/lib/ask';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let question = '';
  let locale = 'en';
  try {
    const body = await request.json();
    question = String(body?.question ?? '');
    locale = body?.locale === 'fr' ? 'fr' : 'en';
  } catch {
    return Response.json({ error: 'empty' }, { status: 400 });
  }

  const ip =
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';

  try {
    return Response.json(await ask(question, locale, ip));
  } catch (error) {
    if (error instanceof AskError) return Response.json({ error: error.code }, { status: error.status });
    console.error('Ask failed:', error);
    return Response.json({ error: 'failed' }, { status: 500 });
  }
}
