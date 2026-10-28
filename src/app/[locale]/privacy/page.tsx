// File: src/app/[locale]/privacy/page.tsx
// A server component: the text is static, so no JS is sent for it.

import PrivacyEn from './PrivacyEn';
import PrivacyFr from './PrivacyFr';

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPolicyPage({ params }: Props) {
  const { locale } = await params;
  return locale === 'fr' ? <PrivacyFr /> : <PrivacyEn />;
}
