import { useEffect, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Hero — tree with GPU fruits and ecosystem brand badges              */
/* ------------------------------------------------------------------ */

type FruitSpot = { x: number; y: number; size: number; tilt: number; dur: number; delay: number };

const TREE_BRANDS: Array<FruitSpot & { src: string; name: string }> = [
  { src: '/brands/nvidia.svg', name: 'NVIDIA', x: 50, y: 13, size: 46, tilt: -4, dur: 6.2, delay: 0 },
  { src: '/brands/golem.svg', name: 'Golem', x: 26, y: 15, size: 40, tilt: 6, dur: 5.4, delay: 0.6 },
  { src: '/brands/qwen.svg', name: 'Qwen', x: 75, y: 15, size: 42, tilt: 5, dur: 5.8, delay: 1.2 },
  { src: '/brands/ollama.svg', name: 'Ollama', x: 15, y: 25, size: 38, tilt: -7, dur: 5.1, delay: 0.3 },
  { src: '/brands/open-webui.svg', name: 'Open WebUI', x: 85, y: 29, size: 40, tilt: 8, dur: 6.6, delay: 0.9 },
  { src: '/brands/librechat.svg', name: 'LibreChat', x: 29, y: 33, size: 38, tilt: -5, dur: 5.5, delay: 1.6 },
];

const TREE_GPUS: Array<FruitSpot & { reverse?: boolean }> = [
  { x: 40, y: 18, size: 58, tilt: -9, dur: 5.9, delay: 0.4 },
  { x: 63, y: 24, size: 50, tilt: 7, dur: 6.4, delay: 1.1, reverse: true },
  { x: 82, y: 17, size: 44, tilt: 12, dur: 5.2, delay: 0.8 },
  { x: 19, y: 41, size: 48, tilt: -12, dur: 6.1, delay: 1.5, reverse: true },
  { x: 47, y: 31, size: 54, tilt: 4, dur: 5.6, delay: 0.2 },
  { x: 68, y: 37, size: 42, tilt: -6, dur: 6.8, delay: 1.9, reverse: true },
];

function GpuFruit({ x, y, size, tilt, dur, delay, reverse = false }: FruitSpot & { reverse?: boolean }) {
  const fan = (cx: number, rev: boolean, key: string) => (
    <g key={key} className={`hero-fan${rev ? ' hero-fan-rev' : ''}`}>
      <circle cx={cx} cy="20" r="8.5" fill="#151a21" />
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 72 * Math.PI) / 180;
        return <line key={i} x1={cx} y1="20" x2={cx + 6.5 * Math.cos(angle)} y2={20 + 6.5 * Math.sin(angle)} stroke="#fff" strokeWidth="1.6" />;
      })}
    </g>
  );
  return (
    <div className="hero-fruit" style={{ left: `${x}%`, top: `${y}%`, width: size, transform: `translate(-50%,-50%) rotate(${tilt}deg)` }}>
      <div className="hero-fruit-bob" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <svg className="hero-fruit-gpu" viewBox="0 0 64 46" aria-hidden="true">
          <rect x="3" y="6" width="54" height="28" rx="3" fill="#fff" stroke="#151a21" strokeWidth="2" />
          <rect x="57" y="10" width="4" height="20" fill="#151a21" />
          <rect x="12" y="34" width="24" height="5" fill="#151a21" />
          {fan(21, reverse, 'a')}
          {fan(41, !reverse, 'b')}
        </svg>
      </div>
    </div>
  );
}

function BrandFruit({ src, name, x, y, size, tilt, dur, delay }: FruitSpot & { src: string; name: string }) {
  return (
    <div className="hero-fruit" style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, transform: `translate(-50%,-50%) rotate(${tilt}deg)` }}>
      <div className="hero-fruit-bob" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <span className="hero-fruit-badge"><img src={src} alt={name} draggable={false} /></span>
      </div>
    </div>
  );
}

