'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function CanonicalMeta() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Remove existing canonical if any
    const existing = document.querySelector('link[rel="canonical"]');
    if (existing) existing.remove();

    // Generate clean canonical URL
    const baseUrl = 'https://mayorana.ch';
    let cleanPath = pathname;

    // Remove trailing slash except for locale roots
    if (cleanPath !== '/en' && cleanPath !== '/fr' && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }

    // Only keep pagination parameters
    const allowedParams = ['page'];
    const relevantParams = new URLSearchParams();
    allowedParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) relevantParams.set(param, value);
    });

    const queryString = relevantParams.toString();
    const canonical = `${baseUrl}${cleanPath}${queryString ? `?${queryString}` : ''}`;

    // Add canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonical;
    document.head.appendChild(link);

    // Add noindex for tracking parameters
    if (searchParams.has('ref') || searchParams.has('from') || searchParams.has('utm_source')) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, follow';
      document.head.appendChild(meta);
    }
  }, [pathname, searchParams]);

  return null;
}
