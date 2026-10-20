import type { CSSProperties } from 'react';
import type { ModelId, Provider } from '../mock/data';

/* ------------------------------------------------------------------ */
/* Brand marks — official logos where available, monogram fallback     */
/* ------------------------------------------------------------------ */

const PROVIDER_LOGOS: Record<string, string> = {
  Golem: '/brands/golem.svg',
};

const PROVIDER_INITIALS: Record<string, string> = {
  CoreWeave: 'CW',
  Lambda: 'L',
  Nebius: 'N',
  Crusoe: 'C',
};

export function ProviderMark({ name, size = 22 }: { name: string; size?: number }) {
  const logo = PROVIDER_LOGOS[name];
  if (logo) {
    return (
      <span className="app-mark" style={{ width: size, height: size }}>
        <img src={logo} alt="" aria-hidden="true" style={{ width: '72%', height: '72%', objectFit: 'contain', filter: 'brightness(0)' }} />
      </span>
    );
  }
  const initials = PROVIDER_INITIALS[name];
  return (
    <span className="app-mark" style={{ width: size, height: size, fontSize: size * 0.42, fontWeight: 700, letterSpacing: '-.02em' }} aria-hidden="true">
      {initials ?? '···'}
    </span>
  );
}

const MODEL_LOGOS: Record<ModelId, string | null> = {
  qwen: '/brands/qwen.svg',
  llama: '/brands/meta.svg',
  whisper: '/brands/openai.svg',
  sdxl: null,
};

/** Tokenized asset marks in official brand colors (never monochrome). */
const ASSET_MARKS: Record<string, { color: string; path: string }> = {
  NVDA: {
    color: '#76B900',
    path: 'M8.948 8.798v-1.43a6.7 6.7 0 0 1 .424-.018c3.922-.124 6.493 3.374 6.493 3.374s-2.774 3.851-5.75 3.851c-.398 0-.787-.062-1.158-.185v-4.346c1.528.185 1.837.857 2.747 2.385l2.04-1.714s-1.492-1.952-4-1.952a6.016 6.016 0 0 0-.796.035m0-4.735v2.138l.424-.027c5.45-.185 9.01 4.47 9.01 4.47s-4.08 4.964-8.33 4.964c-.37 0-.733-.035-1.095-.097v1.325c.3.035.61.062.91.062 3.957 0 6.82-2.023 9.593-4.408.459.371 2.34 1.263 2.73 1.652-2.633 2.208-8.772 3.984-12.253 3.984-.335 0-.653-.018-.971-.053v1.864H24V4.063zm0 10.326v1.131c-3.657-.654-4.673-4.46-4.673-4.46s1.758-1.944 4.673-2.262v1.237H8.94c-1.528-.186-2.73 1.245-2.73 1.245s.68 2.412 2.739 3.11M2.456 10.9s2.164-3.197 6.5-3.533V6.201C4.153 6.59 0 10.653 0 10.653s2.35 6.802 8.948 7.42v-1.237c-4.84-.6-6.492-5.936-6.492-5.936z',
  },
};

export function AssetMark({ asset, size = 15 }: { asset: string; size?: number }) {
  const mark = ASSET_MARKS[asset];
  if (!mark) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={`${asset} tokenized asset`} style={{ flex: '0 0 auto', verticalAlign: '-2px' }}>
      <path d={mark.path} fill={mark.color} />
    </svg>
  );
}

