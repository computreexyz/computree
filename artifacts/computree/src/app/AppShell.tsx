import { usePrivy } from '@privy-io/react-auth';
import { Copy, KeyRound, MoreHorizontal, PanelLeftClose, Wallet, BookOpen, Github } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { toast } from 'sonner';
import { ComputreeLogo } from '@/components/ComputreeLogo';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { CountdownChip } from './components/StatPanel';
import { useDemoMode, useMe } from './mock/hooks';
import { MOCK_WALLET } from './mock/data';
import { APP_NAV_ITEMS, MOBILE_PRIMARY_PATHS } from './nav-items';
import { CURL_SNIPPET } from './snippets';

const RAIL_STORAGE = 'ctree_rail_collapsed';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function useRailCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(RAIL_STORAGE) === '1';
    } catch {
      return false;
    }
  });
  const toggle = useCallback(() => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(RAIL_STORAGE, value ? '0' : '1');
      } catch {
        /* storage unavailable */
      }
      return !value;
    });
  }, []);
  return [collapsed, toggle];
}

function WalletChip() {
  const { user } = usePrivy();
  const [demo] = useDemoMode();
  const { data: me } = useMe();
  if (demo && !user) {
    return (
      <span className="app-chip" data-testid="chip-wallet">
        <Wallet size={12} />
        <span className="app-demo-badge">DEMO</span>
      </span>
    );
  }
  const address = user?.wallet?.address ?? MOCK_WALLET.address;
  const staked = me?.eligibility.balance;
  return (
    <span className="app-chip" data-testid="chip-wallet" title={address}>
      <Wallet size={12} />
      <span>{truncateAddress(address)}</span>
      <span className="app-chip-num app-hide-mobile" style={{ color: 'var(--asub)' }}>
        {staked !== undefined ? `${staked.toLocaleString('en-US')} NVDA` : `${MOCK_WALLET.balanceCtree.toLocaleString('en-US')} NVDA`}
      </span>
      {demo ? <span className="app-demo-badge">DEMO</span> : null}
    </span>
  );
}

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [, navigate] = useLocation();

  const go = useCallback(
    (path: string) => {
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange],
  );

  const copyCurl = useCallback(() => {
    onOpenChange(false);
    navigator.clipboard
      .writeText(CURL_SNIPPET)
      .then(() => toast.success('cURL snippet copied to clipboard'))
      .catch(() => toast.error('Clipboard unavailable'));
  }, [onOpenChange]);

  const createKey = useCallback(() => {
    onOpenChange(false);
    navigate('/app/keys');
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('ctree:create-key')), 60);
  }, [navigate, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="app-skin-flat">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {APP_NAV_ITEMS.map((item) => (
              <CommandItem key={item.path} onSelect={() => go(item.path)} className="app-palette-item">
                <item.icon size={14} />
                Go to {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={createKey} className="app-palette-item">
              <KeyRound size={14} />
              Create API key
            </CommandItem>
            <CommandItem onSelect={copyCurl} className="app-palette-item">
              <Copy size={14} />
              Copy cURL snippet
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </div>
    </CommandDialog>
  );
}

function Rail({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [location] = useLocation();
  return (
    <aside className={`app-rail${collapsed ? ' is-collapsed' : ''}`} aria-label="App navigation">
      <Link href="/" className="app-rail-brand" aria-label="Back to landing page">
        <ComputreeLogo />
      </Link>
      <nav className="app-rail-nav">
        <div className="app-rail-group">Workspace</div>
        {APP_NAV_ITEMS.map((item) => {
          const active = item.path === '/app' ? location === '/app' : location.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`app-nav-item${active ? ' is-active' : ''}`}
              aria-current={active ? 'page' : undefined}
              title={item.label}
            >
              <item.icon size={16} strokeWidth={1.8} />
              <span className="app-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="app-rail-social" aria-label="Community links (coming soon)">
        <span className="app-rail-social-link" role="link" aria-disabled="true" title="X — coming soon" data-testid="link-social-x">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 2.6h3.1l-6.8 7.8 8 11h-6.3l-4.9-6.4-5.6 6.4H3.3l7.3-8.3L2.9 2.6h6.4l4.4 5.9 5.2-5.9Zm-1.1 16.9h1.7L8.6 4.4H6.8l11 15.1Z"/></svg>
        </span>
        <span className="app-rail-social-link" role="link" aria-disabled="true" title="Docs — coming soon" data-testid="link-social-docs">
          <BookOpen size={14} strokeWidth={1.8} />
        </span>
        <span className="app-rail-social-link" role="link" aria-disabled="true" title="GitHub — coming soon" data-testid="link-social-github">
          <Github size={14} strokeWidth={1.8} />
        </span>
      </div>
      <button className="app-rail-collapse" onClick={onToggle} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
        <PanelLeftClose size={15} strokeWidth={1.8} />
        <span className="app-rail-foot-label">Collapse</span>
      </button>
    </aside>
  );
}

function BottomNav({ onMore }: { onMore: () => void }) {
  const [location] = useLocation();
  const primary = APP_NAV_ITEMS.filter((item) => MOBILE_PRIMARY_PATHS.includes(item.path));
  return (
    <nav className="app-bottomnav" aria-label="App navigation">
      {primary.map((item) => {
        const active = item.path === '/app' ? location === '/app' : location.startsWith(item.path);
        return (
          <Link key={item.path} href={item.path} className={`app-bottomnav-item${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
            <item.icon size={17} strokeWidth={1.8} />
            {item.label}
          </Link>
        );
      })}
      <button className="app-bottomnav-item" onClick={onMore} aria-label="More pages">
        <MoreHorizontal size={17} strokeWidth={1.8} />
        More
      </button>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, toggleCollapsed] = useRailCollapsed();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location, navigate] = useLocation();

  const pageLabel = useMemo(() => {
    const match = [...APP_NAV_ITEMS]
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) => (item.path === '/app' ? location === '/app' : location.startsWith(item.path)));
    return match?.pageLabel ?? 'Overview';
  }, [location]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const moreItems = APP_NAV_ITEMS.filter((item) => !MOBILE_PRIMARY_PATHS.includes(item.path));

  return (
    <div className="app-scope app-shell">
      <Rail collapsed={collapsed} onToggle={toggleCollapsed} />
      <div className={`app-main${collapsed ? ' is-collapsed' : ''}`}>
        <header className="app-topbar">
          <span className="app-topbar-page">{pageLabel}</span>
          <span className="app-topbar-spacer" />
          <button className="app-chip app-chip-btn app-hide-mobile" onClick={() => setPaletteOpen(true)} aria-label="Open command palette">
            <span>⌘K</span>
          </button>
          <CountdownChip />
          <WalletChip />
        </header>
        <main className="app-content">{children}</main>
      </div>
      <BottomNav onMore={() => setMoreOpen(true)} />
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-none p-5 pb-8">
          <SheetHeader className="p-0 pb-3 text-left">
            <SheetTitle className="app-meta">More</SheetTitle>
          </SheetHeader>
          <div className="app-more-list">
            {moreItems.map((item) => (
              <button
                key={item.path}
                className="app-more-item"
                style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--ahair)', cursor: 'pointer', textAlign: 'left' }}
                onClick={() => {
                  setMoreOpen(false);
                  navigate(item.path);
                }}
              >
                <item.icon size={16} strokeWidth={1.8} />
                {item.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Toaster position="bottom-right" toastOptions={{ style: { borderRadius: 8, fontFamily: 'var(--afont)', fontSize: 12.5 } }} />
    </div>
  );
}
