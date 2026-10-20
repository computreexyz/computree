import { useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CountUp } from '../components/CountUp';
import { MiniBars, ResetClock, StatusGlyph } from '../components/AppArt';
import { GpuCardArt, ModelMark, NodeRingArt } from '../components/AppVisuals';
import { FeatureBanner } from '../components/FeatureBanner';
import { RelativeTime, StatusPill } from '../components/StatusPill';
import { formatCountdown, nextUtcMidnight } from '../components/StatPanel';
import { useChartInk } from '../components/useIsDark';
import { MOCK_PROVIDERS, MODEL_LABELS } from '../mock/data';
import { useAllocation, useHourlyUsage, useJobs, useMe, useWeekUsage } from '../mock/hooks';

/* ------------------------------ header ------------------------------ */

function OverviewHeader() {
  const online = MOCK_PROVIDERS.filter((p) => p.online).length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <FeatureBanner
      feature="overview"
      title="Overview"
      meta={`Daily compute allocation and network activity · ${today}`}
      actions={
        <span className="ov-status" data-testid="status-systems">
          <span className="app-led sim-led" />
          {online}/{MOCK_PROVIDERS.length} providers online
        </span>
      }
    />
  );
}

/* ---------------------------- hero card ----------------------------- */

function AllocationHero() {
  const { data } = useAllocation();
  const { data: me } = useMe();
  const used = data?.used ?? 0;
  const total = data?.total ?? 0;
  const remaining = total - used;
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const staked = me?.eligibility.balance ?? 0;

  return (
    <section className="app-panel app-panel-hero app-card-dark app-enter" data-testid="card-allocation-hero">
      <div className="ov-hero-art" aria-hidden="true"><GpuCardArt dark /></div>
      <div className="app-panel-body ov-hero-grid">
        <div>
          <span className="app-meta">Available compute</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <span className="app-big" style={{ fontSize: 42 }} data-testid="text-allocation-remaining">
              <CountUp value={remaining} format={(n) => Math.round(n).toLocaleString('en-US')} />
            </span>
            <span style={{ font: '500 15px var(--afont)', color: 'var(--ameta)', fontVariantNumeric: 'tabular-nums' }}>CR remaining</span>
          </div>
          <div className="app-progress" style={{ marginTop: 18 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span className="app-meta">{used.toLocaleString('en-US')} CR used · {pct.toFixed(0)}%</span>
            <span className="app-meta">of {total.toLocaleString('en-US')} CR daily allocation</span>
          </div>
          {total === 0 ? (
            <div className="mono" style={{ marginTop: 14, fontSize: 9, letterSpacing: '.06em', color: '#a8c9ee' }} data-testid="note-stake-to-unlock">
              STAKE ≥ 1,000 OF A SUPPORTED TOKENIZED ASSET TO UNLOCK YOUR DAILY ALLOCATION
            </div>
          ) : null}
        </div>
        <div className="ov-hero-side">
          <div>
            <span className="app-meta">Used today</span>
            <b><CountUp value={used} format={(n) => Math.round(n).toLocaleString('en-US')} /> CR</b>
          </div>
          <div>
            <span className="app-meta">Daily allocation</span>
            <b>{total.toLocaleString('en-US')} CR</b>
          </div>
          <div>
            <span className="app-meta">Source</span>
            <b className="mono" data-testid="text-staked-source">{staked.toLocaleString('en-US')} NVDA staked</b>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- summary cards --------------------------- */

function ResetCard() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const midnight = nextUtcMidnight();
  const dayStart = midnight - 86400000;
  const elapsedPct = Math.min(100, Math.max(0, ((now - dayStart) / 86400000) * 100));

  return (
    <section className="app-panel" data-testid="card-reset">
      <header className="app-panel-head">
        <span className="app-panel-title">Reset</span>
        <span className="app-meta">00:00 UTC</span>
      </header>
      <div className="app-panel-body" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="app-big app-big-sm" style={{ fontFamily: 'var(--app-font-mono)', fontWeight: 500, letterSpacing: '-.02em' }} data-testid="text-reset-countdown">
            {formatCountdown(midnight - now)}
          </div>
          <div className="app-progress app-progress-thin" style={{ marginTop: 14 }}>
            <i style={{ width: `${elapsedPct}%` }} />
          </div>
          <p className="app-meta" style={{ marginTop: 9 }}>Refreshes in {formatCountdown(midnight - now)} · {elapsedPct.toFixed(0)}% elapsed</p>
        </div>
        <ResetClock elapsed={elapsedPct / 100} now={now} size={92} />
      </div>
    </section>
  );
}

function NetworkCard() {
  const online = MOCK_PROVIDERS.filter((p) => p.online).length;
  return (
    <section className="app-panel" data-testid="card-network">
      <header className="app-panel-head">
        <span className="app-panel-title">Network</span>
        <a href="/app/network" className="app-meta" style={{ color: 'inherit', textDecoration: 'none' }}>View network →</a>
      </header>
      <div style={{ height: 96, padding: '6px 18px 0' }} aria-hidden="true">
        <NodeRingArt providers={MOCK_PROVIDERS} compact />
      </div>
      <div className="app-panel-body" style={{ paddingTop: 6, paddingBottom: 10 }}>
        {MOCK_PROVIDERS.slice(0, 4).map((p) => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 32, fontSize: 13 }}>
            <StatusGlyph status={p.online ? 'online' : 'offline'} size={13} />
            <span style={{ fontWeight: 500, color: p.online ? undefined : 'var(--ameta)' }}>{p.name}</span>
            <span className="app-tnum" style={{ marginLeft: 'auto', color: 'var(--ameta)' }}>{p.online ? `${p.jobs24h.toLocaleString('en-US')} jobs` : 'Offline'}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, minHeight: 26, fontSize: 12, color: 'var(--ameta)' }}>
          <span style={{ width: 13 }} />
          {online} of {MOCK_PROVIDERS.length} providers online
        </div>
      </div>
    </section>
  );
}

function TodayCard() {
  const { data: jobs } = useJobs();
  const { data: allocation } = useAllocation();
  const { data: week } = useWeekUsage();
  const jobCount = jobs?.length ?? 24;
  const credits = allocation?.used ?? 653;
  const avgSec = jobs?.length ? Math.round(jobs.reduce((sum, j) => sum + j.durationSec, 0) / jobs.length) : 214;
  const avg = `${Math.floor(avgSec / 60)}m ${String(avgSec % 60).padStart(2, '0')}s`;
  const weekValues = (week ?? []).map((d) => d.used);

  const rows: Array<[string, string]> = [
    ['Jobs today', jobCount.toLocaleString('en-US')],
    ['Credits consumed', `${credits.toLocaleString('en-US')} CR`],
    ['Avg job duration', avg],
  ];
  return (
    <section className="app-panel" data-testid="card-today">
      <header className="app-panel-head">
        <span className="app-panel-title">Today</span>
        <span className="app-meta">UTC</span>
      </header>
      <div className="app-panel-body" style={{ paddingTop: 8, paddingBottom: 12 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', minHeight: 34, borderBottom: '1px solid var(--ahair)' }}>
            <span className="app-meta">{label}</span>
            <b style={{ font: '600 15px var(--afont)', letterSpacing: '-.01em', fontVariantNumeric: 'tabular-nums' }}>{value}</b>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', marginTop: 12, gap: 10 }}>
          <span className="app-meta">Last 7 days</span>
          {weekValues.length === 7 ? <MiniBars values={weekValues} height={38} barWidth={11} gap={6} /> : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ chart ------------------------------- */

function UsageChart() {
  const [range, setRange] = useState<'24H' | '7D'>('24H');
  const hourly = useHourlyUsage();
  const weekly = useWeekUsage();
  const ink = useChartInk();

  const points = range === '24H'
    ? (hourly.data ?? [])
    : (weekly.data ?? []).map((d) => ({ hour: d.date.slice(5).replace('-', '/'), credits: d.used }));
  const total = points.reduce((sum, p) => sum + p.credits, 0);
  const avg = points.length ? Math.round(total / points.length) : 0;

  return (
    <section className="app-panel app-enter app-enter-d2" data-testid="card-usage-chart">
      <header className="app-panel-head">
        <span className="app-panel-title">Usage</span>
        <span className="app-segment" role="tablist" aria-label="Chart range">
          {(['24H', '7D'] as const).map((r) => (
            <button key={r} role="tab" aria-selected={range === r} className={range === r ? 'is-on' : undefined} onClick={() => setRange(r)}>
              {r === '24H' ? '24H' : '7D'}
            </button>
          ))}
        </span>
      </header>
      <div className="app-panel-body" style={{ padding: '16px 10px 8px' }}>
        <div style={{ height: 240 }} data-testid="chart-usage">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 4, right: 10, left: -16, bottom: 0 }} barCategoryGap={range === '24H' ? '30%' : '38%'}>
              <CartesianGrid vertical={false} stroke={ink.line} strokeOpacity={0.55} strokeDasharray="1 0" />
              <XAxis dataKey="hour" tick={{ fontSize: 10.5, fill: ink.meta, fontFamily: 'Inter, sans-serif' }} tickLine={false} axisLine={false} interval={range === '24H' ? 3 : 0} dy={6} />
              <YAxis tick={{ fontSize: 10.5, fill: ink.meta, fontFamily: 'Inter, sans-serif' }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: ink.blue, opacity: 0.1 }}
                contentStyle={{ background: 'var(--apanel)', border: '1px solid var(--aline)', borderRadius: 8, font: '500 12px Inter, sans-serif', color: 'var(--aink)', boxShadow: '0 4px 14px rgba(16,24,40,.08)' }}
                labelStyle={{ color: 'var(--ameta)', fontSize: 11, marginBottom: 2 }}
                formatter={(value) => [`${value} CR`, 'Usage']}
              />
              <Bar dataKey="credits" fill={ink.ink} radius={[4, 4, 0, 0]} isAnimationActive animationDuration={380} animationEasing="ease-out" maxBarSize={range === '24H' ? 22 : 34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <footer className="app-panel-foot">
        <span>Total {total.toLocaleString('en-US')} CR</span>
        <span>Avg {avg.toLocaleString('en-US')} CR / {range === '24H' ? 'hour' : 'day'}</span>
      </footer>
    </section>
  );
}

/* --------------------------- recent jobs ---------------------------- */

function RecentJobs() {
  const { data: jobs } = useJobs(5000);
  const feed = (jobs ?? []).slice(0, 5);

  // Track ids already shown so the enter animation only plays for arrivals
  // after the first paint.
  const seenRef = useRef<Set<string> | null>(null);
  if (seenRef.current === null && feed.length > 0) {
    seenRef.current = new Set(feed.map((job) => job.id));
  }
  const seen = seenRef.current ?? new Set<string>();

  useEffect(() => {
    if (seenRef.current === null) seenRef.current = new Set();
    const current = seenRef.current;
    feed.forEach((job) => current.add(job.id));
  }, [feed]);

  return (
    <section className="app-panel app-enter app-enter-d3" data-testid="card-recent-jobs">
      <header className="app-panel-head">
        <span className="app-panel-title">Recent jobs</span>
        <span className="app-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span className="app-led sim-led app-led-blue" />
          Live feed
        </span>
      </header>
      <div className="table-wrap">
        <table className="data-table" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th>Job</th>
              <th>GPU</th>
              <th style={{ textAlign: 'right' }}>Credits</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Started</th>
            </tr>
          </thead>
          <tbody>
            {feed.map((job) => (
              <tr key={job.id} className={seen.has(job.id) ? undefined : 'app-row-enter'}>
                <td>
                  <div className="app-tjob-id">{job.id.slice(0, 12)}</div>
                  <div className="app-tjob-model" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><ModelMark model={job.model} size={13} />{MODEL_LABELS[job.model]}</div>
                </td>
                <td style={{ fontWeight: 500 }}>{job.gpu}</td>
                <td className="app-tnum" style={{ textAlign: 'right' }}>{job.credits.toFixed(1)}</td>
                <td><StatusPill status={job.status} /></td>
                <td className="app-meta" style={{ textAlign: 'right' }}><RelativeTime ts={job.startedAt} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------ page -------------------------------- */

export default function Overview() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <OverviewHeader />
      <AllocationHero />
      <div className="app-enter app-enter-d1" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <ResetCard />
        <NetworkCard />
        <TodayCard />
      </div>
      <UsageChart />
      <RecentJobs />
    </div>
  );
}