export function ModelMark({ model, size = 16 }: { model: ModelId; size?: number }) {
  const logo = MODEL_LOGOS[model];
  if (logo) {
    return <img className="app-model-mark" src={logo} alt="" aria-hidden="true" width={size} height={size} style={{ width: size, height: size, objectFit: 'contain' }} />;
  }
  return (
    <span className="app-mark" style={{ width: size, height: size, fontSize: size * 0.44, fontWeight: 700 }} aria-hidden="true">
      SD
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Flat 2D technical illustrations — one visual system                 */
/* ------------------------------------------------------------------ */

const INK = '#202329';
const MID = '#7d8791';
const LINE = '#c9cfd6';
const PANEL = '#f4f6f8';
const BLUE = '#4489e5';
const BLUE_SOFT = '#a8c9ee';
const NVDA_GREEN = '#76B900';

function Fans({ cx, cy, r, dark = false, reverse = false }: { cx: number; cy: number; r: number; dark?: boolean; reverse?: boolean }) {
  const bladeFill = dark ? '#e8ecf0' : INK;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={dark ? '#2b3038' : PANEL} stroke={dark ? '#4a525c' : LINE} strokeWidth="1.4" />
      <g className={`sim-fan${reverse ? ' sim-fan-rev' : ''}`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = (i * 360) / 7;
          return <path key={i} d={`M${cx} ${cy} q ${r * 0.14} ${-r * 0.52} ${r * 0.4} ${-r * 0.6} q ${r * 0.06} ${r * 0.28} ${-r * 0.4} ${r * 0.6} Z`} fill={bladeFill} opacity="0.85" transform={`rotate(${a} ${cx} ${cy})`} />;
        })}
        <circle cx={cx} cy={cy} r={r * 0.18} fill={dark ? '#17191d' : '#fff'} stroke={BLUE} strokeWidth="1.2" />
      </g>
    </g>
  );
}

export function GpuCardArt({ dark = false }: { dark?: boolean }) {
  const body = dark ? '#2b3038' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const text = dark ? '#8f99a4' : MID;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="GPU accelerator" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="14" y="24" width="8" height="66" rx="1.5" fill={dark ? '#4a525c' : MID} />
      <rect x="22" y="32" width="176" height="58" rx="5" fill={body} stroke={edge} strokeWidth="1.4" />
      <rect x="22" y="32" width="176" height="15" rx="5" fill={dark ? '#23272e' : '#e8ecf0'} />
      <text x="32" y="42.5" fontSize="6.5" fontFamily="var(--app-font-mono), monospace" letterSpacing="1" fill={text}>COMPUTE ACCELERATOR</text>
      <rect x="164" y="37" width="26" height="5" rx="2.5" fill={BLUE} className="fb-led" style={{ animationDelay: '.4s' }} />
      <Fans cx={73} cy={69} r={17} dark={dark} />
      <Fans cx={142} cy={69} r={17} dark={dark} reverse />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={34 + i * 8} y={94} width="4" height="12" rx="1" fill={dark ? '#4a525c' : MID} opacity="0.8" />
      ))}
      <rect x="118" y="94" width="60" height="7" rx="1.5" fill={dark ? '#23272e' : '#e8ecf0'} stroke={edge} strokeWidth="1" />
      <circle className="fb-led" cx="192" cy="80" r="2.2" fill={BLUE_SOFT} />
    </svg>
  );
}

export function ServerRackArt() {
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Server rack" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="46" y={18 + i * 30} width="128" height="24" rx="3" fill={PANEL} stroke={LINE} strokeWidth="1.3" />
          {Array.from({ length: 8 }, (_, j) => (
            <line key={j} x1={58 + j * 8} y1={24 + i * 30} x2={58 + j * 8} y2={36 + i * 30} stroke={LINE} strokeWidth="2.4" />
          ))}
          <rect x="126" y={26 + i * 30} width="22" height="4" rx="2" fill={BLUE_SOFT} className="fb-led" style={{ animationDelay: `${i * 0.5}s` }} />
          <circle cx="158" cy={28 + i * 30} r="2.2" fill={BLUE} className="fb-led" style={{ animationDelay: `${0.3 + i * 0.5}s` }} />
          <circle cx="166" cy={28 + i * 30} r="2.2" fill={LINE} />
        </g>
      ))}
      <path className="fb-flow" d="M36 100 H184" fill="none" stroke={LINE} strokeWidth="1.2" style={{ animationDuration: '8s' }} />
      <circle className="fb-signal" r="2" fill={BLUE} style={{ offsetPath: "path('M36 100 H184')", animationDuration: '6s' } as CSSProperties} />
      <circle className="fb-signal" r="2" fill={BLUE} style={{ offsetPath: "path('M36 100 H184')", animationDuration: '6s', animationDelay: '-3s' } as CSSProperties} />
    </svg>
  );
}

