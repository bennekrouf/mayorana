'use client';

import { useTranslations } from 'next-intl';
import { Links, Node, VerticalFlow } from './FlowPrimitives';

// SOLANIZE: a sentence becomes a transaction, which only reaches Solana once
// the user has signed it in Phantom.
export function SolanizeFlowDiagram() {
  const t = useTranslations('portfolio');

  return (
    <VerticalFlow
      label={t('solanize_diagram_aria')}
      caption={t('solanize_diagram_caption')}
      height={202}
    >
      {(arrow) => (
        <>
          <Node x={25} y={0} width={200} height={34} title={t('solanize_diagram_prompt')} italic />

          <Links>
            <path d="M125,34 L125,62" markerEnd={arrow} />
            <path d="M105,118 C105,134 56,130 56,146" markerEnd={arrow} />
            <path d="M112,175 L136,175" markerEnd={arrow} />
          </Links>

          <Node
            x={65}
            y={64}
            width={120}
            height={54}
            title="SOLANIZE"
            sub={t('solanize_diagram_engine')}
            accent
          />
          <Node
            x={0}
            y={148}
            width={112}
            height={54}
            title="Phantom"
            sub={t('solanize_diagram_sign')}
          />
          <Node
            x={138}
            y={148}
            width={112}
            height={54}
            title="Solana"
            sub={t('solanize_diagram_chain')}
          />
        </>
      )}
    </VerticalFlow>
  );
}
