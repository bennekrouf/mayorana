'use client';

import { useId, type ReactNode } from 'react';

// Building blocks for the small product-flow schemas on the tool cards. Same
// visual language as the inline SVGs in the blog posts (rounded boxes, one
// accent box for the product itself, muted arrows), but drawn with the theme's
// Tailwind tokens so they follow light/dark without their own CSS variables.

// Content width of a vertical flow: about what a narrow card (phone, or the
// three-column Apps grid) leaves, so the text renders at its real size.
export const VERTICAL_WIDTH = 250;

export function ArrowMarker({ id }: { id: string }) {
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

// Marker ids must be unique per page, and a diagram can render more than once.
export function useArrowId(prefix: string) {
  return `${prefix}-arrow-${useId().replace(/:/g, '')}`;
}

export function Links({ children }: { children: ReactNode }) {
  return (
    <g className="stroke-muted-foreground" strokeWidth={1.5} fill="none">
      {children}
    </g>
  );
}

type NodeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  sub?: string;
  /** The product itself: filled with the brand colour. */
  accent?: boolean;
  italic?: boolean;
};

// A box with a title and an optional second line. Without `sub` the title is
// a single centred label, which is what the input/channel boxes use.
export function Node({ x, y, width, height, title, sub, accent, italic }: NodeProps) {
  const cx = x + width / 2;
  const mid = y + height / 2;
  const box = accent ? 'fill-primary stroke-primary' : 'fill-background stroke-border';
  const titleClass = accent
    ? 'fill-white text-[14px] font-bold'
    : sub
      ? 'fill-foreground text-[13px] font-bold'
      : 'fill-foreground text-[12px] font-semibold';

  return (
    <>
      <rect x={x} y={y} width={width} height={height} rx="8" className={box} strokeWidth={1.5} />
      <g textAnchor="middle">
        <text
          x={cx}
          y={sub ? mid - 5 : mid + 4}
          className={`${titleClass}${italic ? ' italic' : ''}`}
        >
          {title}
        </text>
        {sub && (
          <text
            x={cx}
            y={mid + 13}
            className={accent ? 'fill-white text-[11px] font-semibold' : 'fill-muted-foreground text-[11px]'}
          >
            {sub}
          </text>
        )}
      </g>
    </>
  );
}

// A top-to-bottom flow drawn in a VERTICAL_WIDTH-wide box, with its caption as
// HTML underneath rather than SVG text so longer (French) captions can wrap.
export function VerticalFlow({
  label,
  caption,
  height,
  className = '',
  children,
}: {
  label: string;
  caption: string;
  height: number;
  className?: string;
  children: (arrow: string) => ReactNode;
}) {
  const arrowId = useArrowId('flow');
  return (
    <div className={`w-full max-w-[250px] mx-auto ${className}`}>
      <svg
        viewBox={`-2 -2 ${VERTICAL_WIDTH + 4} ${height + 4}`}
        width="100%"
        className="block h-auto"
        role="img"
        aria-label={label}
      >
        <ArrowMarker id={arrowId} />
        {children(`url(#${arrowId})`)}
      </svg>
      <p className="mt-3 text-center text-[11px] italic text-muted-foreground [text-wrap:balance]">
        {caption}
      </p>
    </div>
  );
}