export function NodeRingArt({ providers, compact = false, dark = false }: { providers?: Provider[]; compact?: boolean; dark?: boolean }) {
  const cx = 110;
  const cy = compact ? 56 : 60;
  const r = compact ? 38 : 44;
  const nodes = (providers ?? []).slice(0, 6);
  const points = nodes.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
  const link = dark ? '#4a525c' : LINE;
  const linkOff = dark ? '#333b44' : '#e3e6ea';
  const hubFill = dark ? '#f2f4f6' : INK;
  const hubGlyph = dark ? INK : '#fff';
  const nodeFill = dark ? '#23272e' : '#fff';
  const nodeEdge = dark ? '#4a525c' : LINE;
  const markText = dark ? '#f2f4f6' : INK;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Provider topology" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      {points.map(([nx, ny], i) => {
        const on = nodes[i]?.online;
        const d = `M${cx} ${cy} L${nx} ${ny}`;
        return on
          ? <path key={i} className="fb-flow" d={d} fill="none" stroke={link} strokeWidth="1.2" style={{ animationDuration: '9s' }} />
          : <path key={i} d={d} fill="none" stroke={linkOff} strokeWidth="1.2" strokeDasharray="2 5" />;
      })}
      {points.map(([nx, ny], i) =>
        nodes[i]?.online ? (
          <circle key={`s${i}`} className="fb-signal" r="2" fill={BLUE} style={{ offsetPath: `path('M${nx} ${ny} L${cx} ${cy}')`, animationDuration: `${5 + i * 0.5}s`, animationDelay: `${-i * 1.2}s` } as CSSProperties} />
        ) : null,
      )}
      <circle cx={cx} cy={cy} r={compact ? 13 : 15} fill={hubFill} />
      <path d={`M${cx} ${cy + 6} v-10 m0 4 -4 -3 m4 3 4 -3.4 m-4 6.4 -3 -1.6 m3 1.6 3 -2`} stroke={hubGlyph} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={compact ? 13 : 15} fill="none" stroke={BLUE_SOFT} strokeWidth="1.2" className="fb-pulse" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      {points.map(([nx, ny], i) => (
        <g key={`n${i}`} opacity={nodes[i]?.online ? 1 : 0.4}>
          <circle cx={nx} cy={ny} r={compact ? 11 : 12.5} fill={nodeFill} stroke={nodeEdge} strokeWidth="1.2" />
          {nodes[i] && PROVIDER_LOGOS[nodes[i].name] ? (
            <image href={PROVIDER_LOGOS[nodes[i].name]} x={nx - 8} y={ny - 8} width="16" height="16" style={{ filter: dark ? 'brightness(0) invert(1)' : 'brightness(0)' }} />
          ) : (
            <text x={nx} y={ny + 2.6} textAnchor="middle" fontSize="6.8" fontWeight="700" fill={markText} fontFamily="Inter, sans-serif">
              {PROVIDER_INITIALS[nodes[i]?.name ?? ''] ?? '···'}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export function KeyAccessArt({ dark = false }: { dark?: boolean }) {
  const panel = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const head = dark ? '#2b3038' : '#e8ecf0';
  const dot = dark ? '#5b6672' : MID;
  const line1 = dark ? '#9aa5b1' : MID;
  const keyStroke = dark ? '#f2f4f6' : INK;
  const flow = dark ? '#5b6672' : LINE;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Access key and terminal" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="128" y="26" width="72" height="62" rx="4" fill={panel} stroke={edge} strokeWidth="1.4" />
      <rect x="128" y="26" width="72" height="13" rx="4" fill={head} />
      <circle cx="137" cy="32.5" r="1.8" fill={dot} />
      <circle cx="144" cy="32.5" r="1.8" fill={dot} />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="fb-typeline" x="138" y={48 + i * 10} width={i === 2 ? 22 : 44 - i * 8} height="4" rx="2" fill={i === 1 ? BLUE_SOFT : line1} style={{ animationDelay: `${i * 0.8}s` }} />
      ))}
      <circle cx="176" cy="68" r="9" fill="none" stroke={edge} strokeWidth="2" />
      <circle cx="176" cy="68" r="4" fill={keyStroke} />
      <g className="fb-key-slide">
        <circle cx="66" cy="62" r="15" fill="none" stroke={keyStroke} strokeWidth="3" />
        <circle cx="66" cy="62" r="6" fill="none" stroke={BLUE} strokeWidth="2.4" />
        <path d="M79 68l52 22m-10-1-5-6m-4 9-5-6" stroke={keyStroke} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      </g>
      <path className="fb-flow" d="M96 78 C112 84 122 88 134 90" fill="none" stroke={flow} strokeWidth="1.2" style={{ animationDuration: '8s' }} />
    </svg>
  );
}

export function VaultArt({ dark = false }: { dark?: boolean }) {
  const body = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const face = dark ? '#2b3038' : '#fff';
  const spoke = dark ? '#8f99a4' : MID;
  const hub = dark ? '#f2f4f6' : INK;
  const bar = dark ? '#4a525c' : LINE;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Reserve vault" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="62" y="18" width="96" height="88" rx="6" fill={body} stroke={edge} strokeWidth="1.4" />
      <circle cx="110" cy="58" r="30" fill={face} stroke={edge} strokeWidth="1.6" />
      <g className="fb-vault-spin" style={{ transformOrigin: '110px 58px' }}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a} x1="110" y1="58" x2={110 + 24 * Math.cos((a * Math.PI) / 180)} y2={58 + 24 * Math.sin((a * Math.PI) / 180)} stroke={spoke} strokeWidth="2.4" strokeLinecap="round" />
        ))}
        <circle cx="110" cy="58" r="7" fill="none" stroke={hub} strokeWidth="2.4" />
      </g>
      <circle cx="110" cy="58" r="30" fill="none" stroke={BLUE_SOFT} strokeWidth="1.2" strokeDasharray="4 14" className="fb-flow" style={{ animationDuration: '10s' }} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x="168" y={30 + i * 12} width="34" height="4.4" rx="2.2" fill={i === 0 ? BLUE_SOFT : bar} opacity={1 - i * 0.25} />
      ))}
      <rect x="52" y="98" width="116" height="4" rx="2" fill={bar} opacity="0.5" />
    </svg>
  );
}

