// File: src/app/[locale]/terms/page.tsx
// A server component: the text is static, so no JS is sent for it.

import TermsEn from './TermsEn';
import TermsFr from './TermsFr';

type Props = { params: Promise<{ locale: string }> };

export default async function TermsOfServicePage({ params }: Props) {
  const { locale } = await params;
  return locale === 'fr' ? <TermsFr /> : <TermsEn />;
}
