import { Check, ChevronDown, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ModelOption {
  value: string;
  label: string;
  /** /brands/*.svg logo path, or the 'sparkles' special mark */
  logo?: string;
  mark?: 'sparkles';
}

export function ModelIcon({ option, size = 16 }: { option: ModelOption; size?: number }) {
  if (option.mark === 'sparkles') return <Sparkles size={size} strokeWidth={1.8} aria-hidden="true" />;
  if (!option.logo) return null;
  return (
    <img
      src={option.logo}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: 3, display: 'block' }}
    />
  );
}

export function ModelSelect({
  options,
  value,
  onChange,
  disabled = false,
  testId,
}: {
  options: ModelOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="msel">
      <button
        type="button"
        className="msel-trigger"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="msel-icon"><ModelIcon option={selected} /></span>
        <span className="msel-text">
          <span className="msel-label">{selected.label}</span>
          <span className="msel-slug mono">{selected.value}</span>
        </span>
        <ChevronDown size={13} className={`msel-chev${open ? ' is-open' : ''}`} aria-hidden="true" />
      </button>
      {open ? (
        <>
          <div className="msel-backdrop" aria-hidden="true" onClick={() => setOpen(false)} />
          <div className="msel-panel" role="listbox" aria-label="Model options">
            {options.map((option) => {
              const active = option.value === selected.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`msel-option${active ? ' is-active' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <span className="msel-icon"><ModelIcon option={option} /></span>
                  <span className="msel-text">
                    <span className="msel-label">{option.label}</span>
                    <span className="msel-slug mono">{option.value}</span>
                  </span>
                  {active ? <Check size={13} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
