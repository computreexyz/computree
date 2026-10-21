import { Copy, KeyRound, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureBanner } from '../components/FeatureBanner';
import { AppIcon } from '../components/AppArt';
import { KeyAccessArt } from '../components/AppVisuals';
import { Panel, RelativeTime } from '../components/StatusPill';
import { TypedLines } from '../components/TypedLines';
import { type ApiKey } from '../mock/data';
import { useApiKeys, useMe } from '../mock/hooks';
import { CURL_TYPED_LINES, JS_SNIPPET, PYTHON_SNIPPET } from '../snippets';

function CodeWindow({ label, method, children }: { label: string; method: string; children: React.ReactNode }) {
  return (
    <div className="api-panel">
      <div className="code-window-bar">
        <div className="code-dots"><i /><i /><i /></div>
        {label}
        <span className="code-method">{method}</span>
      </div>
      {children}
    </div>
  );
}

function StaticCode({ code }: { code: string }) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div className="code-body">
      {code.split('\n').map((text, i) =>
        text === '' ? (
          <div className="code-spacer" key={i} />
        ) : (
          <div className="code-line" key={i}>
            <span className="line-number">{pad(i + 1)}</span>
            <span>{text}</span>
          </div>
        ),
      )}
    </div>
  );
}

function KeyCard({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: (key: ApiKey) => void }) {
  return (
    <div className="app-key-card" data-testid={`card-key-${apiKey.id}`}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <AppIcon name="keys" size={14} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>{apiKey.name}</span>
        </div>
        <div className="mono" style={{ marginTop: 6, fontSize: 10, color: 'var(--asub)' }}>{apiKey.masked}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <button className="app-filter-chip" onClick={() => onRevoke(apiKey)} data-testid={`button-revoke-${apiKey.id}`}>
          <Trash2 size={10} /> REVOKE
        </button>
      </div>
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', alignItems: 'center' }}>
        <div>
          <div className="app-key-usage"><i style={{ width: `${apiKey.usagePct}%` }} /></div>
          <div className="app-meta" style={{ marginTop: 6 }}>
            CREATED <RelativeTime ts={apiKey.createdAt} /> · LAST USED <RelativeTime ts={apiKey.lastUsedAt} />
          </div>
        </div>
        <span className="app-meta">{apiKey.usagePct}% OF ALLOCATION</span>
      </div>
    </div>
  );
}

