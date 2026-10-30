// Whether someone wants product emails: tips for the apps in their plan,
// credit reminders and the monthly digest. Account emails (licence, receipts,
// payment problems, a plan ending) are part of the service and go to every
// subscriber whatever this says.
//
// The choice is kept by api0, in the same record the unsubscribe link in every
// email writes to, so the site and the emails never disagree
// (store-api0/src/email/unsubscribe.rs has the rule):
//
//   opt_in: true    they get them
//   opt_in: false   never, whatever their plan
//   opt_in: null    not chosen yet: only while they have a plan they bought
//
//   GET /api/user/email-consent   → { opt_in, receives }
//   PUT /api/user/email-consent   { opt_in, source, locale }

import { gatewayFetch } from './gateway';

/** The page the choice was made on. */
export type EmailConsentSource = 'pricing' | 'founding';

export interface EmailConsent {
  /** Their own choice, or null if they never made one. */
  opt_in: boolean | null;
  /** Whether they get product emails now, by the rule above. */
  receives: boolean;
}

export async function getEmailConsent(): Promise<EmailConsent> {
  const body = await gatewayFetch<Partial<EmailConsent>>('/api/user/email-consent');
  return {
    opt_in: typeof body.opt_in === 'boolean' ? body.opt_in : null,
    receives: body.receives === true,
  };
}

/** `locale` is the site's language: the language the emails are written in. */
export async function setEmailConsent(
  optIn: boolean,
  source: EmailConsentSource,
  locale: string,
): Promise<EmailConsent> {
  await gatewayFetch('/api/user/email-consent', {
    method: 'PUT',
    body: JSON.stringify({ opt_in: optIn, source, locale }),
  });
  return { opt_in: optIn, receives: optIn };
}
