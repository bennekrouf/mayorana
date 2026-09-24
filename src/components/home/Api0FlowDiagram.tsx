'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';

// Small request-flow schema for the API0.AI card: chat channels, the gateway
// as the accent hub, a real backend behind it. Same visual language as the
// inline SVGs in the blog posts, but drawn with the theme's Tailwind tokens so
// it follows light/dark without its own CSS variables.
//
// Two drawings: left-to-right from `md` up, where the card sits next to the
// Azure one, and top-to-bottom below it, sized to the ~245px a phone leaves the
// card so the text renders at its real size instead of being scaled down.
export function Api0FlowDiagram() {
  const t = useTranslations('home');
  const uid = useId().replace(/:/g, '');
  const hArrow = `api0-arrow-h-${uid}`;
  const vArrow = `api0-arrow-v-${uid}`;

  return (
    <>
      <svg
        viewBox="-2 -2 444 134"
        width="100%"
        className="hidden md:block h-auto max-w-[440px] mx-auto"
        role="img"
        aria-label={t('api0_diagram_aria')}
      >
        <ArrowMarker id={hArrow} />

        {/* Channels */}
        <g className="fill-background stroke-border" strokeWidth={1.5}>
          <rect x="0" y="10" width="110" height="38" rx="8" />
          <rect x="0" y="66" width="110" height="38" rx="8" />
        </g>
        <g className="fill-foreground text-[12px] font-semibold" textAnchor="middle">
          <text x="55" y="33">WhatsApp</text>
          <text x="55" y="89">{t('api0_diagram_chat')}</text>
        </g>

        {/* Links */}
        <g className="stroke-muted-foreground" strokeWidth={1.5} fill="none">
          <path d="M110,29 C132,29 132,48 153,48" markerEnd={`url(#${hArrow})`} />
          <path d="M110,85 C132,85 132,66 153,66" markerEnd={`url(#${hArrow})`} />
          <path d="M275,57 L308,57" markerStart={`url(#${hArrow})`} markerEnd={`url(#${hArrow})`} />
        </g>

        <Gateway x={155} y={27} width={120} height={60} />
        <Target x={310} y={27} width={130} height={60} />

        {/* Caption */}
        <text x="220" y="126" textAnchor="middle" className="fill-muted-foreground text-[11px] italic">
          {t('api0_diagram_caption')}
        </text>
      </svg>

      <div className="md:hidden w-full max-w-[250px] mx-auto">
        <svg viewBox="-2 -2 254 206" width="100%" className="block h-auto" role="img" aria-label={t('api0_diagram_aria')}>
          <ArrowMarker id={vArrow} />

          {/* Channels */}
          <g className="fill-background stroke-border" strokeWidth={1.5}>
            <rect x="0" y="0" width="118" height="34" rx="8" />
            <rect x="132" y="0" width="118" height="34" rx="8" />
          </g>
          <g className="fill-foreground text-[12px] font-semibold" textAnchor="middle">
            <text x="59" y="21">WhatsApp</text>
            <text x="191" y="21">{t('api0_diagram_chat')}</text>
          </g>

          {/* Links */}
          <g className="stroke-muted-foreground" strokeWidth={1.5} fill="none">
            <path d="M59,34 C59,50 110,46 110,62" markerEnd={`url(#${vArrow})`} />
            <path d="M191,34 C191,50 140,46 140,62" markerEnd={`url(#${vArrow})`} />
            <path d="M125,120 L125,146" markerStart={`url(#${vArrow})`} markerEnd={`url(#${vArrow})`} />
          </g>

          <Gateway x={65} y={64} width={120} height={54} />
          <Target x={55} y={148} width={140} height={54} />
        </svg>
        {/* HTML rather than SVG text so the longer French caption can wrap. */}
        <p className="mt-3 text-center text-[11px] italic text-muted-foreground [text-wrap:balance]">
          {t('api0_diagram_caption')}
        </p>
      </div>
    </>
  );
}

function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="7"
        markerHeight="7"
        orient="auto-start-reverse"
      >
        <path d="M0,0 L10,5 L0,10 z" className="fill-muted-foreground" />
      </marker>
    </defs>
  );
}

type Box = { x: number; y: number; width: number; height: number };

// Both labels are laid out from the box's top edge, so they sit the same in either drawing.
function Gateway({ x, y, width, height }: Box) {
  const t = useTranslations('home');
  const cx = x + width / 2;
  return (
    <>
      <rect x={x} y={y} width={width} height={height} rx="8" className="fill-primary stroke-primary" />
      <g fill="#ffffff" textAnchor="middle">
        <text x={cx} y={y + 24} className="text-[14px] font-bold">API0.AI</text>
        <text x={cx} y={y + 42} className="text-[11px] font-semibold">{t('api0_diagram_gateway')}</text>
      </g>
    </>
  );
}

function Target({ x, y, width, height }: Box) {
  const t = useTranslations('home');
  const cx = x + width / 2;
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="8"
        className="fill-background stroke-border"
        strokeWidth={1.5}
      />
      <g textAnchor="middle">
        <text x={cx} y={y + 24} className="fill-foreground text-[13px] font-bold">
          {t('api0_diagram_target')}
        </text>
        <text x={cx} y={y + 42} className="fill-muted-foreground text-[11px]">
          {t('api0_diagram_target_sub')}
        </text>
      </g>
    </>
  );
}
