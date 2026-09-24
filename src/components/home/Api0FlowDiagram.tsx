'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';

// Small request-flow schema for the API0.AI card: chat channels on the left,
// the gateway as the accent hub, a real backend on the right. Same visual
// language as the inline SVGs in the blog posts, but drawn with the theme's
// Tailwind tokens so it follows light/dark without its own CSS variables.
export function Api0FlowDiagram() {
  const t = useTranslations('home');
  const arrowId = `api0-arrow-${useId().replace(/:/g, '')}`;
  const arrow = `url(#${arrowId})`;

  return (
    <svg
      viewBox="-2 -2 444 134"
      width="100%"
      className="h-auto max-w-[440px] mx-auto block"
      role="img"
      aria-label={t('api0_diagram_aria')}
    >
      <defs>
        <marker
          id={arrowId}
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
        <path d="M110,29 C132,29 132,48 153,48" markerEnd={arrow} />
        <path d="M110,85 C132,85 132,66 153,66" markerEnd={arrow} />
        <path d="M275,57 L308,57" markerStart={arrow} markerEnd={arrow} />
      </g>

      {/* Gateway */}
      <rect x="155" y="27" width="120" height="60" rx="8" className="fill-primary stroke-primary" />
      <g fill="#ffffff" textAnchor="middle">
        <text x="215" y="52" className="text-[14px] font-bold">API0.AI</text>
        <text x="215" y="70" className="text-[11px] font-semibold">{t('api0_diagram_gateway')}</text>
      </g>

      {/* Target backend */}
      <rect
        x="310"
        y="27"
        width="130"
        height="60"
        rx="8"
        className="fill-background stroke-border"
        strokeWidth={1.5}
      />
      <g textAnchor="middle">
        <text x="375" y="52" className="fill-foreground text-[13px] font-bold">
          {t('api0_diagram_target')}
        </text>
        <text x="375" y="70" className="fill-muted-foreground text-[11px]">
          {t('api0_diagram_target_sub')}
        </text>
      </g>

      {/* Caption */}
      <text x="220" y="126" textAnchor="middle" className="fill-muted-foreground text-[11px] italic">
        {t('api0_diagram_caption')}
      </text>
    </svg>
  );
}
