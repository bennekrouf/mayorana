'use client';

import { useTranslations } from 'next-intl';
import { Links, Node, VerticalFlow } from './FlowPrimitives';

// CVENOM: a CV and a job posting go in, a tailored CV and cover letter come out.
export function CvenomFlowDiagram() {
  const t = useTranslations('portfolio');

  return (
    <VerticalFlow label={t('cvenom_diagram_aria')} caption={t('cvenom_diagram_caption')} height={202}>
      {(arrow) => (
        <>
          <Node x={0} y={0} width={118} height={34} title={t('cvenom_diagram_cv')} />
          <Node x={132} y={0} width={118} height={34} title={t('cvenom_diagram_job')} />

          <Links>
            <path d="M59,34 C59,50 110,46 110,62" markerEnd={arrow} />
            <path d="M191,34 C191,50 140,46 140,62" markerEnd={arrow} />
            <path d="M125,118 L125,146" markerEnd={arrow} />
          </Links>

          <Node
            x={65}
            y={64}
            width={120}
            height={54}
            title="CVENOM"
            sub={t('cvenom_diagram_engine')}
            accent
          />
          <Node
            x={40}
            y={148}
            width={170}
            height={54}
            title={t('cvenom_diagram_output')}
            sub={t('cvenom_diagram_output_sub')}
          />
        </>
      )}
    </VerticalFlow>
  );
}
