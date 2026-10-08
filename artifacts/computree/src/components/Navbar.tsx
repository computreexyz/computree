import { useEffect, useState } from 'react';
import { ComputreeLogo } from './ComputreeLogo';

const navigation = [
  { label: 'Product', href: '#product' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Infrastructure', href: '#infrastructure' },
  { label: 'Developers', href: '#developers' },
  { label: '$CTREE', href: '#ctree' },
  { label: 'Resources', href: '#resources' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="nav-inner container">
        <a className="brand-link" href="#top" onClick={close} aria-label="Computree home" data-testid="link-home">
          <ComputreeLogo />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="button button-dark nav-cta" href="#access" data-testid="link-access-compute">
          Access GPU Compute <span aria-hidden="true">→</span>
        </a>
        <button
          className="menu-toggle"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
          data-testid="button-mobile-menu"
        >
          <span /><span />
        </button>
      </div>
      <nav id="mobile-navigation" className={`mobile-navigation${open ? ' is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!open}>
        {navigation.map((item, index) => (
          <a key={item.href} href={item.href} onClick={close} data-testid={`link-mobile-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} style={{ transitionDelay: open ? `${index * 35}ms` : '0ms' }}>
            <span className="mobile-nav-index">0{index + 1}</span>{item.label}<span aria-hidden="true">↗</span>
          </a>
        ))}
        <a className="button button-dark mobile-nav-action" href="#access" onClick={close} data-testid="link-mobile-access">Access GPU Compute <span aria-hidden="true">→</span></a>
      </nav>
    </header>
  );
}
