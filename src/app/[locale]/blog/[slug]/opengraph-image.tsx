// Per-post social card: the post's title on the card, so a shared link to one
// article does not look like a link to every other page on the site. Same
// layout as the per-app cards (apps/[slug]/opengraph-image.tsx).

import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog';
import { getAuthor } from '@/lib/authors';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Mayorana blog post';

export default async function PostOpengraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);
  const title = post?.title ?? 'Mayorana Blog';
  // Long questions as titles are common here; shrink rather than overflow.
  const fontSize = title.length > 90 ? 52 : title.length > 60 ? 62 : 74;

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
            MAYORANA BLOG
          </div>
          {post?.tags?.[0] && (
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
              {post.tags[0]}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', fontSize, color: '#FFFFFF', fontWeight: 700, lineHeight: 1.1 }}>
          {title.slice(0, 140)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#71717A' }}>
          <div>{post ? `${getAuthor(post.author).name} · ${post.readingTime}` : ''}</div>
          <div>{`mayorana.ch/${locale}/blog`}</div>
        </div>
      </div>
    ),
    size,
  );
}
