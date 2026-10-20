import { Panel } from './StatusPill';
import { useAllocation } from '../mock/hooks';

export function AllocationCard() {
  const { data } = useAllocation();
  const used = data?.used ?? 0;
  const total = data?.total ?? 1000;
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <Panel title="Allocation" flush={false}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span className="app-big app-big-sm" style={{ fontVariantNumeric: 'tabular-nums' }} data-testid="text-allocation-card-remaining">
          {(total - used).toLocaleString('en-US')} CR
        </span>
        <span className="app-meta">remaining</span>
      </div>
      <div className="app-progress" style={{ marginTop: 12 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <i style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span className="app-meta">{used.toLocaleString('en-US')} used</span>
        <span className="app-meta">of {total.toLocaleString('en-US')} CR daily</span>
      </div>
    </Panel>
  );
}
