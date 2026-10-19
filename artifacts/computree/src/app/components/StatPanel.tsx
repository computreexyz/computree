import { useEffect, useState } from 'react';
import { CountUp } from './CountUp';

export function nextUtcMidnight(): number {
  return (Math.floor(Date.now() / 86400000) + 1) * 86400000;
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Ticking chip: RESET HH:MM:SS until next UTC midnight. */
export function CountdownChip({ className = '' }: { className?: string }) {
  const [remaining, setRemaining] = useState(() => nextUtcMidnight() - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(nextUtcMidnight() - Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className={`app-chip ${className}`} title="Time until daily allocation reset (00:00 UTC)">
      <span className="app-meta" style={{ color: 'inherit', opacity: 0.65 }}>Reset</span>
      <span className="app-chip-num">{formatCountdown(remaining)}</span>
    </span>
  );
}

/** Big stat panel: mono label + large tabular number + optional meta/footer. */
export function StatPanel({
  label,
  value,
  suffix,
  decimals = 0,
  meta,
  icon,
  art,
  children,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  meta?: string;
  icon?: React.ReactNode;
  art?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="app-panel app-panel-body" style={{ position: 'relative', overflow: 'hidden' }}>
      {art ? <div className="app-card-visual" aria-hidden="true">{art}</div> : null}
      <div className="app-meta" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>{icon}{label}</div>
      <div className="app-big app-big-sm" style={{ marginTop: 10 }}>
        <CountUp
          value={value}
          format={(n) =>
            n.toLocaleString('en-US', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
          }
        />
        {suffix ? <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ameta)', marginLeft: 5 }}>{suffix}</span> : null}
      </div>
      {meta ? <div className="app-meta" style={{ marginTop: 8 }}>{meta}</div> : null}
      {children}
    </div>
  );
}