export function GaugeArt() {
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Pricing gauge" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <path d="M60 92 A50 50 0 0 1 160 92" fill="none" stroke={LINE} strokeWidth="7" strokeLinecap="round" />
      <path d="M60 92 A50 50 0 0 1 118 44" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = Math.PI + (i * Math.PI) / 4;
        return <line key={i} x1={110 + 40 * Math.cos(a)} y1={92 + 40 * Math.sin(a)} x2={110 + 45 * Math.cos(a)} y2={92 + 45 * Math.sin(a)} stroke={MID} strokeWidth="1.6" />;
      })}
      <g className="fb-needle" style={{ transformOrigin: '110px 92px' }}>
        <line x1="110" y1="92" x2="110" y2="54" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <circle cx="110" cy="92" r="4.5" fill={INK} />
      </g>
      <circle cx="146" cy="60" r="2.4" fill={BLUE} className="fb-led" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={70 + i * 28} y="104" width={i === 1 ? 22 : 16} height="4.4" rx="2.2" fill={i === 1 ? BLUE_SOFT : LINE} />
      ))}
    </svg>
  );
}

export function PipelineArt2({ dark = false }: { dark?: boolean }) {
  const station = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const core = dark ? '#f2f4f6' : INK;
  const coreSub = dark ? '#9aa5b1' : LINE;
  const label = dark ? '#8f99a4' : MID;
  const flow = dark ? '#5b6672' : LINE;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Workload pipeline" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      {[40, 110, 180].map((sx, i) => (
        <g key={sx}>
          <rect x={sx - 16} y="52" width="32" height="34" rx="3" fill={i === 1 ? core : station} stroke={i === 1 ? core : edge} strokeWidth="1.3" />
          <rect x={sx - 10} y="58" width="20" height="3.4" rx="1.7" fill={i === 1 ? coreSub : edge} />
          <rect x={sx - 10} y="64" width="14" height="3.4" rx="1.7" fill={i === 1 ? BLUE_SOFT : edge} />
          <circle cx={sx + 8} cy="80" r="2" fill={i === 1 ? BLUE_SOFT : MID} className="fb-led" style={{ animationDelay: `${i * 0.5}s` }} />
        </g>
      ))}
      <path className="fb-flow" d="M24 40 H196" fill="none" stroke={flow} strokeWidth="1.2" style={{ animationDuration: '8s' }} />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="fb-signal" x="-5" y="-4.5" width="10" height="9" rx="1.5" fill={i === 1 ? BLUE : MID} style={{ offsetPath: "path('M24 40 H196')", animationDuration: '7s', animationDelay: `${-i * 2.3}s` } as CSSProperties} />
      ))}
      <text x="40" y="102" textAnchor="middle" fontSize="6" fontFamily="var(--app-font-mono), monospace" letterSpacing="1.2" fill={label}>QUEUE</text>
      <text x="110" y="102" textAnchor="middle" fontSize="6" fontFamily="var(--app-font-mono), monospace" letterSpacing="1.2" fill={label}>EXECUTE</text>
      <text x="180" y="102" textAnchor="middle" fontSize="6" fontFamily="var(--app-font-mono), monospace" letterSpacing="1.2" fill={label}>RESULT</text>
    </svg>
  );
}

