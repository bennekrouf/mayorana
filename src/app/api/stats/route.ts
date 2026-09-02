// File: src/app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';

// Written nightly by scripts/downloads-stats.py, which folds each day's nginx
// log into a cumulative file before logrotate discards it. Deliberately
// outside the public download root, so serving it is this route's decision
// rather than nginx's.
const STATS_PATH = process.env.DOWNLOAD_STATS_PATH || '/var/lib/mayorana/stats.json';

// Same key and comparison as the admin routes. This lives under /stats rather
// than /admin because nginx returns 403 for /admin and /api/admin at the
// edge — but "unlisted" is not access control, so the key still applies.
function isAuthorized(request: NextRequest): boolean {
  const secretKey = process.env.ADMIN_SECRET_KEY;

  if (!secretKey || secretKey.length < 16) {
    console.error('ADMIN_SECRET_KEY is not set or too short (min 16 chars). Stats access disabled.');
    return false;
  }

  const provided = request.headers.get('authorization')?.replace('Bearer ', '') || '';

  if (provided.length !== secretKey.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < secretKey.length; i++) {
    result |= provided.charCodeAt(i) ^ secretKey.charCodeAt(i);
  }

  return result === 0;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const raw = await fs.promises.readFile(STATS_PATH, 'utf8');
    return NextResponse.json(JSON.parse(raw), {
      headers: {
        // Regenerated once a day; a stale dashboard is more confusing than a
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
