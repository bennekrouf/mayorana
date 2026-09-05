// Per-tool social card. A link to one app should show that app's name, not the
// same generic site card as every other page — this is what makes a shared
// download link legible in Slack, LinkedIn or a chat window.

import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { appI18nKey, getToolBySlug, statusLabel } from '@/data/tools';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Mayorana desktop tool';

export default async function ToolOpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const tool = getToolBySlug(slug);
  const tApps = await getTranslations({ locale, namespace: 'apps' });

  const name = tool?.name ?? 'Mayorana';
  const tagline = tool ? tApps(`${appI18nKey[tool.id]}_tagline`) : '';

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
          <div style={{ fontSize: 28, color: '#FF6B00', letterSpacing: 2, fontWeight: 700 }}>
            MAYORANA
          </div>
          {tool && (
            <div
              style={{
                marginLeft: 12,
                fontSize: 22,
                color: '#A1A1AA',
                border: '1px solid #3F3F46',
                borderRadius: 999,
                padding: '4px 18px',
                textTransform: 'uppercase',
              }}
            >
              {statusLabel(tool.status)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 82, color: '#FFFFFF', fontWeight: 700, lineHeight: 1.05 }}>
            {name}
          </div>
          <div style={{ fontSize: 34, color: '#A1A1AA', lineHeight: 1.35 }}>
            {tagline.slice(0, 120)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#71717A' }}>
          <div>{tool?.tech.split('·')[0].trim() ?? 'Rust'}</div>
          <div>{`mayorana.ch/apps/${slug}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