export function ControlBoardArt({ dark = false }: { dark?: boolean }) {
  const panel = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const groove = dark ? '#4a525c' : LINE;
  const knob = dark ? '#f2f4f6' : INK;
  const toggleKnob = dark ? '#f2f4f6' : '#fff';
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Control board" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <rect x="56" y="18" width="108" height="86" rx="5" fill={panel} stroke={edge} strokeWidth="1.4" />
      {[34, 56, 78].map((ry, i) => (
        <g key={ry}>
          <line x1="74" y1={ry} x2="146" y2={ry} stroke={groove} strokeWidth="3" strokeLinecap="round" />
          <circle className="fb-knob" cx={86 + i * 18} cy={ry} r="5" fill={i === 1 ? BLUE : knob} style={{ animationDuration: `${6.5 + i * 1.2}s`, animationDelay: `${-i * 2}s` }} />
        </g>
      ))}
      {[0, 1].map((i) => (
        <g key={i} className={i === 0 ? 'fb-toggle-a' : 'fb-toggle-b'}>
          <rect x={168} y={30 + i * 20} width="16" height="9" rx="4.5" fill={i === 0 ? BLUE_SOFT : groove} />
          <circle cx={i === 0 ? 180 : 172} cy={34.5 + i * 20} r="3" fill={toggleKnob} stroke={MID} strokeWidth="1" />
        </g>
      ))}
      <circle cx="176" cy="88" r="2.2" fill={BLUE} className="fb-led" />
    </svg>
  );
}

export function PlaygroundArt({ dark = false }: { dark?: boolean }) {
  const panel = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const head = dark ? '#2b3038' : '#e8ecf0';
  const dot = dark ? '#5b6672' : MID;
  const bubble = dark ? '#2b3038' : '#fff';
  const line = dark ? '#8f99a4' : MID;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Prompt playground" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <g className="fb-float" style={{ animationDuration: '5s' }}>
        <rect x="18" y="22" width="78" height="28" rx="8" fill={bubble} stroke={edge} strokeWidth="1.3" />
        <rect className="fb-typeline" x="27" y="32" width="50" height="4" rx="2" fill={line} />
        <rect className="fb-typeline" x="27" y="40" width="32" height="4" rx="2" fill={BLUE_SOFT} style={{ animationDelay: '.7s' }} />
      </g>
      <g className="fb-float" style={{ animationDuration: '5.6s', animationDelay: '-2.4s' }}>
        <rect x="46" y="62" width="86" height="30" rx="8" fill={panel} stroke={edge} strokeWidth="1.3" />
        <rect className="fb-typeline" x="55" y="72" width="60" height="4" rx="2" fill={BLUE_SOFT} style={{ animationDelay: '1.1s' }} />
        <rect className="fb-typeline" x="55" y="80" width="40" height="4" rx="2" fill={line} style={{ animationDelay: '1.9s' }} />
      </g>
      <rect x="148" y="20" width="56" height="78" rx="5" fill={panel} stroke={edge} strokeWidth="1.4" />
      <rect x="148" y="20" width="56" height="13" rx="5" fill={head} />
      <circle cx="156" cy="26.5" r="1.7" fill={dot} />
      <circle cx="162.5" cy="26.5" r="1.7" fill={dot} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} className="fb-typeline" x="156" y={42 + i * 11} width={i === 2 ? 20 : 36 - i * 5} height="4" rx="2" fill={i === 2 ? BLUE : line} style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      <rect x="156" y="88" width="5" height="7" fill={BLUE} className="fb-led" />
      <text x="166" y="94" fontSize="6" fontFamily="var(--app-font-mono), monospace" letterSpacing="1" fill={line}>READY</text>
      <path className="fb-flow" d="M100 36 C118 36 130 40 144 44" fill="none" stroke={edge} strokeWidth="1.1" style={{ animationDuration: '7s' }} />
      <circle className="fb-signal" r="2" fill={BLUE} style={{ offsetPath: "path('M100 36 C118 36 130 40 144 44')", animationDuration: '4.5s' } as CSSProperties} />
    </svg>
  );
}

