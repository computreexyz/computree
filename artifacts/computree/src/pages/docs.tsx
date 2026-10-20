import { useEffect, useState, type ReactNode } from 'react';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

/* ------------------------------------------------------------------ */
/* Computree public documentation — /docs (no auth)                    */
/* ------------------------------------------------------------------ */

const UPDATED = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const NAV_ITEMS: Array<[string, string]> = [
  ['overview', 'Overview'],
  ['how-it-works', 'How It Works'],
  ['staking', 'Staking'],
  ['allocation', 'Allocation'],
  ['features', 'Features'],
  ['api', 'API'],
  ['lifecycle', 'Lifecycle'],
  ['network', 'Network'],
  ['treasury', 'Treasury'],
  ['faq', 'FAQ'],
];

/* ---------------------------- mermaid ------------------------------- */

function useMermaid() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(({ default: mermaid }) => {
        if (cancelled) return;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            background: '#ffffff',
            primaryColor: '#f7f8f9',
            primaryBorderColor: '#dfe3e7',
            primaryTextColor: '#151a21',
            lineColor: '#7d8791',
            secondaryColor: '#e8f1fd',
            tertiaryColor: '#eef1f3',
            fontFamily: 'Manrope',
            fontSize: '13px',
          },
        });
        return mermaid.run({ querySelector: '.mermaid' });
      })
      .catch(() => {
        /* diagram render failure — raw source stays visible */
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

function MermaidBlock({ chart, ready }: { chart: string; ready: boolean }) {
  return (
    <div className="docs-mermaid">
      {!ready ? <span className="docs-mermaid-loading">RENDERING DIAGRAM…</span> : null}
      <pre className="mermaid">{chart}</pre>
    </div>
  );
}

/* --------------------------- primitives ------------------------------ */

function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="docs-section" id={id}>
      <div className="section-label eyebrow">{label}</div>
      <h2 className="docs-h2">{title}</h2>
      <div className="docs-body">{children}</div>
    </section>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="docs-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i}>
              {cells.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Mono({ children }: { children: ReactNode }) {
  return <span className="mono" style={{ fontSize: '0.92em' }}>{children}</span>;
}

/* ----------------------------- diagrams ------------------------------ */

const CHART_FLOW = `flowchart LR
  A["Connect wallet"] --> C["Daily allocation: 1,000 CR"]
  C --> D["Use compute"]
  D --> D1["Playground"]
  D --> D2["Images"]
  D --> D3["Workloads"]
  D --> D4["GPU API"]
  D1 --> E["Metered credits"]
  D2 --> E
  D3 --> E
  D4 --> E
  E --> F["Reset 00:00 UTC"]
  F --> C
  S["Stake tokenized NVDA (optional)"] -.-> A`;

const CHART_STAKING = `sequenceDiagram
  actor U as User
  participant C as Computree API
  participant R as Robinhood Chain
  U->>C: Connect wallet or call API
  C->>R: eth_call stakedBalanceOf wallet
  R-->>C: staked balance (informational)
  C->>C: allocation active for every account
  C-->>U: daily allocation plus staked position`;

const CHART_ALLOCATION = `stateDiagram-v2
  [*] --> Allocated: 00:00 UTC
  Allocated --> InUse: first request
  InUse --> InUse: credits metered
  InUse --> Exhausted: used = 1,000 CR
  Allocated --> Refreshed: 00:00 UTC
  InUse --> Refreshed: 00:00 UTC
  Exhausted --> Refreshed: 00:00 UTC
  Refreshed --> Allocated: new cycle`;

const CHART_LIFECYCLE = `sequenceDiagram
  actor CL as Client
  participant G as API Gateway
  participant A as Allocation DB
  participant I as Inference Infrastructure
  participant M as Metering
  CL->>G: POST /v1/chat/completions with ct_live_ key
  G->>A: verify key and allocation
  A-->>G: remaining credits
  Note over G,A: 429 when exhausted
  G->>I: forward request
  I-->>G: completion plus token usage
  G->>M: credits = ceil tokens / 100
  M->>A: increment used, atomic
  M->>M: record job
  G-->>CL: response plus x-ctree headers`;

/* ------------------------------- page -------------------------------- */

export default function Docs() {
  const mermaidReady = useMermaid();

  useEffect(() => {
    const previous = document.title;
    document.title = 'Docs — Computree';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="page">
      <Navbar />
      <main id="main">
        {/* hero strip */}
        <section className="section" style={{ paddingTop: 150, paddingBottom: 40 }}>
          <div className="container">
            <div className="section-label eyebrow">COMPUTREE DOCUMENTATION</div>
            <h1 className="section-title" style={{ marginTop: 18, maxWidth: 720 }}>
              Everything about the Computree compute access layer.
            </h1>
            <p className="lead" style={{ marginTop: 20, maxWidth: 560 }}>
              How every connected wallet gets daily GPU compute, and how to use it through the
              Playground, Images, Workloads, and the GPU API.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              <span className="docs-chip">Version 1.0</span>
              <span className="docs-chip">Robinhood Chain Mainnet</span>
              <span className="docs-chip">Updated {UPDATED}</span>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 10, paddingBottom: 90 }}>
          <div className="container docs-layout">
            <nav className="docs-nav" aria-label="Documentation sections">
              {NAV_ITEMS.map(([id, label]) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
              ))}
            </nav>

            <div className="docs-content">
              <Section id="overview" label="OVERVIEW" title="What Computree is">
                <p>
                  Computree is a compute access layer connecting <b>tokenized assets</b> with{' '}
                  <b>GPU infrastructure</b>. Every connected wallet receives a daily GPU compute
                  allocation it can spend through one programmable API — staking supported tokenized
                  assets, with tokenized NVDA as the first, is optional and recorded on-chain.
                </p>
                <p>
                  The product is access to computing infrastructure, not another AI interface. The
                  network acquires GPU capacity from multiple infrastructure sources; the API is the
                  interface; the GPU is the underlying resource.
                </p>
                <p>Computree is built for two audiences:</p>
                <ul>
                  <li>
                    <b>Users of AI applications</b> — chat with frontier models, generate images, and
                    run model workloads against a daily allocation instead of a subscription.
                  </li>
                  <li>
                    <b>Developers</b> — integrate the same compute into any application through an
                    OpenAI-compatible GPU API with metered credits.
                  </li>
                </ul>
              </Section>

              <Section id="how-it-works" label="HOW IT WORKS" title="From wallet to compute">
                <p>
                  The flow is deliberately simple: connect, allocate, use, meter, reset. Every
                  cycle lasts 24 hours and every credit is accounted for.
                </p>
                <MermaidBlock chart={CHART_FLOW} ready={mermaidReady} />
                <ul>
                  <li>
                    <b>Connect a wallet</b> — sign in with any wallet on Robinhood Chain. No
                    minimum balance or stake is required.
                  </li>
                  <li>
                    <b>Daily allocation</b> — every account receives 1,000 credits (CR) every day,
                    automatically.
                  </li>
                  <li>
                    <b>Optional staking</b> — stake tokenized NVDA into the on-chain vault any time;
                    your position is read directly from the chain and displayed in the app.
                  </li>
                  <li>
                    <b>Use compute</b> — spend credits in the Playground, Images, Workloads, or
                    through the GPU API.
                  </li>
                  <li>
                    <b>Metered credits</b> — every call is metered and recorded as a job.
                  </li>
                  <li>
                    <b>Reset</b> — the allocation refreshes at 00:00 UTC. Unused credits expire.
                  </li>
                </ul>
              </Section>

              <Section id="staking" label="STAKING" title="Staking &amp; allocation">
                <p>
                  Every connected account on Robinhood Chain receives the daily allocation —{' '}
                  <b>there is no minimum stake</b>. Staking <b>tokenized NVDA</b> into the
                  on-chain vault is optional: it records a long-term position on mainnet that the
                  app reads and displays directly from the chain.
                </p>
                <ul>
                  <li>
                    The daily <b>1,000 CR</b> allocation is active for every account, staked or not.
                  </li>
                  <li>
                    Staking and unstaking happen on Robinhood Chain mainnet — tokens move into the
                    staking vault and can be withdrawn any time.
                  </li>
                  <li>
                    Your staked position is read per request against the chain, so changes take
                    effect without any action on your side.
                  </li>
                </ul>
                <h3 className="docs-h3">Robinhood Chain Mainnet</h3>
                <DataTable
                  head={['Parameter', 'Value']}
                  rows={[
                    ['Network', <Mono>Robinhood Chain</Mono>],
                    ['Chain ID', <Mono>4663</Mono>],
                    ['Gas token', <Mono>ETH · 18 decimals</Mono>],
                    ['Public RPC', <Mono>https://rpc.mainnet.chain.robinhood.com</Mono>],
                    ['Explorer', <Mono>robinhoodchain.blockscout.com</Mono>],
                  ]}
                />
                <h3 className="docs-h3">Position check lifecycle</h3>
                <MermaidBlock chart={CHART_STAKING} ready={mermaidReady} />
              </Section>

              <Section id="allocation" label="ALLOCATION" title="Daily allocation &amp; credits">
                <p>
                  Every account receives <b>1,000 CR per day</b>. A credit (CR) is the
                  metered unit of compute on Computree — it is consumed by inference, image
                  generation, and model workloads, and it is not transferable between accounts or
                  cycles.
                </p>
                <h3 className="docs-h3">What things cost</h3>
                <DataTable
                  head={['Action', 'Cost']}
                  rows={[
                    [
                      'Chat completion',
                      <span>
                        <Mono>ceil(tokens / 100)</Mono> CR — minimum <Mono>1</Mono> CR per call
                      </span>,
                    ],
                    [
                      'Image generation',
                      <span>
                        <Mono>10</Mono> CR per image — up to <Mono>2</Mono> per call
                      </span>,
                    ],
                    [
                      'Embeddings',
                      <span>
                        <Mono>1</Mono> CR per <Mono>200</Mono> tokens — minimum <Mono>1</Mono> CR
                      </span>,
                    ],
                  ]}
                />
                <p>
                  The cycle resets at <b>00:00 UTC</b>: the used counter returns to zero and a fresh
                  1,000 CR becomes available. Reaching zero before reset returns{' '}
                  <Mono>429 daily allocation exhausted</Mono> until the next cycle.
                </p>
                <MermaidBlock chart={CHART_ALLOCATION} ready={mermaidReady} />
              </Section>

              <Section id="features" label="FEATURES" title="The four product functions">
                <h3 className="docs-h3">AI Inference — Playground</h3>
                <p>
                  Chat against frontier models with prompt presets, a system prompt, temperature
                  control, a compare mode that runs two models side by side, and a request inspector
                  showing the exact wire format. Conversation history stays in your browser.
                </p>
                <h3 className="docs-h3">Image Generation</h3>
                <p>
                  Text-to-image generation for <Mono>10 CR</Mono> per image, up to two images per
                  call, with download and full-size preview. Fallback models are tried automatically
                  if the primary is unavailable.
                </p>
                <h3 className="docs-h3">AI Model Workloads</h3>
                <p>
                  Embeddings for experiments and data pipelines at <Mono>1 CR</Mono> per{' '}
                  <Mono>200</Mono> tokens. Up to eight inputs per call; the full vectors are
                  available through the GPU API.
                </p>
                <h3 className="docs-h3">GPU API</h3>
                <p>
                  Programmatic access with <Mono>ct_live_</Mono> API keys. Create and revoke keys at
                  any time; keys are shown in full only once at creation, and usage is tracked per
                  account.
                </p>
                <p>
                  <b>Roadmap.</b> Streaming responses, additional workload types, and expanded GPU
                  provider integrations are in progress.
                </p>
              </Section>

              <Section id="api" label="API" title="API reference">
                <DataTable
                  head={['Item', 'Value']}
                  rows={[
                    ['Base URL', <Mono>https://api.computree.xyz</Mono>],
                    ['Authentication', <Mono>Authorization: Bearer ct_live_…</Mono>],
                    ['Format', 'OpenAI-compatible chat completions'],
                  ]}
                />
                <h3 className="docs-h3">POST /v1/chat/completions — request fields</h3>
                <DataTable
                  head={['Field', 'Type', 'Notes']}
                  rows={[
                    ['model', 'string', 'Required — model identifier from the available catalog'],
                    ['messages', 'array', 'Required — [{ role, content }] conversation'],
                    ['temperature', 'number', 'Optional — 0 to 2, defaults to 1'],
                    ['stream', 'boolean', 'Not yet supported — responses are always non-streaming'],
                  ]}
                />
                <h3 className="docs-h3">Response headers</h3>
                <DataTable
                  head={['Header', 'Meaning']}
                  rows={[
                    [<Mono>x-ctree-credits-used</Mono>, 'Credits charged for this call'],
                    [<Mono>x-ctree-remaining</Mono>, 'Credits remaining in the current cycle'],
                  ]}
                />
                <h3 className="docs-h3">Errors</h3>
                <DataTable
                  head={['Status', 'When']}
                  rows={[
                    [<Mono>401</Mono>, 'Missing, invalid, or revoked API key'],
                    [<Mono>429 · INSUFFICIENT_CREDITS</Mono>, 'Remaining credits below the call cost'],
                    [<Mono>429</Mono>, 'Daily allocation exhausted — resets at 00:00 UTC'],
                  ]}
                />
                <h3 className="docs-h3">Example</h3>
                <pre className="docs-code">{`curl https://api.computree.xyz/v1/chat/completions \\
  -H "Authorization: Bearer ct_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "qwen",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`}</pre>
                <p>
                  Because the API is OpenAI-compatible, you can use it with any OpenAI SDK by
                  changing <Mono>base_url</Mono> to <Mono>https://api.computree.xyz/v1</Mono> and{' '}
                  <Mono>api_key</Mono> to your <Mono>ct_live_</Mono> key.
                </p>
              </Section>

              <Section id="lifecycle" label="LIFECYCLE" title="Request lifecycle">
                <p>
                  Every API request passes through authentication, metering, and
                  recording before the response returns. The inference layer itself is Computree
                  inference infrastructure backed by frontier model providers — the API surface
                  stays identical regardless of which provider executes a given request.
                </p>
                <MermaidBlock chart={CHART_LIFECYCLE} ready={mermaidReady} />
              </Section>

              <Section id="network" label="NETWORK" title="Network &amp; providers">
                <p>
                  Computree acquires GPU capacity through a <b>multi-source provider model</b>{' '}
                  rather than a single cloud. Capacity is orchestrated by the Computree node, which
                  routes workloads to available infrastructure and records every job.
                </p>
                <p>
                  Supported and potential infrastructure sources include <b>Golem</b>,{' '}
                  <b>CoreWeave</b>, <b>Lambda</b>, <b>Nebius</b>, and <b>Crusoe</b>, across NVIDIA
                  GPU classes such as H100, A100, and L40S. Provider availability and capacity are
                  visible in the app under Network.
                </p>
                <p>
                  <b>Transparency principle:</b> every job is recorded with its model, GPU class,
                  provider, duration, and credits — the Jobs page is a live ledger of your compute.
                </p>
              </Section>

              <Section id="treasury" label="TREASURY" title="Treasury">
                <p>
                  The Computree treasury exists to <b>fund infrastructure acquisition</b> — the GPU
                  capacity the network makes available to users. It aggregates protocol resources
                  and deploys them toward compute purchases across the provider network.
                </p>
                <p>
                  Current status: <b>awaiting live on-chain data</b>. Treasury figures in the app
                  are placeholders until the on-chain integration is live.
                </p>
              </Section>

              <Section id="faq" label="FAQ" title="Frequently asked questions">
                {[
                  [
                    'When does my allocation reset?',
                    'Every day at 00:00 UTC. The used counter returns to zero and a fresh 1,000 CR becomes available. Unused credits expire at reset.',
                  ],
                  [
                    'Do I need to stake to get credits?',
                    'No. Every connected account receives 1,000 CR per day automatically — there is no minimum stake. Staking tokenized NVDA on Robinhood Chain mainnet is optional and your position is shown in the app.',
                  ],
                  [
                    'What happens when my credits run out?',
                    'Requests return 429 (daily allocation exhausted) until the next cycle begins at 00:00 UTC. Failed requests are not charged.',
                  ],
                  [
                    'Is streaming supported?',
                    'Not yet. Responses are always returned as complete, non-streaming payloads so that credits can be metered precisely.',
                  ],
                  [
                    'Which models are available?',
                    'Frontier models through the unified API — the catalog evolves over time. The current selection is visible in the Playground model picker.',
                  ],
                  [
                    'How do I get started?',
                    'Connect your wallet in the app and send your first prompt in the Playground. For programmatic access, create a ct_live_ key under API Keys.',
                  ],
                ].map(([q, a]) => (
                  <div className="docs-faq-item" key={q}>
                    <b style={{ fontSize: 13.5 }}>{q}</b>
                    <p style={{ margin: '6px 0 0' }}>{a}</p>
                  </div>
                ))}
              </Section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
