// File: src/app/api/stats/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';

// Written nightly by scripts/downloads-stats.py, which folds each day's nginx
// log into a cumulative file before logrotate discards it.
const STATS_PATH = process.env.DOWNLOAD_STATS_PATH || '/var/lib/mayorana/stats.json';

// Public on purpose: these are aggregate download counts for our own products,
// with no personal data in them — the file holds per-day totals by app and
// platform, never addresses or user agents. Unlisted from search via robots.txt
// and the noindex header below, and rate limited in middleware.
export async function GET() {
  try {
    const raw = await fs.promises.readFile(STATS_PATH, 'utf8');
    return NextResponse.json(JSON.parse(raw), {
      headers: {
        // Regenerated once a day; a stale page is more confusing than a
        // re-read that costs nothing.
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') {
      // Distinguished from a real failure so the page can say "not set up
      // yet" rather than "something broke".
      return NextResponse.json(
        {
          error: 'not_collected_yet',
          message: `No stats at ${STATS_PATH}. Run scripts/install-downloads-stats.sh on the server.`,
        },
        { status: 404 },
      );
    }
    console.error('Failed to read download stats:', error);
    return NextResponse.json({ error: 'Failed to read download stats' }, { status: 500 });
  }
}
