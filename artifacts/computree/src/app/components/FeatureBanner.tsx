import type { ReactNode } from 'react';
import {
  ControlBoardArt,
  GpuCardArt,
  ImagesArt,
  KeyAccessArt,
  NodeRingArt,
  PipelineArt2,
  PlaygroundArt,
  ServerRackArt,
  StakingArt,
  VaultArt,
  WorkloadsArt,
} from './AppVisuals';
import { MOCK_PROVIDERS } from '../mock/data';

/* ------------------------------------------------------------------ */
/* Top feature banner - flat 2D identity per page                      */
/* ------------------------------------------------------------------ */

type BannerFeature = 'overview' | 'compute' | 'stake' | 'playground' | 'images' | 'workloads' | 'jobs' | 'keys' | 'network' | 'treasury' | 'settings';

const ART: Record<BannerFeature, (dark: boolean) => ReactNode> = {
  overview: () => (
    <g>
      <ServerRackArt />
    </g>
  ),
  compute: (dark) => <GpuCardArt dark={dark} />,
  stake: (dark) => <StakingArt dark={dark} />,
  playground: (dark) => <PlaygroundArt dark={dark} />,
  images: (dark) => <ImagesArt dark={dark} />,
  workloads: (dark) => <WorkloadsArt dark={dark} />,
  jobs: (dark) => <PipelineArt2 dark={dark} />,
  keys: (dark) => <KeyAccessArt dark={dark} />,
  network: (dark) => <NodeRingArt providers={MOCK_PROVIDERS} dark={dark} />,
  treasury: (dark) => <VaultArt dark={dark} />,
  settings: (dark) => <ControlBoardArt dark={dark} />,
};

const DARK_FEATURES: ReadonlySet<BannerFeature> = new Set(['compute', 'stake', 'playground', 'images', 'workloads', 'jobs', 'keys', 'network', 'treasury', 'settings']);

export function FeatureBanner({
  feature,
  title,
  meta,
  actions,
}: {
  feature: BannerFeature;
  title: string;
  meta?: string;
  actions?: ReactNode;
}) {
  const dark = DARK_FEATURES.has(feature);
  return (
    <section className={`fb${dark ? ' fb-dark' : ''}`} data-feature={feature}>
      <div className="fb-copy">
        <h1 className="fb-title">{title}</h1>
        {meta ? <p className="fb-sub">{meta}</p> : null}
        {actions ? <div className="fb-actions">{actions}</div> : null}
      </div>
      <div className="fb-art" aria-hidden="true">
        <div className="fb-art-frame">
          {ART[feature](dark)}
        </div>
      </div>
    </section>
  );
}

export type { BannerFeature };
