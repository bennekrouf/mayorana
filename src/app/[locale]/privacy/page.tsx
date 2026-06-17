// File: src/app/[locale]/privacy/page.tsx
'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import PrivacyEn from './PrivacyEn';
import PrivacyFr from './PrivacyFr';

export default function PrivacyPolicyPage() {
  const locale = useLocale();
  return locale === 'fr' ? <PrivacyFr /> : <PrivacyEn />;
}
