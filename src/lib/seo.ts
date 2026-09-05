// One place that builds page metadata, so every route emits the same set of
// tags and none of them can drift.
//
// Before this existed, pages set only `title` and `description`: canonical was
// injected client-side from a useEffect (which crawlers other than Googlebot
// never run), and there was no hreflang at all — so /en/apps and /fr/apps
// competed with each other instead of consolidating.
//
// Open Graph images point at the routes the `opengraph-image.tsx` files serve.
// They are named explicitly rather than left to the file convention because a
// file-based image is not inherited once a nested segment sets its own
// `openGraph` block — which every page here does, through this helper. Without
// this, only the two segments that own an opengraph-image file had a card.

import type { Metadata } from 'next';
import { defaultLocale, locales } from '../../i18n';

export const SITE_URL = 'https://mayorana.ch';
export const SITE_NAME = 'Mayorana';

/**
 * Google Search Console verification token.
 *
 * Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in the deploy environment to the
 * value Search Console gives you for the "HTML tag" method — the content
 * attribute only, not the whole tag. Left unset, no verification meta is
 * emitted, which is correct: a placeholder token is worse than none.
 *
 * Only needed until the property is verified; Google keeps the verification
 * once granted, but leaving it set means re-verification never breaks.
 */
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

type BuildMetadataArgs = {
  locale: string;
  /** Path below the locale segment, leading slash, no locale. '' for the home page. */
  path: string;
  title: string;
  description: string;
  /** Set for pages that should stay out of the index (thin or duplicate pages). */
  noindex?: boolean;
  /**
   * Route serving this page's social card, below the locale segment. Defaults
   * to the site-wide card; the per-tool pages pass their own.
   */
  ogImagePath?: string;
  /** 'article' for blog posts; everything else on the site is a 'website'. */
  ogType?: 'website' | 'article';
  /**
   * Whether the same path exists in every locale. True for the fixed pages,
   * where /en/apps and /fr/apps are the same page. False for blog posts: the
   * French posts carry their own slugs with no reliable mapping back to the
   * English ones, so a locale-swapped URL would be a 404 — and an hreflang
   * pointing at a 404 is worse than emitting none at all.
   */
  crossLocale?: boolean;
};

/**
 * Canonical + hreflang for one page.
 *
 * Every locale of a page points at itself as canonical and lists its siblings
 * as alternates; x-default goes to the default locale. The URLs are the ones
 * the site actually serves — locale-prefixed — because /apps 307-redirects to
 * /en/apps and a canonical must never point at a redirect.
 */
function alternatesFor(
  locale: string,
  path: string,
  crossLocale: boolean,
): Metadata['alternates'] {
  const canonical = `${SITE_URL}/${locale}${path}`;
  if (!crossLocale) return { canonical };

  const languages = Object.fromEntries(
    locales.map((l) => [l, `${SITE_URL}/${l}${path}`]),
  ) as Record<string, string>;

  return {
    canonical,
    languages: {
      ...languages,
      'x-default': `${SITE_URL}/${defaultLocale}${path}`,
    },
  };
}

export function buildMetadata({
  locale,
  path,
  title,
  description,
  noindex = false,
  ogImagePath = '/opengraph-image',
  ogType = 'website',
  crossLocale = true,
}: BuildMetadataArgs): Metadata {
  // Built once and set absolutely. The locale layout declares a
  // '%s | Mayorana' title template, but a template only reaches the segment
  // directly below the one that declared it — /apps/[slug] sits under
  // /apps/layout.tsx, which sets a plain title and so consumes it, and the
  // template never reaches og:title in any case. Setting the full string with
  // `absolute` makes every page's title identical in <title> and in the
  // social cards, whatever its depth.
  const fullTitle = `${title} | ${SITE_NAME}`;
  const ogImage = `${SITE_URL}/${locale}${ogImagePath}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: fullTitle },
    description,
    alternates: alternatesFor(locale, path, crossLocale),
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      locale: locale === 'fr' ? 'fr_CH' : 'en_US',
      url: `${SITE_URL}/${locale}${path}`,
      title: fullTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    ...(GOOGLE_SITE_VERIFICATION
      ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}