export function StakingArt({ dark = false }: { dark?: boolean }) {
  const panel = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const body = dark ? '#2b3038' : '#fff';
  const glyph = dark ? '#8f99a4' : MID;
  const inkStroke = dark ? '#f2f4f6' : INK;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Staking vault" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <g className="fb-float" style={{ animationDuration: '5.4s' }}>
        <rect x="56" y="46" width="76" height="56" rx="7" fill={body} stroke={edge} strokeWidth="1.5" />
        <path d="M72 46 v-8 a22 22 0 0 1 44 0 v8" fill="none" stroke={inkStroke} strokeWidth="4" strokeLinecap="round" />
        <circle cx="94" cy="72" r="8" fill="none" stroke={NVDA_GREEN} strokeWidth="3" />
        <path d="M94 76 v10" stroke={NVDA_GREEN} strokeWidth="3.4" strokeLinecap="round" />
      </g>
      <circle cx="94" cy="74" r="30" fill="none" stroke={NVDA_GREEN} strokeWidth="1.2" strokeDasharray="4 12" className="fb-flow" style={{ animationDuration: '9s' }} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={1 - i * 0.22}>
          <rect x={148} y={34 + i * 22} width="46" height="15" rx="3" fill={panel} stroke={edge} strokeWidth="1.2" />
          <rect className="fb-typeline" x={155} y={39 + i * 22} width={i === 0 ? 30 : 22 - i * 4} height="4.4" rx="2.2" fill={i === 0 ? NVDA_GREEN : glyph} style={{ animationDelay: `${i * 0.6}s` }} />
        </g>
      ))}
      <path className="fb-flow" d="M30 88 H52" fill="none" stroke={edge} strokeWidth="1.1" style={{ animationDuration: '7s' }} />
      <circle className="fb-signal" r="2" fill={NVDA_GREEN} style={{ offsetPath: "path('M30 88 H52')", animationDuration: '4s' } as CSSProperties} />
      <text x="30" y="102" fontSize="6" fontFamily="var(--app-font-mono), monospace" letterSpacing="1.2" fill={glyph}>STAKE → ALLOCATE</text>
      <circle cx="140" cy="96" r="2.2" fill={NVDA_GREEN} className="fb-led" style={{ animationDelay: '.5s' }} />
    </svg>
  );
}

