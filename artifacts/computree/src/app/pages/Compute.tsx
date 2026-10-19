import type { ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CountUp } from '../components/CountUp';
import { StatusGlyph } from '../components/AppArt';
import { GaugeArt, GpuCardArt, ServerRackArt } from '../components/AppVisuals';
import { FeatureBanner } from '../components/FeatureBanner';
import { Panel } from '../components/StatusPill';
import { useChartInk } from '../components/useIsDark';
import { useAllocation, useHourlyUsage, useWeekUsage } from '../mock/hooks';

function currentCycleStep(): number {
  const now = Date.now();
  const dayStart = Math.floor(now / 86400000) * 86400000;
  const elapsed = now - dayStart;
  const remaining = 86400000 - elapsed;
  if (elapsed < 10 * 60000) return 0;
  if (remaining < 10 * 60000) return 3;
  return 1;
}

function Stat({ label, value, suffix, visual }: { label: string; value: number; suffix?: string; visual?: ReactNode }) {
  return (
    <div className="app-panel app-panel-body" style={{ position: 'relative', overflow: 'hidden' }}>
      {visual ? <div className="app-card-visual" aria-hidden="true">{visual}</div> : null}
      <div className="app-meta">{label}</div>
      <div className="app-big" style={{ marginTop: 10, position: 'relative' }} data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}>
        <CountUp value={value} format={(n) => Math.round(n).toLocaleString('en-US')} />
        {suffix ? <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ameta)', marginLeft: 5 }}>{suffix}</span> : null}
      </div>
    </div>
  );
}

function CycleTimeline() {
  const current = currentCycleStep();
  const steps = ['Allocation', 'Usage', '24h', 'Refresh', 'New allocation'];
  return (
    <Panel title="24h cycle" right={<span className="app-meta">UTC</span>} bodyStyle={{ padding: '6px 16px' }}>
      {steps.map((step, index) => (
        <div key={step} className={`app-cycle-step${index === current ? ' is-current' : ''}`}>
          <span className="app-cycle-index">0{index + 1}</span>
          <span>{step}</span>
          <span className="app-meta" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: index === current ? 'var(--blue)' : undefined }}>
            {index === current ? <><StatusGlyph status="running" size={11} /> Current</> : index < current ? <StatusGlyph status="completed" size={11} /> : ''}
          </span>
        </div>
      ))}
    </Panel>
  );
}

function HourlyChart() {
  const { data } = useHourlyUsage();
  const ink = useChartInk();
  return (
    <Panel title="Hourly consumption" right={<span className="app-meta">Credits · last 24h</span>} bodyStyle={{ padding: '14px 8px 8px' }}>
      <div style={{ height: 240 }} data-testid="chart-hourly">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data ?? []} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={ink.line} strokeOpacity={0.55} />
            <XAxis dataKey="hour" tick={{ fontSize: 10.5, fill: ink.meta, fontFamily: 'Inter, sans-serif' }} tickLine={false} axisLine={false} interval={3} dy={6} />
            <YAxis tick={{ fontSize: 10.5, fill: ink.meta, fontFamily: 'Inter, sans-serif' }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ stroke: ink.blue, strokeWidth: 1 }}
              contentStyle={{ background: 'var(--apanel)', border: '1px solid var(--aline)', borderRadius: 8, font: '500 12px Inter, sans-serif', color: 'var(--aink)', boxShadow: '0 4px 14px rgba(16,24,40,.08)' }}
              labelStyle={{ color: 'var(--ameta)', fontSize: 11, marginBottom: 2 }}
              formatter={(value) => [`${value} CR`, 'Usage']}
            />
            <Area type="stepAfter" dataKey="credits" stroke={ink.ink} strokeWidth={1.5} fill={ink.ink} fillOpacity={0.1} isAnimationActive animationDuration={380} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function WeekHistory() {
  const { data } = useWeekUsage();
  return (
    <Panel title="7-day history" right={<span className="app-meta">Daily allocation cycles</span>} flush>
      <div className="table-wrap">
        <table className="data-table" style={{ minWidth: 480 }}>
          <thead>
            <tr>
              <th>DATE</th>
              <th>USED</th>
              <th>TOTAL</th>
              <th style={{ width: '34%' }}>UTILIZATION</th>
              <th style={{ textAlign: 'right' }}>PCT</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).slice().reverse().map((day) => {
              const pct = Math.round((day.used / day.total) * 100);
              return (
                <tr key={day.date}>
                  <td className="mono" style={{ fontSize: 10 }}>{day.date}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{day.used.toLocaleString('en-US')} CR</td>
                  <td className="mono" style={{ fontSize: 10, color: 'var(--ameta)' }}>{day.total.toLocaleString('en-US')} CR</td>
                  <td>
                    <div className="app-progress app-progress-thin"><i style={{ width: `${pct}%` }} /></div>
                  </td>
                  <td className="mono" style={{ textAlign: 'right', fontSize: 10 }}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default function Compute() {
  const { data } = useAllocation();
  const used = data?.used ?? 653;
  const total = data?.total ?? 1000;

  return (
    <div>
      <FeatureBanner feature="compute" title="Compute" meta="Daily allocation · refreshes every 24h" />
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 14 }}>
        <Stat label="Used today" value={used} suffix="CR" visual={<GaugeArt />} />
        <Stat label="Remaining" value={total - used} suffix="CR" visual={<GpuCardArt />} />
        <Stat label="Total allocation" value={total} suffix="CR" visual={<ServerRackArt />} />
      </div>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginBottom: 14 }}>
        <CycleTimeline />
        <HourlyChart />
      </div>
      <WeekHistory />
    </div>
  );
}
