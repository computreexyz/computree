import { useEffect, useState } from 'react';

/* Terminal typing animation — same pattern as the landing TerminalType */
/* but parameterized so app screens can type their own line sets.        */

function renderFragment(text: string, keyBase: number) {
  return text.split(/("[^"]*")/g).map((part, i) => {
    if (part.startsWith('"')) return <em key={`${keyBase}-${i}`}>{part}</em>;
    if (part.startsWith('$ ')) return <span key={`${keyBase}-${i}`}><b>$</b>{part.slice(1)}</span>;
    if (part.startsWith('POST ') || part.startsWith('GET ')) {
      const verb = part.split(' ')[0];
      return <span key={`${keyBase}-${i}`}><b>{verb}</b>{part.slice(verb.length)}</span>;
    }
    return <span key={`${keyBase}-${i}`}>{part}</span>;
  });
}

export function TypedLines({
  lines,
  speed = 22,
  pause = 3400,
  loop = true,
  className = '',
  numbered = true,
}: {
  lines: string[];
  speed?: number;
  pause?: number;
  loop?: boolean;
  className?: string;
  numbered?: boolean;
}) {
  const [position, setPosition] = useState({ line: 0, char: 0 });

  useEffect(() => {
    let line = 0;
    let char = 0;
    let timer = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      if (line >= lines.length) {
        if (!loop) return;
        timer = window.setTimeout(() => {
          if (cancelled) return;
          line = 0;
          char = 0;
          setPosition({ line: 0, char: 0 });
          tick();
        }, pause);
        return;
      }
      char += 1;
      if (char > lines[line].length) {
        line += 1;
        char = 0;
      }
      setPosition({ line, char });
      timer = window.setTimeout(tick, speed);
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [lines, speed, pause, loop]);

  const done = lines.slice(0, position.line);
  const current = lines[position.line]?.slice(0, position.char) ?? '';
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`code-body ${className}`}>
      {done.map((text, i) =>
        text === '' ? (
          <div className="code-spacer" key={i} />
        ) : (
          <div className="code-line" key={i}>
            {numbered ? <span className="line-number">{pad(i + 1)}</span> : null}
            <span>{renderFragment(text, i)}</span>
          </div>
        ),
      )}
      {position.line < lines.length && (
        <div className="code-line">
          {numbered ? <span className="line-number">{pad(position.line + 1)}</span> : null}
          <span>
            {renderFragment(current, 999)}
            <span className="sim-cursor" />
          </span>
        </div>
      )}
    </div>
  );
}