export function HeroTreeSim() {
  return (
    <div className="hero-tree-stage" role="img" aria-label="Computree tree bearing GPU fruits and ecosystem brand badges">
      <img className="hero-tree-img" src="/hero-tree-vector.svg" alt="" draggable={false} />
      {TREE_GPUS.map((spot, i) => <GpuFruit key={i} {...spot} />)}
      {TREE_BRANDS.map((spot) => <BrandFruit key={spot.name} {...spot} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Problem section — solid server rack with blinking LEDs              */
/* ------------------------------------------------------------------ */

export function ServerRackSim({ className = '' }: { className?: string }) {
  const units = [0, 1, 2, 3];
  return (
    <svg className={`sim-svg ${className}`} viewBox="0 0 420 320" role="img" aria-label="Animated server rack illustration" preserveAspectRatio="xMidYMid meet">
      {units.map((unit) => {
        const y = 36 + unit * 66;
        return (
          <g key={unit}>
            <rect x="52" y={y} width="316" height="54" rx="3" fill="#232c36" stroke="#38434f" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1={70 + i * 12} y1={y + 14} x2={70 + i * 12} y2={y + 40} stroke="#46525f" strokeWidth="3" />
            ))}
            <rect x="228" y={y + 18} width="52" height="18" rx="2" fill="#161c24" stroke="#38434f" />
            <rect x="232" y={y + 26} width="34" height="3" fill="#69a4ee" className="sim-meter" style={{ animationDelay: `${unit * 0.45}s` }} />
            <circle cx="304" cy={y + 20} r="4" fill="#69a4ee" className="sim-led" style={{ animationDelay: `${unit * 0.4}s` }} />
            <circle cx="320" cy={y + 20} r="4" fill="#8ab7ea" className="sim-led" style={{ animationDelay: `${0.7 + unit * 0.4}s` }} />
            <circle cx="336" cy={y + 20} r="4" fill="#3d4a58" className="sim-led" style={{ animationDelay: `${1.1 + unit * 0.4}s` }} />
            <text x="70" y={y + 47} className="sim-svg-mono" fill="#78838f">UNIT 0{unit + 1} · GPU NODE</text>
            <circle cx="352" cy={y + 42} r="7" fill="none" stroke="#46525f" strokeWidth="2" />
            <g className="sim-fan" style={{ transformOrigin: '352px ' + (y + 42) + 'px' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <line key={i} x1="352" y1={y + 42} x2={352 + 6 * Math.cos((i * 72 * Math.PI) / 180)} y2={y + 42 + 6 * Math.sin((i * 72 * Math.PI) / 180)} stroke="#69a4ee" strokeWidth="2" />
              ))}
            </g>
          </g>
        );
      })}
      <line x1="24" y1="30" x2="24" y2="290" stroke="#3d4a58" strokeWidth="1.5" strokeDasharray="3 7" className="flow-line" />
      <line x1="396" y1="290" x2="396" y2="30" stroke="#3d4a58" strokeWidth="1.5" strokeDasharray="3 7" className="flow-line" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Infrastructure — acquisition pipeline with travelling packets       */
/* ------------------------------------------------------------------ */

const PIPE_NODES = ['TREASURY', 'ACQUISITION', 'PROVIDER', 'NVIDIA GPU', 'COMPUTREE', 'USER'];

export function AcquisitionFlowSim() {
  const width = 1000;
  const nodeW = 118;
  const y = 96;
  const centers = PIPE_NODES.map((_, i) => 84 + i * ((width - 168) / (PIPE_NODES.length - 1)));
  return (
    <svg className="sim-svg sim-fill" viewBox={`0 0 ${width} 200`} role="img" aria-label="Animated infrastructure acquisition pipeline" preserveAspectRatio="xMidYMid meet">
      {centers.map((cx, i) =>
        i < centers.length - 1 ? (
          <line key={`e${i}`} x1={cx + nodeW / 2} y1={y} x2={centers[i + 1] - nodeW / 2} y2={y} stroke="#3d4a58" strokeWidth="1.5" strokeDasharray="4 7" className="flow-line" />
        ) : null,
      )}
      {[0, 1, 2].map((i) => (
        <circle key={`p${i}`} r="3.5" fill="#69a4ee">
          <animateMotion dur="7s" begin={`${-i * 2.33}s`} repeatCount="indefinite" path={`M${centers[0]} ${y} H${centers[centers.length - 1]}`} />
        </circle>
      ))}
      {centers.map((cx, i) => (
        <g key={PIPE_NODES[i]}>
          <rect x={cx - nodeW / 2} y={y - 34} width={nodeW} height="68" rx="3" fill="#1c2732" stroke="#343c45" />
          <rect x={cx - nodeW / 2} y={y - 34} width={nodeW} height="68" rx="3" fill="none" stroke="#69a4ee" className="sim-node-glow" style={{ animationDelay: `${i * 1.16}s` }} />
          <text x={cx} y={y - 12} textAnchor="middle" className="sim-svg-mono" fill="#6284a8">0{i + 1}</text>
          <text x={cx} y={y + 10} textAnchor="middle" className="sim-svg-label" fill="#d2d8de">{PIPE_NODES[i]}</text>
          <circle cx={cx} cy={y + 24} r="2.5" fill="#69a4ee" className="sim-led" style={{ animationDelay: `${i * 0.35}s` }} />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* NVIDIA section — solid GPU card with spinning fans                  */
/* ------------------------------------------------------------------ */

function FanBlades({ cx, cy, reverse = false }: { cx: number; cy: number; reverse?: boolean }) {
  return (
    <g className={`sim-fan${reverse ? ' sim-fan-rev' : ''}`} style={{ transformOrigin: `${cx}px ${cy}px` }}>
      {Array.from({ length: 7 }, (_, i) => {
        const angle = (i * 360) / 7;
        return <path key={i} d={`M${cx} ${cy} q 6 -22 17 -26 q 3 12 -17 26 Z`} fill="#3d4a58" transform={`rotate(${angle} ${cx} ${cy})`} />;
      })}
      <circle cx={cx} cy={cy} r="7" fill="#232c36" stroke="#69a4ee" strokeWidth="1.5" />
    </g>
  );
}

export function GpuCardSim({ className = '' }: { className?: string }) {
  return (
    <svg className={`sim-svg ${className}`} viewBox="0 0 440 300" role="img" aria-label="Animated GPU accelerator illustration" preserveAspectRatio="xMidYMid meet">
      <rect x="34" y="66" width="14" height="168" rx="2" fill="#38434f" />
      <rect x="48" y="76" width="344" height="142" rx="8" fill="#232c36" stroke="#46525f" strokeWidth="1.5" />
      <rect x="48" y="76" width="344" height="26" rx="8" fill="#1c2732" />
      <text x="64" y="94" className="sim-svg-mono" fill="#8ab7ea">COMPUTE ACCELERATOR · SXM</text>
      <rect x="300" y="86" width="78" height="12" rx="6" fill="#161c24" />
      <circle cx="310" cy="92" r="3" fill="#69a4ee" className="sim-led" />
      <text x="320" y="95" className="sim-svg-mono" fill="#78838f">ACTIVE</text>
      <circle cx="150" cy="164" r="46" fill="#161c24" stroke="#3d4a58" strokeWidth="2" />
      <FanBlades cx={150} cy={164} />
      <circle cx="288" cy="164" r="46" fill="#161c24" stroke="#3d4a58" strokeWidth="2" />
      <FanBlades cx={288} cy={164} reverse />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={64 + i * 11} y={228} width="6" height="22" rx="1" fill="#38434f" />
      ))}
      <rect x="240" y="228" width="120" height="14" rx="2" fill="#1c2732" stroke="#38434f" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1="60" y1={262 + i * 10} x2="380" y2={262 + i * 10} stroke="#3d4a58" strokeWidth="1.5" strokeDasharray="3 9" className="flow-line" style={{ animationDuration: `${5 + i * 2}s` }} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} r="2.5" fill="#69a4ee">
          <animateMotion dur={`${4 + i * 0.8}s`} begin={`${-i * 1.3}s`} repeatCount="indefinite" path="M60 267 H380" />
        </circle>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Provider network — topology with pulses and packets                 */
/* ------------------------------------------------------------------ */

const TOPO_NODES: Array<[string, number, number]> = [
  ['Golem', 140, 62],
  ['CoreWeave', 858, 56],
  ['Lambda', 868, 264],
  ['Nebius', 132, 268],
  ['Crusoe', 500, 48],
  ['Other', 500, 284],
];

export function NetworkTopologySim() {
  const cx = 500;
  const cy = 160;
  return (
    <svg className="sim-svg sim-fill" viewBox="0 0 1000 320" role="img" aria-label="Animated infrastructure topology" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id="sim-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M34 0H0V34" fill="none" stroke="#1e2934" strokeOpacity="0.06" />
        </pattern>
      </defs>
      <rect width="1000" height="320" fill="url(#sim-grid)" />
      {TOPO_NODES.map(([, nx, ny], i) => {
        const mx = (cx + nx) / 2 + (i % 2 === 0 ? -30 : 30);
        const my = (cy + ny) / 2 + (i % 3 === 0 ? -20 : 20);
        const d = `M${cx} ${cy} Q${mx} ${my} ${nx} ${ny}`;
        return (
          <g key={`edge-${i}`}>
            <path d={d} fill="none" stroke="#91a3b5" strokeWidth="1.2" strokeDasharray="4 7" className="flow-line" />
            <circle r="3.2" fill="#4489e5">
              <animateMotion dur={`${3.6 + i * 0.5}s`} begin={`${-i * 0.9}s`} repeatCount="indefinite" path={d} />
            </circle>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="30" fill="none" stroke="#6284a8" strokeWidth="1">
        <animate attributeName="r" values="30;62" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".55;0" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="30" fill="none" stroke="#6284a8" strokeWidth="1">
        <animate attributeName="r" values="30;62" dur="3s" begin="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".55;0" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="30" fill="#1c2732" />
      <g stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d={`M${cx} ${cy + 12} v-20 m0 8 -7 -6 m7 6 7 -7 m-7 12 -6 -3 m6 3 6 -4`} />
        <circle cx={cx} cy={cy - 14} r="2.4" />
        <circle cx={cx - 8} cy={cy - 7} r="2" />
        <circle cx={cx + 8} cy={cy - 8} r="2" />
      </g>
      <text x={cx} y={cy + 50} textAnchor="middle" className="sim-svg-mono" fill="#1e2934">COMPUTREE</text>
      {TOPO_NODES.map(([name, nx, ny], i) => (
        <g key={name}>
          <rect x={nx - 56} y={ny - 19} width="112" height="38" rx="3" fill="#fff" stroke="#d8dee3" />
          <circle cx={nx - 40} cy={ny} r="3.5" fill="#6284a8" className="sim-led" style={{ animationDelay: `${i * 0.4}s` }} />
          <text x={nx + 6} y={ny + 3.5} textAnchor="middle" className="sim-svg-label" fill="#2e3741">{name}</text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Expansion — nodes join the network on a loop                        */
/* ------------------------------------------------------------------ */

export function ExpansionSim() {
  const cx = 330;
  const cy = 190;
  const base: Array<[number, number]> = [[120, 90], [130, 300], [330, 60]];
  const growth: Array<[number, number]> = [[540, 80], [560, 300], [330, 330]];
  return (
    <svg className="sim-svg sim-fill" viewBox="0 0 660 400" role="img" aria-label="Animated network expansion simulation" preserveAspectRatio="xMidYMid slice">
      {base.map(([nx, ny], i) => (
        <line key={`be${i}`} x1={cx} y1={cy} x2={nx} y2={ny} stroke="#91a3b5" strokeWidth="1.2" strokeDasharray="4 7" className="flow-line" />
      ))}
      {growth.map(([nx, ny], i) => (
        <g key={`g${i}`}>
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#6284a8" strokeWidth="1.2" className="sim-grow-edge" style={{ animationDelay: `${i * 0.9}s` }} />
          <g className="sim-grow-node" style={{ animationDelay: `${i * 0.9}s`, transformOrigin: `${nx}px ${ny}px` }}>
            <rect x={nx - 34} y={ny - 20} width="68" height="40" rx="3" fill="#1c2732" />
            <text x={nx} y={ny + 3} textAnchor="middle" className="sim-svg-mono" fill="#aad0f7">NEW</text>
            <text x={nx} y={ny + 14} textAnchor="middle" className="sim-svg-mono" fill="#9ab5d2">NODE</text>
          </g>
        </g>
      ))}
      {base.map(([nx, ny], i) => (
        <g key={`bn${i}`}>
          <rect x={nx - 36} y={ny - 22} width="72" height="44" rx="3" fill="#fff" stroke="#c6cfd8" />
          <circle cx={nx} cy={ny} r="4" fill="#6284a8" className="sim-led" style={{ animationDelay: `${i * 0.6}s` }} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="26" fill="#1c2732" />
      <g stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d={`M${cx} ${cy + 10} v-17 m0 7 -6 -5 m6 5 6 -6 m-7 11 -5 -3 m5 3 5 -3`} />
        <circle cx={cx} cy={cy - 12} r="2.2" />
      </g>
      <text x={cx} y={cy + 44} textAnchor="middle" className="sim-svg-mono" fill="#1e2934">ONE API</text>
      {[0, 1].map((i) => (
        <circle key={`pk${i}`} r="3" fill="#4489e5">
          <animateMotion dur={`${4 + i * 1.4}s`} begin={`${-i * 1.8}s`} repeatCount="indefinite" path={`M${base[i][0]} ${base[i][1]} L${cx} ${cy}`} />
        </circle>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Ambient network — background motion for dark sections               */
/* ------------------------------------------------------------------ */

const AMBIENT_NODES: Array<[number, number]> = [
  [90, 120], [240, 60], [420, 140], [620, 70], [740, 180],
  [140, 320], [360, 380], [580, 330], [700, 460], [200, 500],
];

const AMBIENT_EDGES: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [2, 6]];

export function AmbientFlow({ className = '' }: { className?: string }) {
  return (
    <svg className={`sim-ambient ${className}`} viewBox="0 0 800 600" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      {AMBIENT_EDGES.map(([a, b], i) => {
        const [x1, y1] = AMBIENT_NODES[a];
        const [x2, y2] = AMBIENT_NODES[b];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#69a4ee" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="3 8" className="flow-line" style={{ animationDuration: `${9 + (i % 4) * 3}s` }} />;
      })}
      {AMBIENT_EDGES.slice(0, 5).map(([a, b], i) => {
        const [x1, y1] = AMBIENT_NODES[a];
        const [x2, y2] = AMBIENT_NODES[b];
        return (
          <circle key={`p${i}`} r="2.4" fill="#8ab7ea" fillOpacity="0.75">
            <animateMotion dur={`${5 + i * 1.7}s`} begin={`${-i * 1.9}s`} repeatCount="indefinite" path={`M${x1} ${y1} L${x2} ${y2}`} />
          </circle>
        );
      })}
      {AMBIENT_NODES.map(([x, y], i) => (
        <g key={`n${i}`}>
          <rect x={x - 7} y={y - 7} width="14" height="14" rx="2" fill={i % 3 === 0 ? '#69a4ee' : '#2c3947'} fillOpacity={i % 3 === 0 ? 0.85 : 1} className="sim-ambient-node" style={{ animationDelay: `${i * 0.5}s`, transformOrigin: `${x}px ${y}px` }} />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* API section — terminal typing animation                             */
/* ------------------------------------------------------------------ */

const TERMINAL_LINES = [
  'POST /v1/chat/completions',
  'Authorization: Bearer ct_live_xxxxx',
  'Content-Type: application/json',
  '',
  '{',
  '  "model": "qwen",',
  '  "messages": [',
  '    {',
  '      "role": "user",',
  '      "content": "Hello"',
  '    }',
  '  ]',
  '}',
];

function renderCodeFragment(text: string, keyBase: number) {
  return text.split(/("[^"]*")/g).map((part, i) => {
    if (part.startsWith('"')) return <em key={`${keyBase}-${i}`}>{part}</em>;
    if (part.startsWith('POST ')) return <span key={`${keyBase}-${i}`}><b>POST</b>{part.slice(4)}</span>;
    return <span key={`${keyBase}-${i}`}>{part}</span>;
  });
}

export function TerminalType() {
  const [position, setPosition] = useState({ line: 0, char: 0 });

  useEffect(() => {
    let line = 0;
    let char = 0;
    let timer = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (line >= TERMINAL_LINES.length) {
        timer = window.setTimeout(() => {
          if (cancelled) return;
          line = 0;
          char = 0;
          setPosition({ line: 0, char: 0 });
          tick();
        }, 3400);
        return;
      }
      char += 1;
      if (char > TERMINAL_LINES[line].length) {
        line += 1;
        char = 0;
      }
      setPosition({ line, char });
      timer = window.setTimeout(tick, 22);
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const done = TERMINAL_LINES.slice(0, position.line);
  const current = TERMINAL_LINES[position.line]?.slice(0, position.char) ?? '';
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="code-body" aria-label="Example API request, typed automatically">
      {done.map((text, i) =>
        text === '' ? (
          <div className="code-spacer" key={i} />
        ) : (
          <div className="code-line" key={i}><span className="line-number">{pad(i + 1)}</span><span>{renderCodeFragment(text, i)}</span></div>
        ),
      )}
      {position.line < TERMINAL_LINES.length && (
        <div className="code-line"><span className="line-number">{pad(position.line + 1)}</span><span>{renderCodeFragment(current, 999)}<span className="sim-cursor" /></span></div>
      )}
    </div>
  );
}
