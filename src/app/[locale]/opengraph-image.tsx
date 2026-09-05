// Site-wide social card, generated at request time.
//
// Next merges the opengraph-image file convention into each segment's metadata,
// which is why src/lib/seo.ts deliberately sets no openGraph.images: doing both
// would emit two og:image tags. This one covers every page that does not
// override it; /apps/[slug] does.

import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Mayorana — Rust tools for Azure workflows and AI agents';

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0B0B0F',
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: '#FF6B00' }} />
          <div style={{ fontSize: 30, color: '#FF6B00', letterSpacing: 2, fontWeight: 700 }}>
            MAYORANA
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 68, color: '#FFFFFF', fontWeight: 700, lineHeight: 1.1 }}>
            {t('site_title')}
          </div>
          <div style={{ fontSize: 30, color: '#A1A1AA', lineHeight: 1.4 }}>
            {t('site_description').slice(0, 130)}
          </div>
        </div>

        <div style={{ fontSize: 26, color: '#71717A' }}>mayorana.ch</div>
      </div>
    ),
    size,
  );
}
