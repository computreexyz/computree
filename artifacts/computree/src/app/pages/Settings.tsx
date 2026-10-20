import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FeatureBanner } from '../components/FeatureBanner';
import { AssetMark, ControlBoardArt, KeyAccessArt } from '../components/AppVisuals';
import { robinhoodChain } from '../chain';
import { Panel } from '../components/StatusPill';
import { KEYS_STORAGE, MOCK_WALLET } from '../mock/data';
import { DEMO_STORAGE, useDemoMode, useMe } from '../mock/hooks';

const REDUCED_MOTION_STORAGE = 'ctree_reduced_motion';

function SettingRow({ label, hint, icon, children }: { label: string; hint?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 46, borderBottom: '1px solid var(--ahair)' }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>{icon}{label}</div>
        {hint ? <div className="app-meta" style={{ marginTop: 3 }}>{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, testId }: { on: boolean; onChange: (on: boolean) => void; testId?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`app-filter-chip${on ? ' is-on' : ''}`}
      style={{ minWidth: 52, justifyContent: 'center' }}
      data-testid={testId}
    >
      {on ? 'ON' : 'OFF'}
    </button>
  );
}

function WalletSection() {
  const { user, authenticated, logout } = usePrivy();
  const [demo, setDemo] = useDemoMode();
  const { data: me } = useMe();
  const address = user?.wallet?.address ?? (demo ? MOCK_WALLET.address : null);
  const eligibility = me?.eligibility;
  const balance = eligibility?.balance ?? 0;
  const eligible = eligibility?.eligible ?? false;

  const disconnect = () => {
    if (authenticated) logout();
    if (demo) setDemo(false);
    toast.success('Disconnected');
  };

  return (
    <Panel title="Wallet" right={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}><span style={{ width: 110, height: 46 }} aria-hidden="true"><KeyAccessArt /></span>{demo && !authenticated ? <span className="app-demo-badge">DEMO</span> : undefined}</span>}>
      <div style={{ display: 'grid', gap: 0 }}>
        <SettingRow label="Address" hint={address ?? 'NOT CONNECTED'}>
          <span className="mono" style={{ fontSize: 10 }}>
            {address ? `${address.slice(0, 10)}…${address.slice(-8)}` : '—'}
          </span>
        </SettingRow>
        <SettingRow label="Network" hint={`${robinhoodChain.name} · Chain ID ${robinhoodChain.id}`}>
          <span className="mono" style={{ fontSize: 10 }}>{MOCK_WALLET.network.toUpperCase()}</span>
        </SettingRow>
        <SettingRow label="Staked balance (tokenized NVDA)">
          <span className="mono" style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', display: 'inline-flex', alignItems: 'center', gap: 6 }} data-testid="text-staked-balance">
            <AssetMark asset="NVDA" size={13} />{balance.toLocaleString('en-US')} tokenized NVDA
          </span>
        </SettingRow>
        <SettingRow label="Daily allocation" hint="1,000 CR EVERY DAY · NO MINIMUM STAKE">
          {eligible ? (
            <span className="status-pill" data-testid="pill-eligible">ACTIVE</span>
          ) : (
            <span className="mono" style={{ fontSize: 10, color: 'var(--ameta)' }}>—</span>
          )}
        </SettingRow>
        <div style={{ paddingTop: 14 }}>
          <button className="button button-outline" style={{ minHeight: 36 }} onClick={disconnect} data-testid="button-disconnect">
            Disconnect
          </button>
        </div>
      </div>
    </Panel>
  );
}

function PreferencesSection() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      return localStorage.getItem(REDUCED_MOTION_STORAGE) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (reducedMotion) localStorage.setItem(REDUCED_MOTION_STORAGE, '1');
      else localStorage.removeItem(REDUCED_MOTION_STORAGE);
    } catch {
      /* storage unavailable */
    }
    if (reducedMotion) document.documentElement.dataset.reducedMotion = 'true';
    else delete document.documentElement.dataset.reducedMotion;
  }, [reducedMotion]);

  return (
    <Panel title="Preferences" right={<span style={{ width: 110, height: 46 }} aria-hidden="true"><ControlBoardArt /></span>}>
      <SettingRow label="Reduce motion" hint="DISABLES ANIMATIONS APP-WIDE" >
        <Toggle on={reducedMotion} onChange={setReducedMotion} testId="toggle-reduced-motion" />
      </SettingRow>
    </Panel>
  );
}

function DangerSection() {
  const [, setDemo] = useDemoMode();

  const clearAll = () => {
    try {
      localStorage.removeItem(KEYS_STORAGE);
      localStorage.removeItem(DEMO_STORAGE);
      localStorage.removeItem(REDUCED_MOTION_STORAGE);
      localStorage.removeItem('ctree_rail_collapsed');
    } catch {
      /* storage unavailable */
    }
    setDemo(false);
    delete document.documentElement.dataset.reducedMotion;
    toast.success('Demo data cleared');
    window.setTimeout(() => window.location.reload(), 500);
  };

  return (
    <Panel title="Danger zone">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700 }}>Clear demo data</div>
          <div className="app-meta" style={{ marginTop: 3 }}>REMOVES API KEYS, DEMO FLAG AND LOCAL PREFERENCES</div>
        </div>
        <button
          className="button"
          style={{ minHeight: 36, background: 'hsl(0 72% 52%)', color: '#fff' }}
          onClick={clearAll}
          data-testid="button-clear-demo-data"
        >
          Clear local data
        </button>
      </div>
    </Panel>
  );
}

export default function Settings() {
  return (
    <div>
      <FeatureBanner feature="settings" title="Settings" meta="Account and preferences" />
      <div style={{ display: 'grid', gap: 14, maxWidth: 720 }}>
        <WalletSection />
        <PreferencesSection />
        <DangerSection />
      </div>
    </div>
  );
}
