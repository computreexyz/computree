type ComputreeLogoProps = { inverse?: boolean; compact?: boolean };

export function ComputreeLogo({ inverse = false, compact = false }: ComputreeLogoProps) {
  return (
    <span className={`brand-lockup${inverse ? ' brand-inverse' : ''}${compact ? ' brand-compact' : ''}`}>
      <img className="brand-mark-image" src="/computree-logo-black.png" alt="" />
      <span>Computree</span>
    </span>
  );
}
