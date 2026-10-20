import { usePrivy } from '@privy-io/react-auth';
import { ArrowRight } from 'lucide-react';
import { ComputreeLogo } from '@/components/ComputreeLogo';
import { Skeleton } from '@/components/ui/skeleton';
import { useDemoMode } from './mock/hooks';

function GuardSkeleton() {
  return (
    <div className="app-scope" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--abg)' }}>
      <div style={{ width: 'min(420px, 90%)', display: 'grid', gap: 12 }}>
        <Skeleton className="app-skel" style={{ height: 14, width: '40%', borderRadius: 0 }} />
        <Skeleton className="app-skel" style={{ height: 40, width: '100%', borderRadius: 0 }} />
        <Skeleton className="app-skel" style={{ height: 40, width: '72%', borderRadius: 0 }} />
      </div>
    </div>
  );
}

function ConnectScreen() {
  const { login } = usePrivy();
  const [, setDemo] = useDemoMode();

  return (
    <div className="app-scope app-connect">
      <div className="app-connect-inner">
        <ComputreeLogo />
        <div className="section-label eyebrow" style={{ marginTop: 26 }}>COMPUTREE APP</div>
        <h1>CONNECT YOUR WALLET.</h1>
        <p className="mono" style={{ fontSize: 10, lineHeight: 1.9, letterSpacing: '.04em', color: 'var(--asub)', maxWidth: 420 }}>
          STAKE SUPPORTED TOKENIZED ASSETS TO UNLOCK DAILY GPU COMPUTE.
          <br />
          CONNECT A WALLET TO VERIFY YOUR STAKE AND UNLOCK YOUR ALLOCATION.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 26, flexWrap: 'wrap' }}>
          <button className="button button-dark" onClick={login} data-testid="button-connect-wallet">
            Connect Wallet <ArrowRight size={13} aria-hidden="true" />
          </button>
          <button
            onClick={() => setDemo(true)}
            data-testid="button-demo-mode"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--asub)', font: '500 10px var(--app-font-mono)', letterSpacing: '.08em', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Explore demo instead
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Gate for /app/* routes: waits for Privy readiness, then requires either
 * an authenticated session or the localStorage demo flag.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy();
  const [demo] = useDemoMode();

  if (!ready) return <GuardSkeleton />;
  if (!authenticated && !demo) return <ConnectScreen />;
  return <>{children}</>;
}
