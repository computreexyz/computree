import { StatusGlyph } from '../components/AppArt';
import { NodeRingArt, ProviderMark } from '../components/AppVisuals';
import { FeatureBanner } from '../components/FeatureBanner';
import { Panel } from '../components/StatusPill';
import { useProviders } from '../mock/hooks';

export default function Network() {
  const { data } = useProviders();
  const providers = data ?? [];
  const online = providers.filter((p) => p.online).length;

  return (
    <div>
      <FeatureBanner feature="network" title="Network" meta="Provider infrastructure and capacity" />
      <div style={{ display: 'grid', gap: 14 }}>
        <Panel
          title="Topology"
          right={<span className="app-meta">{online} of {providers.length} providers online</span>}
          bodyStyle={{ padding: '14px 18px' }}
        >
          <div style={{ height: 300, maxWidth: 560, margin: '0 auto' }}>
            <NodeRingArt providers={providers} />
          </div>
        </Panel>

        <Panel title="Providers" right={<span className="app-meta">Last 24h</span>} flush>
          {providers.map((p) => (
            <div key={p.name} className="app-provider-row" data-testid={`row-provider-${p.name.toLowerCase()}`}>
              <StatusGlyph status={p.online ? 'online' : 'offline'} size={13} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                <ProviderMark name={p.name} size={22} />
                <span style={{ fontWeight: 600, fontSize: 13, color: p.online ? undefined : 'var(--ameta)' }}>{p.name}</span>
              </span>
              <span className="app-tnum" style={{ color: 'var(--ameta)' }}>{p.gpuClass}</span>
              <span className="app-provider-cap">
                <span className="app-progress app-progress-thin" style={{ display: 'block' }}>
                  <i style={{ width: `${p.capacityPct}%` }} />
                </span>
              </span>
              <span className="app-tnum" style={{ textAlign: 'right', color: 'var(--asub)' }}>
                {p.online ? `${p.jobs24h.toLocaleString('en-US')} jobs` : 'Offline'}
              </span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
