'use client';

import { useTranslations } from 'next-intl';
import { ArrowMarker, Links, Node, VerticalFlow, useArrowId } from './FlowPrimitives';

// API0.AI: chat channels on one side, the gateway as the accent hub, a real
// backend behind it.
//
// Two drawings: left-to-right, and the shared top-to-bottom one. `responsive`
// switches at `md` (the home card, which sits next to the Azure one from there
// up); `vertical` is for cards that are narrow at every width, like the Apps grid.
export function Api0FlowDiagram({ layout = 'responsive' }: { layout?: 'responsive' | 'vertical' }) {
  const t = useTranslations('home');
  const hArrowId = useArrowId('api0-h');
  const hArrow = `url(#${hArrowId})`;

  const chat = t('api0_diagram_chat');
  const gateway = t('api0_diagram_gateway');
  const target = t('api0_diagram_target');
  const targetSub = t('api0_diagram_target_sub');

  return (
    <>
      {layout === 'responsive' && (
        <svg
          viewBox="-2 -2 444 134"
          width="100%"
          className="hidden md:block h-auto max-w-[440px] mx-auto"
          role="img"
          aria-label={t('api0_diagram_aria')}
        >
          <ArrowMarker id={hArrowId} />

          <Node x={0} y={10} width={110} height={38} title="WhatsApp" />
          <Node x={0} y={66} width={110} height={38} title={chat} />

          <Links>
            <path d="M110,29 C132,29 132,48 153,48" markerEnd={hArrow} />
            <path d="M110,85 C132,85 132,66 153,66" markerEnd={hArrow} />
            <path d="M275,57 L308,57" markerStart={hArrow} markerEnd={hArrow} />
          </Links>

          <Node x={155} y={27} width={120} height={60} title="API0.AI" sub={gateway} accent />
          <Node x={310} y={27} width={130} height={60} title={target} sub={targetSub} />

          <text
            x="220"
            y="126"
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] italic"
          >
            {t('api0_diagram_caption')}
          </text>
        </svg>
      )}

      <VerticalFlow
        label={t('api0_diagram_aria')}
        caption={t('api0_diagram_caption')}
        height={202}
        className={layout === 'responsive' ? 'md:hidden' : ''}
      >
        {(arrow) => (
          <>
            <Node x={0} y={0} width={118} height={34} title="WhatsApp" />
            <Node x={132} y={0} width={118} height={34} title={chat} />

            <Links>
              <path d="M59,34 C59,50 110,46 110,62" markerEnd={arrow} />
              <path d="M191,34 C191,50 140,46 140,62" markerEnd={arrow} />
              <path d="M125,120 L125,146" markerStart={arrow} markerEnd={arrow} />
            </Links>

            <Node x={65} y={64} width={120} height={54} title="API0.AI" sub={gateway} accent />
            <Node x={55} y={148} width={140} height={54} title={target} sub={targetSub} />
          </>
        )}
      </VerticalFlow>
    </>
  );
}