export function ImagesArt({ dark = false }: { dark?: boolean }) {
  const panel = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const frame = dark ? '#2b3038' : '#fff';
  const glyph = dark ? '#8f99a4' : MID;
  const inkStroke = dark ? '#f2f4f6' : INK;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Image generation" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <g className="fb-float" style={{ animationDuration: '5.2s' }}>
        <rect x="26" y="20" width="88" height="66" rx="5" fill={frame} stroke={edge} strokeWidth="1.4" />
        <rect x="26" y="20" width="88" height="66" rx="5" fill="none" stroke={edge} strokeWidth="1.4" />
        <circle cx="46" cy="38" r="6" fill={BLUE_SOFT} className="fb-led" style={{ animationDelay: '.5s' }} />
        <path d="M34 74 L56 52 L70 64 L84 46 L106 74 Z" fill={panel} stroke={glyph} strokeWidth="1.3" strokeLinejoin="round" />
      </g>
      <g className="fb-vault-spin" style={{ transformOrigin: '158px 44px', animationDuration: '18s' }}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <line key={a} x1={158 + 10 * Math.cos((a * Math.PI) / 180)} y1={44 + 10 * Math.sin((a * Math.PI) / 180)} x2={158 + 17 * Math.cos((a * Math.PI) / 180)} y2={44 + 17 * Math.sin((a * Math.PI) / 180)} stroke={a % 120 === 0 ? BLUE : glyph} strokeWidth="2" strokeLinecap="round" />
        ))}
        <circle cx="158" cy="44" r="4.5" fill="none" stroke={inkStroke} strokeWidth="2" />
      </g>
      <rect x="130" y="72" width="66" height="26" rx="4" fill={panel} stroke={edge} strokeWidth="1.3" />
      {[0, 1, 2].map((i) => (
        <rect key={i} className="fb-typeline" x="138" y={79 + i * 6} width={i === 1 ? 34 : 48 - i * 10} height="3.4" rx="1.7" fill={i === 0 ? BLUE_SOFT : glyph} style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <path className="fb-flow" d="M118 60 C130 56 138 52 144 48" fill="none" stroke={edge} strokeWidth="1.1" style={{ animationDuration: '7s' }} />
      <circle className="fb-signal" r="2" fill={BLUE} style={{ offsetPath: "path('M118 60 C130 56 138 52 144 48')", animationDuration: '4s' } as CSSProperties} />
    </svg>
  );
}

export function WorkloadsArt({ dark = false }: { dark?: boolean }) {
  const panel = dark ? '#23272e' : PANEL;
  const edge = dark ? '#4a525c' : LINE;
  const bar = dark ? '#8f99a4' : LINE;
  const barInk = dark ? '#f2f4f6' : INK;
  const label = dark ? '#8f99a4' : MID;
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Model workloads" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      {[0, 1, 2].map((row) => (
        <g key={row} opacity={1 - row * 0.18}>
          <rect x="34" y={26 + row * 24} width="118" height="17" rx="3" fill={panel} stroke={edge} strokeWidth="1.2" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} className="fb-typeline" x={42 + i * 13} y={32 + row * 24} width="8" height="5" rx="1.5" fill={i % 3 === row % 3 ? BLUE_SOFT : bar} style={{ animationDelay: `${(row * 8 + i) * 0.22}s` }} />
          ))}
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={164 + (i % 2) * 16} y={34 + Math.floor(i / 2) * 16} width="11" height="11" rx="2" fill={i === 1 ? BLUE : panel} stroke={edge} strokeWidth="1.1" className={i === 1 ? 'fb-led' : undefined} />
      ))}
      <path className="fb-flow" d="M40 98 H180" fill="none" stroke={edge} strokeWidth="1.1" style={{ animationDuration: '8s' }} />
      <circle className="fb-signal" r="2" fill={BLUE} style={{ offsetPath: "path('M40 98 H180')", animationDuration: '5.5s' } as CSSProperties} />
      <rect x="40" y="88" width="26" height="6" rx="2" fill={barInk} opacity="0.85" />
      <rect x="72" y="88" width="14" height="6" rx="2" fill={BLUE} className="fb-led" style={{ animationDelay: '.8s' }} />
      <text x="176" y="112" textAnchor="end" fontSize="6" fontFamily="var(--app-font-mono), monospace" letterSpacing="1.2" fill={label}>VECTORS</text>
    </svg>
  );
}

export function AcquisitionArt() {
  return (
    <svg viewBox="0 0 220 120" role="img" aria-label="Compute acquisition" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
      <circle cx="56" cy="58" r="20" fill={PANEL} stroke={LINE} strokeWidth="1.4" />
      <text x="56" y="63" textAnchor="middle" fontSize="13" fontWeight="700" fill={INK} fontFamily="Inter, sans-serif">$</text>
      <path className="fb-flow" d="M84 58 H132" fill="none" stroke={LINE} strokeWidth="1.3" style={{ animationDuration: '7s' }} />
      <circle className="fb-signal" r="2.2" fill={BLUE} style={{ offsetPath: "path('M84 58 H132')", animationDuration: '4.5s' } as CSSProperties} />
      <path d="M132 52l10 6-10 6" fill="none" stroke={MID} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="146" y="38" width="50" height="40" rx="4" fill={PANEL} stroke={LINE} strokeWidth="1.4" />
      <Fans cx={171} cy={58} r={12} />
      <circle cx="188" cy="44" r="2" fill={BLUE} className="fb-led" style={{ animationDelay: '.6s' }} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Banner compositions per feature (flat 2D, explicit metaphors)       */
/* ------------------------------------------------------------------ */

export const BANNER_ART_V2 = {
  overview: () => <GpuCardArt />,
  compute: () => <GpuCardArt />,
  jobs: () => <PipelineArt2 />,
  keys: () => <KeyAccessArt />,
  network: ({ providers }: { providers?: Provider[] }) => <NodeRingArt providers={providers} />,
  treasury: () => <VaultArt />,
  settings: () => <ControlBoardArt />,
} as const;

export type BannerFeatureV2 = keyof typeof BANNER_ART_V2;
