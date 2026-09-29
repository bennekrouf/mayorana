// Where the people who download our builds actually came from.
//
// The nginx log records a Referer for the download request, but by then it is
// always one of our own pages — the log can say "they clicked from /apps", not
// "they arrived from Hacker News three days ago". The site's referrer report
// has the opposite problem: it knows where a *visit* came from, but a visit
// and a download are two different log lines with nothing joining them.
//
// So the source is captured when someone first arrives and carried on the
// download URL itself, where it lands in the same log line as the download and
// downloads-stats.py can count it.
//
// First touch, not last: the question is which channel actually found this
// person. Someone who reads about a tool on a forum, comes back a week later
// through a search for the name, and downloads then was found by the forum —
// scoring that to "google" would credit the channel that merely spelled the
// name back to them. Stored once and never overwritten for that reason.

export interface Attribution {
  /** utm_source, or the referring host, or 'direct'. */
  source: string;
  /** utm_medium, or 'referral' / 'none'. */
  medium: string;
  /** utm_campaign, when the inbound link carried one. */
  campaign?: string;
  /** ISO date of first arrival. Not sent anywhere — kept so a stored value
   *  can be reasoned about if the format ever has to change. */
  at: string;
}

const STORAGE_KEY = 'mayorana.attribution';

/** Hosts that are us. A referral from our own site is not a source. */
const OWN_HOSTS = ['mayorana.ch', 'swissrust.ch', 'api0.ai', 'cvenom.com', 'ribh.io'];

function isOwnHost(host: string): boolean {
  const bare = host.replace(/^www\./, '').toLowerCase();
  return OWN_HOSTS.some((own) => bare === own || bare.endsWith('.' + own));
}

/** Keeps a source label to something that can sit in a URL and be read in a
 *  report: lowercase, no spaces, bounded length. */
function clean(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

export function read(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

/**
 * Work out where this arrival came from and remember it, unless something is
 * already remembered. Safe to call on every page: after the first visit it
 * reads one key and returns.
 *
 * An explicit utm_source always wins — that is a link we built and tagged.
 * Failing that a referring host is the source; failing that the person typed
 * the address or came from somewhere that sends no referrer, which is 'direct'.
 */
export function capture(): Attribution | null {
  if (typeof window === 'undefined') return null;

  const existing = read();
  const params = new URLSearchParams(window.location.search);
  const tagged = params.get('utm_source');

  // A tagged link re-attributes even a known visitor: we paid for or placed
  // that link deliberately, and it is better evidence than a months-old
  // referrer. Untagged arrivals never overwrite.
  if (existing && !tagged) return existing;

  let source: string;
  let medium: string;

  if (tagged) {
    source = clean(tagged) || 'unknown';
    medium = clean(params.get('utm_medium') ?? '') || 'unknown';
  } else {
    let host = '';
    try {
      host = document.referrer ? new URL(document.referrer).hostname : '';
    } catch { /* a malformed referrer is no referrer */ }
    if (host && !isOwnHost(host)) {
      source = clean(host.replace(/^www\./, '')) || 'unknown';
      medium = 'referral';
    } else {
      // An own-host referrer means an internal click, which for a visitor we
      // have never seen means their first page was not this one — treat it
      // as direct rather than inventing a source.
      source = 'direct';
      medium = 'none';
    }
  }

  const campaign = clean(params.get('utm_campaign') ?? '');
  const attribution: Attribution = {
    source,
    medium,
    ...(campaign ? { campaign } : {}),
    at: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch { /* private mode: this visit goes uncounted, which is not worth failing over */ }
  return attribution;
}

/**
 * Add the remembered source to a build URL, so the download's own log line
 * carries it. Idempotent — stamping an already-stamped URL rewrites the same
 * values rather than appending a second copy.
 */
export function withAttribution(href: string): string {
  const attribution = read() ?? capture();
  if (!attribution) return href;
  try {
    const url = new URL(href, window.location.origin);
    url.searchParams.set('utm_source', attribution.source);
    url.searchParams.set('utm_medium', attribution.medium);
    if (attribution.campaign) url.searchParams.set('utm_campaign', attribution.campaign);
    return url.toString();
  } catch {
    return href;
  }
}
