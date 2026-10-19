import { format } from 'date-fns';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { EXPLORER_TX_URL } from '../chain';
import { FeatureBanner } from '../components/FeatureBanner';
import { AcquisitionArt, GaugeArt, GpuCardArt, VaultArt } from '../components/AppVisuals';
import { Panel } from '../components/StatusPill';
import { StatPanel } from '../components/StatPanel';
import { useTreasury } from '../mock/hooks';

function truncateTx(tx: string) {
  return tx.length > 18 ? `${tx.slice(0, 10)}…${tx.slice(-6)}` : tx;
}

export default function Treasury() {
  const { data } = useTreasury();
  const stats = data?.stats;
  const transactions = data?.transactions ?? [];

  const copyTx = (tx: string) => {
    navigator.clipboard
      .writeText(tx)
      .then(() => toast.success('Transaction hash copied'))
      .catch(() => toast.error('Clipboard unavailable'));
  };

  return (
    <div>
      <FeatureBanner
        feature="treasury"
        title="Treasury"
        meta="Network finances and compute acquisitions"
        actions={<span className="demo-badge">DEMO DATA · REPLACEABLE DATA SOURCE</span>}
      />

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 14 }}>
        <StatPanel label="Treasury balance" value={stats?.balanceUsd ?? 0} suffix="USD" meta="Multi-asset · mark to market" art={<VaultArt />} />
        <StatPanel label="Compute purchased 30d" value={stats?.compute30dUsd ?? 0} suffix="USD" meta="GPU capacity acquisitions" art={<AcquisitionArt />} />
        <StatPanel label="Active GPU capacity" value={stats?.activeGpuCapacity ?? 0} suffix="GPUS" meta="Across provider network" art={<GpuCardArt />} />
        <StatPanel label="Avg cost per CR" value={stats?.avgCostPerCr ?? 0} decimals={2} suffix="USD" meta="Blended · 30d" art={<GaugeArt />} />
      </div>

      <Panel title="Transactions" right={<span className="app-meta">Recent</span>} flush>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>ASSET</th>
                <th>AMOUNT</th>
                <th>NETWORK</th>
                <th>PURPOSE</th>
                <th style={{ textAlign: 'right' }}>TX</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="mono" style={{ fontSize: 10 }}>{format(tx.date, 'yyyy-MM-dd')}</td>
                  <td style={{ fontWeight: 700, fontSize: 10 }}>{tx.asset}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{tx.amount}</td>
                  <td className="mono" style={{ fontSize: 9, color: 'var(--asub)' }}>{tx.network.toUpperCase()}</td>
                  <td className="mono" style={{ fontSize: 9, color: 'var(--asub)' }}>{tx.purpose}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="mono" style={{ fontSize: 9 }}>{truncateTx(tx.tx)}</span>
                    <button
                      onClick={() => copyTx(tx.tx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ameta)', padding: '0 4px', verticalAlign: '-2px' }}
                      aria-label="Copy transaction hash"
                      data-testid={`button-copy-tx-${tx.id}`}
                    >
                      <Copy size={11} />
                    </button>
                    <a
                      href={EXPLORER_TX_URL(tx.tx)}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--ameta)', verticalAlign: '-2px' }}
                      aria-label="View on explorer"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ExternalLink size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="app-meta" style={{ marginTop: 10 }}>
        MOCK ROWS · WILL STREAM FROM ON-CHAIN DATA SOURCE WHEN LIVE
      </div>
    </div>
  );
}
