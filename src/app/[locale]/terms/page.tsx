// File: src/app/[locale]/terms/page.tsx
'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import TermsEn from './TermsEn';
import TermsFr from './TermsFr';

export default function TermsOfServicePage() {
  const locale = useLocale();
  return locale === 'fr' ? <TermsFr /> : <TermsEn />;
}