export default function Keys() {
  const { keys, addKey, revokeKey } = useApiKeys();
  const { data: me } = useMe();
  const ineligible = me ? !me.eligibility.eligible : false;
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [revealed, setRevealed] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);

  useEffect(() => {
    const open = () => setCreateOpen(true);
    window.addEventListener('ctree:create-key', open);
    return () => window.removeEventListener('ctree:create-key', open);
  }, []);

  const [creating, setCreating] = useState(false);

  const createKey = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    try {
      const created = await addKey(name.trim() || 'untitled-key');
      setName('');
      setCreateOpen(false);
      setRevealed(created.secret);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }, [addKey, name, creating]);

  const copy = useCallback((text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`${label} copied to clipboard`))
      .catch(() => toast.error('Clipboard unavailable'));
  }, []);

  return (
    <div>
      <FeatureBanner
        feature="keys"
        title="API Keys"
        meta="Programmatic access to the Computree API"
        actions={
          <button className="button button-dark" style={{ minHeight: 36 }} onClick={() => setCreateOpen(true)} data-testid="button-create-key">
            <Plus size={13} /> Create key
          </button>
        }
      />

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 10 }}>
          {ineligible ? (
            <div className="mono" style={{ padding: '0 2px', fontSize: 9, letterSpacing: '.06em', color: 'var(--ameta)' }} data-testid="note-stake-for-keys">
              STAKE TOKENIZED NVDA (NVDAon) TO CREATE API KEYS
            </div>
          ) : null}
          {keys.length === 0 ? (
            <div className="app-panel app-panel-body">
              <div className="app-sub">No active keys. Create one to start calling the API.</div>
            </div>
          ) : (
            keys.map((key) => <KeyCard key={key.id} apiKey={key} onRevoke={setRevoking} />)
          )}
          <div className="app-meta" style={{ padding: '2px 2px 0' }}>
            KEYS ARE SHOWN IN FULL ONLY ONCE AT CREATION · STORE THEM SECURELY
          </div>
        </div>

        <Panel title="Quickstart" right={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}><span style={{ width: 120, height: 52 }} aria-hidden="true"><KeyAccessArt /></span><span className="app-meta">POST /v1/chat/completions</span></span>} flush>
          <Tabs defaultValue="curl">
            <div style={{ padding: '12px 16px 0' }}>
              <TabsList className="rounded-none h-[30px]">
                <TabsTrigger value="curl" className="rounded-none text-[9px] font-mono tracking-widest px-3">CURL</TabsTrigger>
                <TabsTrigger value="js" className="rounded-none text-[9px] font-mono tracking-widest px-3">JAVASCRIPT</TabsTrigger>
                <TabsTrigger value="python" className="rounded-none text-[9px] font-mono tracking-widest px-3">PYTHON</TabsTrigger>
              </TabsList>
            </div>
            <div style={{ padding: 12 }}>
              <TabsContent value="curl" className="mt-0">
                <CodeWindow label="SHELL" method="CURL">
                  <TypedLines lines={CURL_TYPED_LINES} speed={14} />
                </CodeWindow>
              </TabsContent>
              <TabsContent value="js" className="mt-0">
                <CodeWindow label="INDEX.TS" method="NODE 20+">
                  <StaticCode code={JS_SNIPPET} />
                </CodeWindow>
              </TabsContent>
              <TabsContent value="python" className="mt-0">
                <CodeWindow label="MAIN.PY" method="PYTHON 3.10+">
                  <StaticCode code={PYTHON_SNIPPET} />
                </CodeWindow>
              </TabsContent>
            </div>
          </Tabs>
        </Panel>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle style={{ fontSize: 15, letterSpacing: '-.02em' }}>Create API key</DialogTitle>
          </DialogHeader>
          <div className="app-meta">KEY NAME</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. production-backend"
            className="rounded-none"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') createKey(); }}
            data-testid="input-key-name"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9 }}>
            <button className="button button-outline" style={{ minHeight: 36 }} onClick={() => setCreateOpen(false)}>Cancel</button>
            <button className="button button-dark" style={{ minHeight: 36 }} onClick={createKey} data-testid="button-confirm-create-key">Create</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={revealed !== null} onOpenChange={(open) => { if (!open) setRevealed(null); }}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle style={{ fontSize: 15, letterSpacing: '-.02em' }}>Key created</DialogTitle>
          </DialogHeader>
          <p className="app-sub" style={{ margin: 0 }}>
            This is the only time the full key is shown. Copy it now and store it somewhere safe.
          </p>
          <div className="mono" style={{ padding: '12px 13px', background: 'var(--abg)', border: '1px solid var(--aline)', fontSize: 11, wordBreak: 'break-all' }} data-testid="text-revealed-key">
            {revealed}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 9 }}>
            <button className="button button-dark" style={{ minHeight: 36 }} onClick={() => revealed && copy(revealed, 'API key')} data-testid="button-copy-key">
              <Copy size={12} /> Copy key
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={revoking !== null} onOpenChange={(open) => { if (!open) setRevoking(null); }}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontSize: 15 }}>Revoke “{revoking?.name}”?</AlertDialogTitle>
            <AlertDialogDescription className="app-sub">
              Requests using this key will stop working immediately. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none"
              style={{ background: 'hsl(0 72% 52%)' }}
              onClick={() => {
                if (revoking) {
                  revokeKey(revoking.id);
                  toast.success(`Key “${revoking.name}” revoked`);
                }
                setRevoking(null);
              }}
              data-testid="button-confirm-revoke"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
