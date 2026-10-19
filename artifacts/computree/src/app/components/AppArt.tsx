import type { JobStatus } from '../mock/data';

/* ------------------------------------------------------------------ */
/* Status glyphs — animated, meaningful (utility layer)                */
/* ------------------------------------------------------------------ */

export function StatusGlyph({ status, size = 12 }: { status: JobStatus | 'online' | 'offline'; size?: number }) {
  if (status === 'running') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="4.6" fill="none" stroke="#bcd4f0" strokeWidth="1.6" />
        <path className="app-glyph-spin" d="M6 1.4a4.6 4.6 0 0 1 3.9 2.2" fill="none" stroke="#3470b4" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'completed' || status === 'online') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="4.6" fill="#e9f4eb" stroke="#347747" strokeWidth="1" />
        <path className="app-glyph-draw" d="M3.7 6.2 5.4 7.8 8.3 4.4" fill="none" stroke="#347747" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === 'failed') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
        <circle cx="6" cy="6" r="4.6" fill="#fdeaea" stroke="#c0392b" strokeWidth="1" />
        <path d="M4.2 4.2 7.8 7.8 M7.8 4.2 4.2 7.8" stroke="#c0392b" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (status === 'queued') {
    return (
      <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
        {[3, 6, 9].map((cx, i) => (
          <circle key={cx} cx={cx} cy="6" r="1.2" fill="#65717d" className="fb-led" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <rect x="2.6" y="2.6" width="6.8" height="6.8" rx="1" fill="none" stroke="#98a1a9" strokeWidth="1.2" />
      <line x1="4" y1="8.6" x2="8.6" y2="4" stroke="#98a1a9" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Geometric icon set (stroke 1.6, viewBox 24) — small UI utility only */
/* ------------------------------------------------------------------ */

const ICONS = {
  compute: <><rect x="5" y="5" width="14" height="14" rx="1.5" /><rect x="9" y="9" width="6" height="6" rx="1" /><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" /></>,
  jobs: <><path d="M8 6h12M8 12h12M8 18h12" /><path d="m3 5.5 1.2 1.2L6.5 4.5M3 11.5l1.2 1.2 2.3-2.2M3 17.5l1.2 1.2 2.3-2.2" /></>,
  keys: <><circle cx="8" cy="9" r="4.5" /><path d="M11.2 12.2 20 21m-3.5-.5 2.5-2.5m-5 0L16.5 15" /></>,
  network: <><circle cx="12" cy="12" r="2.6" /><circle cx="4.5" cy="5.5" r="1.6" /><circle cx="19.5" cy="5.5" r="1.6" /><circle cx="4.5" cy="18.5" r="1.6" /><circle cx="19.5" cy="18.5" r="1.6" /><path d="m10 10.5-4-3.4m8 3.4 4-3.4M10 13.5l-4 3.4m8-3.4 4 3.4" /></>,
  treasury: <><path d="M3 9.5 12 4l9 5.5M5 10v8m4.5-8v8m5-8v8M19 10v8M3 21h18" /></>,
  settings: <><path d="M4 7h10m4 0h2M4 12h2m4 0h10M4 17h10m4 0h2" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="16" cy="17" r="2" /></>,
  allocation: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5V12l6 6" /></>,
  reset: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.2 2" /></>,
  usage: <><path d="M4 20V10m5.5 10V4M15 20v-8m5 8v-5" /></>,
  provider: <><rect x="3.5" y="4" width="17" height="6.5" rx="1.5" /><rect x="3.5" y="13.5" width="17" height="6.5" rx="1.5" /><path d="M7 7.2h.01M7 16.7h.01" /></>,
} as const;

export type AppIconName = keyof typeof ICONS;

export function AppIcon({ name, size = 15 }: { name: AppIconName; size?: number }) {
  return (
    <svg className="app-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Reset clock — synchronized with the real countdown                  */
/* ------------------------------------------------------------------ */

export function ResetClock({ elapsed, now, size = 84 }: { elapsed: number; now: number; size?: number }) {
  const fraction = Math.min(1, Math.max(0, elapsed));
  const r = 34;
  const c = 2 * Math.PI * r;
  const seconds = Math.floor(now / 1000) % 60;
  const secondAngle = seconds * 6;
  const minuteAngle = ((Math.floor(now / 60000) % 60) + seconds / 60) * 6;
  return (
    <svg width={size} height={size} viewBox="0 0 84 84" role="img" aria-label={`Allocation cycle progress ${(fraction * 100).toFixed(0)} percent`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#e3e6ea" strokeWidth="5" />
      <circle
        cx="42" cy="42" r={r} fill="none" stroke="#17191d" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - fraction)} transform="rotate(-90 42 42)"
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <circle
        cx={42 + r * Math.cos((fraction * 360 - 90) * (Math.PI / 180))}
        cy={42 + r * Math.sin((fraction * 360 - 90) * (Math.PI / 180))}
        r="3" fill="#a8c9ee" style={{ transition: 'cx 1s linear, cy 1s linear' }}
      />
      {[0, 90, 180, 270].map((angle) => (
        <line
          key={angle}
          x1={42 + 27 * Math.cos((angle * Math.PI) / 180)} y1={42 + 27 * Math.sin((angle * Math.PI) / 180)}
          x2={42 + 30 * Math.cos((angle * Math.PI) / 180)} y2={42 + 30 * Math.sin((angle * Math.PI) / 180)}
          stroke="#c3cbd3" strokeWidth="1.6" strokeLinecap="round"
        />
      ))}
      <line x1="42" y1="42" x2="42" y2="22" stroke="#17191d" strokeWidth="2.4" strokeLinecap="round" transform={`rotate(${minuteAngle} 42 42)`} />
      <line x1="42" y1="42" x2="42" y2="17" stroke="#65717d" strokeWidth="1.4" strokeLinecap="round" transform={`rotate(${secondAngle} 42 42)`} />
      <circle cx="42" cy="42" r="2.6" fill="#17191d" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Mini bars — actual data, entrance animation only                    */
/* ------------------------------------------------------------------ */

export function MiniBars({ values, height = 44, barWidth = 12, gap = 7 }: { values: number[]; height?: number; barWidth?: number; gap?: number }) {
  const max = Math.max(...values, 1);
  const width = values.length * (barWidth + gap) - gap;
  return (
    <svg width={width} height={height + 4} viewBox={`0 0 ${width} ${height + 4}`} role="img" aria-label="7-day usage" style={{ display: 'block' }}>
      {values.map((v, i) => {
        const h = Math.max(3, (v / max) * height);
        return (
          <rect
            key={i}
            className="app-bar-in"
            x={i * (barWidth + gap)}
            y={height - h}
            width={barWidth}
            height={h}
            rx="2"
            fill={i === values.length - 1 ? '#17191d' : '#cdd4db'}
            style={{ animationDelay: `${i * 0.07}s` }}
          />
        );
      })}
      <line x1="0" y1={height + 2} x2={width} y2={height + 2} stroke="#e3e6ea" strokeWidth="1" />
    </svg>
  );
}
