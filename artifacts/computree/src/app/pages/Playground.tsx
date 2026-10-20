import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, Copy, SendHorizontal } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FeatureBanner } from '../components/FeatureBanner';
import { ModelSelect, type ModelOption } from '../components/ModelSelect';
import { PlaygroundArt } from '../components/AppVisuals';
import { AllocationCard } from '../components/AllocationCard';
import { Panel } from '../components/StatusPill';
import {
  useAllocation,
  usePlaygroundCompletion,
  type PlaygroundChatMessage,
  type PlaygroundCompletion,
  type PlaygroundRequest,
} from '../mock/hooks';
import { API_BASE } from '../snippets';

/* ------------------------------ options -------------------------------- */

const MODEL_OPTIONS: ModelOption[] = [
  { value: 'auto', label: 'Auto (router picks)', mark: 'sparkles' },
  { value: 'qwen/qwen3-32b', label: 'Qwen 3 32B', logo: '/brands/qwen.svg' },
  { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B', logo: '/brands/meta.svg' },
  { value: 'deepseek/deepseek-chat-v3.1', label: 'DeepSeek Chat v3.1', logo: '/brands/deepseek.svg' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o mini', logo: '/brands/openai.svg' },
  { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5', logo: '/brands/anthropic.svg' },
];

const PRESETS: Array<{ label: string; insert: string }> = [
  { label: 'Summarize this', insert: 'Summarize this' },
  { label: 'Translate to Chinese', insert: 'Translate to Chinese' },
  { label: 'Code review', insert: 'Code review' },
  { label: 'Smart contract audit', insert: 'Audit this smart contract for vulnerabilities and explain the risks:\n\n' },
  { label: 'Coding assistant', insert: 'You are a senior engineer. Help me with:\n\n' },
  { label: 'AI agent planner', insert: 'Act as an autonomous agent. Break this goal into executable steps with tools:\n\n' },
  { label: 'Explain simply', insert: 'Explain simply' },
];

/* ------------------------------- types --------------------------------- */

interface AssistantReply {
  requestedModel: string;
  model: string;
  content: string;
  credits: number;
  promptTokens: number;
  completionTokens: number;
  durationMs: number;
}

interface Turn {
  id: string;
  user: string;
  replies: AssistantReply[];
}

interface Exchange {
  model: string;
  request: PlaygroundRequest;
  headers: Record<string, string>;
  response?: PlaygroundCompletion;
  error?: string;
}

/* ---------------------------- collapsible ------------------------------ */

function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="app-panel">
      <header className="app-panel-head">
        <button
          className="pg-collapse-head"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="app-panel-title">{title}</span>
          <ChevronDown
            size={13}
            style={{
              transform: open ? 'rotate(180deg)' : undefined,
              transition: 'transform .15s',
              color: 'var(--ameta)',
            }}
          />
        </button>
      </header>
      {open ? <div className="app-panel-body" style={{ display: 'grid', gap: 10 }}>{children}</div> : null}
    </section>
  );
}

/* --------------------------- settings card ----------------------------- */

function SettingsCard({
  model,
  onModel,
  temperature,
  onTemperature,
  system,
  onSystem,
  onPreset,
}: {
  model: string;
  onModel: (value: string) => void;
  temperature: number;
  onTemperature: (value: number) => void;
  system: string;
  onSystem: (value: string) => void;
  onPreset: (preset: string) => void;
}) {
  const [systemOpen, setSystemOpen] = useState(false);
  return (
    <Panel title="Settings" flush={false}>
      <div style={{ display: 'grid', gap: 14 }}>
        <div>
          <div className="app-meta" style={{ marginBottom: 7 }}>MODEL</div>
          <ModelSelect options={MODEL_OPTIONS} value={model} onChange={onModel} testId="select-playground-model" />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span className="app-meta">TEMPERATURE</span>
            <span className="mono" style={{ fontSize: 11 }}>{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            className="pg-slider"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => onTemperature(Number(e.target.value))}
            data-testid="slider-temperature"
          />
        </div>
        <div>
          <button
            className="pg-collapse-head"
            onClick={() => setSystemOpen((o) => !o)}
            aria-expanded={systemOpen}
          >
            <span className="app-meta">SYSTEM PROMPT</span>
            <ChevronDown
              size={12}
              style={{
                transform: systemOpen ? 'rotate(180deg)' : undefined,
                transition: 'transform .15s',
                color: 'var(--ameta)',
              }}
            />
          </button>
          {systemOpen ? (
            <textarea
              className="pg-textarea"
              style={{ marginTop: 8, minHeight: 70 }}
              value={system}
              onChange={(e) => onSystem(e.target.value)}
              placeholder="You are a concise assistant…"
              data-testid="input-system-prompt"
            />
          ) : null}
        </div>
        <div>
          <div className="app-meta" style={{ marginBottom: 7 }}>PRESETS</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                className="app-filter-chip"
                onClick={() => onPreset(preset.insert)}
                data-testid={`chip-preset-${preset.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

/* --------------------------- inspector card ---------------------------- */

function InspectorCard({ exchanges }: { exchanges: Exchange[] }) {
  return (
    <Collapsible title="Request inspector">
      {exchanges.length === 0 ? (
        <span className="app-meta">No requests yet - send a prompt to inspect the wire format.</span>
      ) : (
        exchanges.map((exchange) => (
          <div key={exchange.model} style={{ display: 'grid', gap: 8 }}>
            <div className="app-meta">REQUEST · {exchange.model}</div>
            <pre className="pg-pre" data-testid={`inspector-request-${exchange.model}`}>
              {JSON.stringify(exchange.request, null, 2)}
            </pre>
            {exchange.response ? (
              <>
                <div className="app-meta">RESPONSE</div>
                <pre className="pg-pre">{JSON.stringify(exchange.response, null, 2)}</pre>
              </>
            ) : (
              <div className="pg-error">{exchange.error ?? 'request failed'}</div>
            )}
            <div className="app-meta">RESPONSE HEADERS</div>
            <pre className="pg-pre">
              {Object.keys(exchange.headers).length > 0
                ? Object.entries(exchange.headers)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')
                : '(no x-ctree-* headers captured)'}
            </pre>
          </div>
        ))
      )}
    </Collapsible>
  );
}

/* ------------------------------ cURL card ------------------------------ */

function CurlCard({ model }: { model: string }) {
  const command = `curl ${API_BASE}/v1/chat/completions \\
  -H "Authorization: Bearer ct_live_PASTE_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"${model}","messages":[{"role":"user","content":"Hello"}]}'`;

  const copy = useCallback(() => {
    navigator.clipboard
      .writeText(command)
      .then(() => toast.success('curl command copied to clipboard'))
      .catch(() => toast.error('Clipboard unavailable'));
  }, [command]);

  return (
    <Collapsible title="Call it with cURL">
      <pre className="pg-pre" data-testid="text-curl-command">{command}</pre>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span className="app-meta">Paste your key from the API Keys page</span>
        <button className="button button-outline" style={{ minHeight: 32 }} onClick={copy} data-testid="button-copy-curl">
          <Copy size={11} /> Copy
        </button>
      </div>
    </Collapsible>
  );
}

/* ------------------------------- page ---------------------------------- */

export default function Playground() {
  const queryClient = useQueryClient();
  const completion = usePlaygroundCompletion();
  const { data: allocation } = useAllocation();

  const [model, setModel] = useState(MODEL_OPTIONS[0].value);
  const [temperature, setTemperature] = useState(1);
  const [system, setSystem] = useState('');
  const [compare, setCompare] = useState(false);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspector, setInspector] = useState<Exchange[]>([]);

  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, sending]);

  const noAllocation = allocation !== undefined && allocation.total === 0;
  const exhausted = allocation !== undefined && !noAllocation && allocation.used >= allocation.total;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || exhausted || noAllocation) return;
    setError(null);
    setInput('');
    setSending(true);

    const history: PlaygroundChatMessage[] = turns
      .flatMap((turn) => {
        const msgs: PlaygroundChatMessage[] = [{ role: 'user', content: turn.user }];
        const first = turn.replies[0];
        if (first) msgs.push({ role: 'assistant', content: first.content });
        return msgs;
      })
      .slice(-19);
    const messages: PlaygroundChatMessage[] = [...history, { role: 'user', content: text }];

    const targets = compare && model !== 'auto' ? [model, 'auto'] : [model];
    const exchanges: Exchange[] = [];
    const replies: AssistantReply[] = [];
    let firstError: string | null = null;

    await Promise.all(
      targets.map(async (target) => {
        const request: PlaygroundRequest = {
          model: target,
          ...(system.trim() ? { system: system.trim() } : {}),
          temperature,
          messages,
        };
        const headers: Record<string, string> = {};
        const exchange: Exchange = { model: target, request, headers };
        exchanges.push(exchange);
        const started = performance.now();
        try {
          const res = await completion.mutateAsync({
            ...request,
            onResponse: (r) => {
              r.headers.forEach((value, key) => {
                if (key.toLowerCase().startsWith('x-ctree')) headers[key] = value;
              });
            },
          });
          exchange.response = res;
          replies.push({
            requestedModel: target,
            model: res.model,
            content: res.content,
            credits: res.creditsUsed,
            promptTokens: res.usage.promptTokens,
            completionTokens: res.usage.completionTokens,
            durationMs: Math.round(performance.now() - started),
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Request failed';
          exchange.error = message;
          if (!firstError) firstError = message;
        }
      }),
    );

    exchanges.sort((a, b) => targets.indexOf(a.model) - targets.indexOf(b.model));
    replies.sort((a, b) => targets.indexOf(a.requestedModel) - targets.indexOf(b.requestedModel));
    setInspector(exchanges);

    if (replies.length > 0) {
      setTurns((prev) => [...prev, { id: `turn_${Date.now()}`, user: text, replies }].slice(-20));
      queryClient.invalidateQueries({ queryKey: ['app', 'allocation'] });
      queryClient.invalidateQueries({ queryKey: ['app', 'jobs'] });
    }
    if (firstError) {
      setError(replies.length > 0 ? `One model failed: ${firstError}` : firstError);
    }
    setSending(false);
  }, [input, sending, exhausted, noAllocation, turns, compare, model, system, temperature, completion, queryClient]);

  const applyPreset = useCallback((preset: string) => {
    setInput((prev) => (prev.trim() ? `${preset}:\n\n${prev}` : `${preset} `));
  }, []);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FeatureBanner
        feature="playground"
        title="Playground"
        meta="Test prompts against live models · metered against your daily allocation"
      />

      <div className="pg-layout">
        {/* ------------------------------ chat ------------------------------ */}
        <Panel
          title="Session"
          right={
            <button
              className={`app-filter-chip${compare ? ' is-on' : ''}`}
              onClick={() => setCompare((c) => !c)}
              data-testid="toggle-compare"
              aria-pressed={compare}
            >
              Compare
            </button>
          }
          flush={false}
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="pg-thread" ref={threadRef} data-testid="thread-playground">
              {turns.length === 0 && !sending ? (
                <div style={{ margin: 'auto', textAlign: 'center', display: 'grid', justifyItems: 'center', gap: 12, padding: '24px 0' }}>
                  <div style={{ width: 220, height: 120 }} aria-hidden="true">
                    <PlaygroundArt />
                  </div>
                  <div className="app-sub">Send your first test prompt</div>
                  <div className="app-meta">ENTER TO SEND · SHIFT+ENTER FOR A NEW LINE</div>
                </div>
              ) : (
                turns.map((turn) => (
                  <div key={turn.id} style={{ display: 'contents' }}>
                    <div className="pg-msg-user">{turn.user}</div>
                    <div className={turn.replies.length > 1 ? 'pg-compare' : undefined}>
                      {turn.replies.map((reply) => (
                        <div key={`${turn.id}_${reply.requestedModel}`} className="pg-msg-assistant" data-testid={`reply-${reply.requestedModel}`}>
                          <div className="pg-msg-content">{reply.content}</div>
                          <div className="pg-msg-meta">
                            <span className="pg-chip">{reply.model.toUpperCase()}</span>
                            {turn.replies.length > 1 && reply.requestedModel !== reply.model ? (
                              <span className="pg-chip">REQ {reply.requestedModel.toUpperCase()}</span>
                            ) : null}
                            <span className="pg-chip">{reply.credits.toFixed(1)} CR</span>
                            <span className="pg-chip">
                              {reply.promptTokens}→{reply.completionTokens} TOK
                            </span>
                            <span className="pg-chip">{(reply.durationMs / 1000).toFixed(1)}S</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
              {sending ? (
                <div className="pg-msg-assistant" style={{ alignSelf: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 5, padding: '4px 2px' }} aria-label="Waiting for response">
                    <span className="pg-dot" />
                    <span className="pg-dot" style={{ animationDelay: '.18s' }} />
                    <span className="pg-dot" style={{ animationDelay: '.36s' }} />
                  </div>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="pg-error" role="alert" data-testid="banner-playground-error">
                {error}
              </div>
            ) : null}
            {exhausted ? (
              <div className="app-meta">DAILY ALLOCATION EXHAUSTED · RESETS AT 00:00 UTC</div>
            ) : null}

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                className="pg-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Type a prompt…"
                data-testid="input-playground-prompt"
              />
              <button
                className="button button-dark"
                style={{ minHeight: 42, flex: '0 0 auto' }}
                onClick={() => void send()}
                disabled={!input.trim() || sending || exhausted || noAllocation}
                data-testid="button-send-prompt"
              >
                <SendHorizontal size={13} /> Send
              </button>
            </div>
          </div>
        </Panel>

        {/* --------------------------- right column -------------------------- */}
        <div style={{ display: 'grid', gap: 16 }}>
          <SettingsCard
            model={model}
            onModel={setModel}
            temperature={temperature}
            onTemperature={setTemperature}
            system={system}
            onSystem={setSystem}
            onPreset={applyPreset}
          />
          <AllocationCard />
          <InspectorCard exchanges={inspector} />
          <CurlCard model={model} />
        </div>
      </div>
    </div>
  );
}
