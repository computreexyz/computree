import { StatusGlyph } from './AppArt';
import { formatDistanceToNow } from 'date-fns';
import type { CSSProperties, ReactNode } from 'react';
import type { JobStatus } from '../mock/data';

export function StatusPill({ status }: { status: JobStatus }) {
  const cls = status === 'completed' ? 'status-pill' : `status-pill status-${status}`;
  return (
    <span className={cls}>
      <StatusGlyph status={status} size={11} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function RelativeTime({ ts }: { ts: number }) {
  return <>{formatDistanceToNow(ts, { addSuffix: true })}</>;
}

export function Panel({
  title,
  right,
  children,
  flush = false,
  foot,
  className = '',
  bodyStyle,
}: {
  title: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  flush?: boolean;
  foot?: ReactNode;
  className?: string;
  bodyStyle?: CSSProperties;
}) {
  return (
    <section className={`app-panel ${className}`}>
      <header className="app-panel-head">
        <span className="app-panel-title">{title}</span>
        {right}
      </header>
      <div className={flush ? 'app-panel-body-flush' : 'app-panel-body'} style={bodyStyle}>{children}</div>
      {foot ? <footer className="app-panel-foot">{foot}</footer> : null}
    </section>
  );
}
