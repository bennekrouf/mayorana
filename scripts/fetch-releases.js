// Release-note snapshots.
// File: scripts/fetch-releases.js
//
// Each app publishes a releases.json beside its builds on mayorana.ch, generated
// from its own CHANGELOG.md by its release CI. This pulls a copy into the repo
// so a build has the notes without the network, and so generate-sitemap.js can
// date /apps/<tool>/releases from the day that tool last shipped rather than
// from the day the site was deployed — <lastmod> is the freshness signal on
// these pages, and a build date makes every one of them look equally stale.
//
// The page itself re-reads the live feed at runtime (see src/lib/releases.ts),
// so a release that lands between two site deploys still appears. This snapshot
// is the floor, not the ceiling.
//
// A failed fetch keeps the file already in the repo: an app whose download host
// is briefly unreachable must not silently lose its release history from the
// site. Set SKIP_RELEASE_FETCH=1 to build entirely from what is committed.

const fs = require('fs');
const path = require('path');

const DOWNLOADS = 'https://mayorana.ch/downloads';
const OUT_DIR = path.join(process.cwd(), 'src/data/releases');
const TIMEOUT_MS = 8000;

// Only the tools that already have a snapshot are fetched: the snapshot file is
// what declares "this tool publishes release notes", and it is also what
// src/lib/releases.ts imports to build the route list. Adding a tool to the
// system means committing its first snapshot once.
function snapshotIds() {
  if (!fs.existsSync(OUT_DIR)) return [];
  return fs
    .readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
}

// Enough of a shape check that a 200 from an error page, or a feed truncated to
// nothing, cannot overwrite real history.
function isUsable(feed, existing) {
  if (!feed || !Array.isArray(feed.releases) || feed.releases.length === 0) return false;
  if (!feed.releases.every((r) => r.version && r.date && Array.isArray(r.sections))) return false;
  if (existing && Array.isArray(existing.releases) && feed.releases.length < existing.releases.length) {
    return false;
  }
  return true;
}

function readExisting(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

async function fetchFeed(id) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${DOWNLOADS}/${id}/latest/releases.json`, {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const ids = snapshotIds();
  if (ids.length === 0) {
    console.log('📦 No release snapshots to refresh');
    return;
  }

  if (process.env.SKIP_RELEASE_FETCH) {
    console.log(`📦 SKIP_RELEASE_FETCH set — using the committed snapshots (${ids.join(', ')})`);
    return;
  }

  for (const id of ids) {
    const file = path.join(OUT_DIR, `${id}.json`);
    const existing = readExisting(file);
    try {
      const feed = await fetchFeed(id);
      if (!isUsable(feed, existing)) {
        console.warn(`⚠️  ${id}: live feed rejected (empty, malformed or shorter than the snapshot)`);
        continue;
      }
      fs.writeFileSync(file, `${JSON.stringify(feed, null, 2)}\n`);
      console.log(`✅ ${id}: ${feed.releases.length} releases, newest ${feed.releases[0].version}`);
    } catch (error) {
      const kept = existing ? `${existing.releases?.length ?? 0} releases` : 'nothing';
      console.warn(`⚠️  ${id}: ${error.message} — keeping the committed snapshot (${kept})`);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    // Never fail the build over release notes: the snapshots in the repo are
    // already a complete, valid answer.
    console.warn('⚠️  Release snapshot refresh failed:', error.message);
  });
}

module.exports = { main };
