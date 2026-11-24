// Tells the gateway that someone signed in here, and where they first came
// from (src/lib/attribution.ts): PUT /api/user/signup-source. The gateway
// keeps, per email, every site and app the person signs in on, and for a
// newcomer the channel that brought them, which the platform's admin list
// shows. Once per browser session per account; a failed report is tried
// again on the next page.

import { capture, read, type Attribution } from './attribution';
import { gatewayFetch } from './gateway';

const REPORTED_KEY = 'mayorana.signInReported';
/** This site, as the gateway's list of sign-ins names it. */
const VIA = 'mayorana.ch';

/** The attribution in the fields the gateway keeps. */
function asSource(a: Attribution | null): Record<string, string> {
  if (!a || a.source === 'direct') return {};
  if (a.medium === 'referral') return { referrer: `https://${a.source}` };
  return {
    utm_source: a.source,
    utm_medium: a.medium,
    ...(a.campaign ? { utm_campaign: a.campaign } : {}),
  };
}

export function reportSignIn(uid: string) {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(REPORTED_KEY) === uid) return;
  } catch { /* private mode: report on every page, the gateway only moves a timestamp */ }
  gatewayFetch('/api/user/signup-source', {
    method: 'PUT',
    body: JSON.stringify({ via: VIA, source: asSource(read() ?? capture()) }),
  })
    .then(() => {
      try { sessionStorage.setItem(REPORTED_KEY, uid); } catch { /* ignore */ }
    })
    .catch(() => { /* tried again on the next page */ });
}
