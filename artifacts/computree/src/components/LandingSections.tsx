import type { ReactNode } from 'react';

type IconName = 'application' | 'tree' | 'gpu' | 'result' | 'allocation' | 'clock' | 'api' | 'provider' | 'treasury' | 'network' | 'job' | 'model' | 'render' | 'simulation' | 'developer' | 'route';

function Icon({ name }: { name: IconName }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<IconName, React.ReactNode> = {
    application: <><rect x="4" y="5" width="16" height="14" rx="1.5" /><path d="M8 9h8M8 12h5M9 19v2m6-2v2" /></>,
    tree: <><path d="M12 20V8m0 6-5-4m5 4 5-5M12 17l-4-2m4 2 4-3" /><circle cx="12" cy="7" r="2" /><circle cx="7" cy="10" r="1.5" /><circle cx="17" cy="9" r="1.5" /></>,
    gpu: <><rect x="3" y="5" width="18" height="14" rx="1" /><rect x="7" y="8" width="8" height="8" rx="1" /><circle cx="11" cy="12" r="2" /><path d="M17 9h1m-1 3h1m-1 3h1M6 3v2m4-2v2m4-2v2m4-2v2M6 19v2m4-2v2m4-2v2m4-2v2" /></>,
    result: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    allocation: <><circle cx="12" cy="12" r="9" /><path d="M12 3v9l6 6M8 12h4" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    api: <><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-10-2 12" /></>,
    provider: <><path d="M3 20h18M5 20V8l7-4 7 4v12M9 20v-6h6v6M8 9h.01M16 9h.01" /></>,
    treasury: <><path d="M3 9h18L12 4 3 9Zm2 2v7m4-7v7m6-7v7m4-7v7M3 21h18" /></>,
    network: <><circle cx="12" cy="12" r="2.5" /><circle cx="5" cy="6" r="1.5" /><circle cx="19" cy="6" r="1.5" /><circle cx="5" cy="18" r="1.5" /><circle cx="19" cy="18" r="1.5" /><path d="m10 10-4-3m8 3 4-3m-8 5H7m7 0h3m-7 2-4 3m8-3 4 3" /></>,
    job: <><rect x="5" y="4" width="14" height="17" rx="1.5" /><path d="M9 4.5v-1h6v1M8 9h8m-8 4h8m-8 4h5" /></>,
    model: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.7 7.5 4.4 7.5-4.4M12 12v9m-4-11 8-4.5" /></>,
    render: <><rect x="4" y="4" width="16" height="16" rx="1" /><path d="m9 8 7 4-7 4V8Z" /></>,
    simulation: <><path d="M4 18c3-10 5-10 8-4s5 6 8-5M4 6h.01M20 18h.01" /><path d="M4 20h16M4 4v16" /></>,
    developer: <><path d="m8 8-4 4 4 4m8-8 4 4-4 4m-3-10-2 12" /></>,
    route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h3a3 3 0 0 0 3-3v-3a3 3 0 0 1 3-3h1" /></>,
  };
  return <svg className="line-icon" viewBox="0 0 24 24" aria-hidden="true" {...common}>{paths[name]}</svg>;
}

function SectionIntro({ label, title, body, id, dark = false }: { label?: string; title: string; body?: ReactNode; id?: string; dark?: boolean }) {
  return (
    <div className={`section-intro${dark ? ' section-intro-dark' : ''}`}>
      {label && <div className="section-label eyebrow">{label}</div>}
      <h2 className="section-title" id={id}>{title}</h2>
      {body && <div className="lead">{body}</div>}
    </div>
  );
}

function Artwork({ src, alt, className = '', loading = 'lazy' }: { src: string; alt: string; className?: string; loading?: 'eager' | 'lazy' }) {
  return <img className={`art ${className}`} src={src} alt={alt} loading={loading} />;
}

export function Hero() {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-backdrop-grid" aria-hidden="true" />
        <div className="container hero-content">
          <div className="hero-copy reveal">
            <div className="section-label eyebrow">COMPUTREE</div>
            <h1 className="display">TURN GPU CAPACITY INTO A RESOURCE YOU CAN USE.</h1>
            <p>Computree is an access layer for NVIDIA GPU compute.</p>
            <p>It acquires GPU capacity from the infrastructure market and makes that capacity available through a programmable API.</p>
            <p>Eligible $CTREE holders receive a daily allocation of compute, refreshed every 24 hours, and can use it across supported applications and workloads.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#access" data-testid="link-hero-access">Access GPU Compute <span aria-hidden="true">→</span></a>
              <a className="button button-outline" href="#infrastructure" data-testid="link-hero-infrastructure">Explore Infrastructure <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="hero-art-wrap">
            <Artwork src="/hero-tree.webp" alt="A sculptural computational tree made from circuit branches and GPU infrastructure modules" className="hero-art" loading="eager" />
            <svg className="hero-art-lines" viewBox="0 0 500 500" aria-hidden="true"><path d="M42 115h64v70h60m235 73h-72v78h-86" /><circle cx="106" cy="115" r="3" /><circle cx="329" cy="336" r="3" /></svg>
          </div>
        </div>
        <div className="container hero-trust">
          <span className="section-label">GPU INFRASTRUCTURE ACCESS</span>
          <div className="trust-items"><span>NVIDIA GPU</span><span>Golem</span><span>Additional providers</span></div>
          <span className="trust-note">Infrastructure ecosystem</span>
        </div>
      </section>
    </>
  );
}

export function IntroductionSection() {
  return (
    <section className="section introduction-section" id="introduction">
      <div className="container introduction-layout">
        <div><div className="section-label eyebrow">THE COMPUTE ACCESS LAYER</div><h2 className="section-title">GPU COMPUTE IS BECOMING INFRASTRUCTURE.</h2></div>
        <div className="introduction-copy">
          <p className="lead">The demand for accelerated computing is growing faster than most users can provision it.</p>
          <p>GPU hardware is expensive. Cloud infrastructure is fragmented. Capacity changes constantly.</p>
          <p>Computree abstracts that complexity into a single compute access layer.</p>
          <div className="intro-contrasts"><p><span>01</span>Instead of owning the machine, you access the capacity.</p><p><span>02</span>Instead of managing the infrastructure, you use the API.</p><p><span>03</span>Instead of paying for an individual GPU fleet, Computree acquires capacity from the infrastructure market and distributes access through the network.</p></div>
        </div>
      </div>
    </section>
  );
}

export function InfrastructureIntro() {
  const pains = ['HIGH HARDWARE COST', 'COMPLEX INFRASTRUCTURE', 'LIMITED AVAILABILITY', 'MANUAL PROVISIONING', 'FRAGMENTED PROVIDERS'];
  return (
    <section className="problem-section dark-section" id="product">
      <div className="container problem-layout">
        <div className="problem-copy">
          <div className="section-label eyebrow">THE PROBLEM</div>
          <h2 className="section-title">GPU COMPUTE IS EXPENSIVE AND COMPLEX.</h2>
          <p className="lead">Accessing NVIDIA GPU infrastructure usually means purchasing hardware, managing cloud accounts, provisioning machines, dealing with fragmented providers, and continuously managing capacity.</p>
          <p className="problem-solution">Computree abstracts that complexity into a single compute access layer.</p>
        </div>
        <div className="hardware-frame">
          <Artwork src="/gpu-hardware.webp" alt="Generic graphite GPU compute server hardware with detailed cooling fins" />
          <span className="hardware-tag mono">COMPUTE / INFRASTRUCTURE LAYER</span>
        </div>
        <div className="pain-points">
          {pains.map((pain, index) => <div className="pain-item" key={pain}><span className="pain-index mono">0{index + 1}</span><span>{pain}</span><span className="pain-indicator" /></div>)}
        </div>
      </div>
    </section>
  );
}

export function ComputeFlow() {
  const stages = [
    { icon: 'application' as const, title: 'APPLICATION', desc: 'Your software, model, or workload.' },
    { icon: 'tree' as const, title: 'COMPUTREE', desc: 'Access, allocation, routing and orchestration.' },
    { icon: 'gpu' as const, title: 'GPU INFRASTRUCTURE', desc: 'Capacity acquired from supported providers.' },
    { icon: 'gpu' as const, title: 'NVIDIA GPU', desc: 'Accelerated computing.' },
    { icon: 'result' as const, title: 'RESULT', desc: 'Returned to your application.' },
  ];
  return (
    <section className="section solution-section" id="how-it-works">
      <div className="container">
        <SectionIntro title="ACCESS THE HARDWARE WITHOUT OWNING IT." body={<>Computree acquires GPU capacity from supported infrastructure providers and makes that capacity available through a single API.<br /><br />Computree is built around a simple separation.<br /><br />The infrastructure belongs to the providers.<br /><br />The compute capacity is acquired by the network.<br /><br />The applications belong to the users.<br /><br />Computree connects them.</>} />
        <div className="flow-line-wrap">
          <div className="flow-track" aria-hidden="true"><svg viewBox="0 0 1000 40" preserveAspectRatio="none"><path className="flow-line" d="M0 20H1000" /></svg></div>
          <div className="flow-stages">
            {stages.map((stage, index) => <div className="flow-stage" key={stage.title}><div className="flow-icon"><Icon name={stage.icon} /></div><h3>{stage.title}</h3><p>{stage.desc}</p>{index < stages.length - 1 && <span className="flow-arrow" aria-hidden="true">→</span>}</div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTREEAllocation() {
  return (
    <section className="section dark-section allocation-section" id="ctree">
      <div className="container allocation-layout">
        <div className="allocation-copy">
          <div className="section-label eyebrow">$CTREE</div>
          <div className="allocation-promise">YOUR $CTREE BALANCE BECOMES COMPUTE ACCESS.</div>
          <h2 className="section-title">$CTREE DETERMINES YOUR COMPUTE ALLOCATION.</h2>
          <p className="lead">$CTREE is the access mechanism for the Computree network.</p>
          <p className="lead">Eligible holders receive compute allocation based on their qualifying token balance.</p>
          <p className="lead">The more eligible $CTREE associated with your account, the greater your available daily allocation.</p>
          <p className="lead">Your allocation can be consumed across supported workloads and applications.</p>
          <p className="lead">It is not ownership of a specific machine.</p>
          <p className="lead">It is access to compute capacity acquired by the network.</p>
        </div>
        <AllocationDashboard />
      </div>
    </section>
  );
}

function AllocationDashboard() {
  return (
    <div className="allocation-dashboard" aria-label="Illustrative daily compute allocation dashboard">
      <div className="dashboard-top"><div><span className="section-label">YOUR COMPUTE</span><div className="dashboard-status"><i /> Allocation active</div></div><span className="demo-badge">DEMO DATA</span></div>
      <div className="allocation-total"><span>DAILY COMPUTE</span><strong>1,000</strong><small>Credits Available</small></div>
      <div className="allocation-stats">
        <div className="usage-ring"><div><b>35%</b><small>USED</small></div></div>
        <div className="allocation-numbers"><div><span>USED</span><b>347</b><small>Credits Used</small></div><div><span>REMAINING</span><b>653</b><small>Credits Remaining</small></div><div><span>RESET</span><b className="reset-time">11:42:18</b><small>Until Refresh</small></div></div>
      </div>
      <div className="allocation-progress"><i /></div>
      <div className="allocation-foot"><span>Allocation refreshes every 24 hours</span><span className="mono">ILLUSTRATIVE VIEW</span></div>
    </div>
  );
}

export function DailyReset() {
  const timeline = ['ALLOCATION', 'COMPUTE USAGE', '24 HOURS', 'REFRESH', 'NEW ALLOCATION'];
  return (
    <section className="section reset-section" id="compute">
      <div className="container reset-layout">
        <div><div className="section-label eyebrow">A FRESH COMPUTE ALLOCATION EVERY 24 HOURS.</div><SectionIntro title="YOUR ALLOCATION REFRESHES EVERY 24 HOURS." body={<>Computree is designed around a recurring compute allocation rather than a traditional cloud subscription.<br /><br />At the beginning of each cycle, your eligible $CTREE balance determines your available allocation.<br /><br />Use your compute throughout the day.<br /><br />Your remaining allocation expires at the end of the cycle.<br /><br />The next cycle begins with a fresh allocation.</>} /></div>
        <div className="reset-diagram">
          <div className="reset-diagram-head"><span className="section-label">DAILY COMPUTE</span><span className="demo-badge">DEMO DATA</span></div>
          <div className="timeline">
            {timeline.map((item, index) => <div className={`timeline-step${index === 2 ? ' timeline-current' : ''}`} key={item}><span className="timeline-index mono">0{index + 1}</span><span>{item}</span>{index < timeline.length - 1 && <span className="timeline-arrow" aria-hidden="true">↓</span>}</div>)}
          </div>
          <div className="refresh-clock"><Icon name="clock" /><div><span>Until Refresh</span><strong>11:42:18</strong></div><span className="clock-live-dot" /></div>
          <p className="visual-note">The countdown is illustrative; real allocation timing can be supplied by the service.</p>
        </div>
      </div>
    </section>
  );
}

export function ApplicationSection() {
  const applications = [
    { name: 'OPEN WEBUI', icon: 'application' as const, body: 'Connect an existing AI interface to your Computree allocation.' },
    { name: 'LIBRECHAT', icon: 'route' as const, body: 'Access supported workloads through another OpenAI-compatible interface.' },
    { name: 'YOUR APPLICATION', icon: 'api' as const, body: 'Build directly against the Computree API and decide how GPU compute fits into your product.' },
  ];
  return (
    <section className="section applications-section soft-section" id="applications">
      <div className="container">
        <div className="application-heading"><div><div className="section-label eyebrow">USE COMPUTE THROUGH THE APPLICATIONS YOU ALREADY USE.</div><SectionIntro title="BUILD ON TOP OF COMPUTREE." body={<>Computree is designed to become an infrastructure layer rather than another end-user AI application.<br /><br />Use supported applications such as Open WebUI and LibreChat, or integrate the API directly into your own product.</>} /></div><a className="text-link" href="#api" data-testid="link-applications-api">Compute through one API <span aria-hidden="true">→</span></a></div>
        <div className="application-grid">{applications.map((app) => <article className="application-card" key={app.name}><div className="application-card-top"><span className="app-icon"><Icon name={app.icon} /></span><span className="app-card-arrow" aria-hidden="true">↗</span></div><h3>{app.name}</h3><p>{app.body}</p><a href="#api" data-testid={`link-application-${app.name.toLowerCase().replaceAll(' ', '-')}`}>Learn More <span aria-hidden="true">→</span></a></article>)}</div>
        <div className="application-footnote"><span>Compatibility examples</span><span>The interface can change. The infrastructure remains behind the API.</span></div>
      </div>
    </section>
  );
}

export function ApiSection() {
  return (
    <section className="section api-section" id="developers">
      <div className="container api-layout">
        <div className="api-copy"><div className="section-label eyebrow">ONE API FOR GPU COMPUTE.</div><h2 className="section-title">COMPUTE THROUGH ONE API.</h2><p className="lead">Your compute allocation is not restricted to a proprietary interface.</p><p className="lead">Computree exposes a programmable API that applications can connect to directly.</p><p className="lead">Compatible applications can use the same infrastructure without needing to understand the underlying GPU provider.</p><a className="api-address mono" href="#api" data-testid="link-api-reference">https://api.computree.ai/v1 <span aria-hidden="true">↗</span></a><p className="api-flow-copy">The application sends a request.<br />Computree validates the account and available allocation.<br />The workload is routed to available infrastructure.<br />The result is returned to the application.</p></div>
        <div className="api-panel" id="api">
          <div className="code-window-bar"><span className="code-dots"><i /><i /><i /></span><span className="mono">REQUEST EXAMPLE</span><span className="code-method">POST</span></div>
          <div className="code-body"><div className="code-line"><span className="line-number">01</span><span><b>POST</b> /v1/chat/completions</span></div><div className="code-line"><span className="line-number">02</span><span>Authorization: Bearer <em>ct_live_xxxxx</em></span></div><div className="code-line"><span className="line-number">03</span><span>Content-Type: application/json</span></div><div className="code-spacer" /><div className="code-line"><span className="line-number">04</span><span>{'{'}</span></div><div className="code-line"><span className="line-number">05</span><span>&nbsp; "model": <em>"qwen"</em>,</span></div><div className="code-line"><span className="line-number">06</span><span>&nbsp; "messages": [</span></div><div className="code-line"><span className="line-number">07</span><span>&nbsp;&nbsp;&nbsp; {'{'}</span></div><div className="code-line"><span className="line-number">08</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "role": <em>"user"</em>,</span></div><div className="code-line"><span className="line-number">09</span><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; "content": <em>"Hello"</em></span></div><div className="code-line"><span className="line-number">10</span><span>&nbsp;&nbsp;&nbsp; {'}'}</span></div><div className="code-line"><span className="line-number">11</span><span>&nbsp; ]</span></div><div className="code-line"><span className="line-number">12</span><span>{'}'}</span></div></div>
          <div className="request-flow">{['APPLICATION', 'API', 'COMPUTE', 'RESPONSE'].map((step, i) => <span key={step}>{step}{i < 3 && <i aria-hidden="true">→</i>}</span>)}</div>
          <div className="example-note">Example request structure. Credential shown is not real.</div>
        </div>
      </div>
    </section>
  );
}

export function InfrastructureSection() {
  const layers = [
    ['TREASURY', 'Infrastructure funding', 'treasury'],
    ['COMPUTE ACQUISITION', 'Capacity acquired by the network', 'allocation'],
    ['INFRASTRUCTURE PROVIDER', 'Supported infrastructure source', 'provider'],
    ['NVIDIA GPU', 'Accelerated computing', 'gpu'],
    ['COMPUTREE', 'Access and orchestration', 'tree'],
    ['USER', 'Applications and workloads', 'application'],
  ] as const;
  return (
    <section className="section dark-section infrastructure-section" id="infrastructure">
      <div className="container">
        <div className="infra-header"><SectionIntro label="INFRASTRUCTURE" title="THE NETWORK ACQUIRES THE COMPUTE." body={<>Computree separates compute acquisition from compute consumption.<br /><br />The network can acquire GPU capacity from supported infrastructure providers and compute networks.<br /><br />The initial infrastructure layer can use decentralized compute infrastructure such as Golem, while additional GPU providers can be integrated over time.<br /><br />This allows Computree to expand its available capacity without requiring users to establish and manage individual infrastructure accounts.</>} dark /><a className="button button-outline-light" href="#providers">Explore Infrastructure <span aria-hidden="true">→</span></a></div>
        <Artwork src="/acquisition-flow.webp" alt="Four technical infrastructure objects representing treasury, compute acquisition, provider network, and GPU infrastructure" className="infra-art" />
        <div className="infra-layer-flow">{layers.map(([name, desc, icon], index) => <div className="infra-layer" key={name}><div className="infra-layer-icon"><Icon name={icon} /></div><span className="section-label">{name}</span><p>{desc}</p>{index < layers.length - 1 && <span className="infra-arrow" aria-hidden="true">→</span>}</div>)}</div>
        <p className="infra-caveat">Infrastructure visualization. Provider and capacity availability depends on configuration.</p>
      </div>
    </section>
  );
}

export function NvidiaSection() {
  return (
    <section className="section nvidia-section" id="hardware">
      <div className="container nvidia-layout">
        <div className="nvidia-art"><Artwork src="/gpu-hardware.webp" alt="Generic GPU server hardware and cooling structures" /><span className="hardware-tag mono">GPU INFRASTRUCTURE / HARDWARE LAYER</span></div>
        <div><div className="section-label eyebrow">GPU INFRASTRUCTURE</div><h2 className="section-title">NVIDIA GPU INFRASTRUCTURE.</h2><p className="lead">NVIDIA GPUs form the primary hardware layer for supported accelerated workloads.</p><p className="lead">Computree does not require users to own or operate those machines.</p><p className="lead">Instead, the network can acquire capacity from infrastructure providers that operate NVIDIA GPU environments.</p><p className="lead">The provider layer can evolve over time.</p><p className="lead">The Computree API remains consistent.</p></div>
      </div>
    </section>
  );
}

export function ProviderNetwork() {
  const sources = ['Golem', 'CoreWeave', 'Lambda', 'Nebius', 'Crusoe', 'Other Providers'];
  return (
    <section className="section provider-section soft-section" id="providers">
      <div className="container">
        <div className="provider-head"><SectionIntro title="ONE ACCESS LAYER. MULTIPLE INFRASTRUCTURE SOURCES." body={<>Computree is designed so the public API does not depend on a single infrastructure provider.<br /><br />A provider can supply compute capacity without becoming the product itself.<br /><br />This creates a modular infrastructure layer where additional GPU providers can be added according to availability, pricing, geography, hardware and workload requirements.<br /><br />The user sees one system.<br /><br />Computree manages the underlying infrastructure.</>} /><div className="source-disclaimer">SUPPORTED AND POTENTIAL INFRASTRUCTURE SOURCES</div></div>
        <div className="provider-visual"><Artwork src="/provider-network.webp" alt="Conceptual world map topology visualizing distributed GPU compute nodes and connections" /><div className="map-center"><span className="map-logo"><img src="/computree-logo-black.png" alt="" /></span><span>COMPUTREE</span></div><span className="map-caption mono">CONCEPTUAL INFRASTRUCTURE TOPOLOGY</span></div>
        <div className="provider-tags">{sources.map((name) => <div key={name}><span className="provider-node" />{name}<span className="provider-kind">POTENTIAL</span></div>)}</div>
      </div>
    </section>
  );
}

const DEMO_JOBS = [
  { id: 'job_82f…', model: 'Qwen', gpu: 'A100', duration: '2m 14s', usage: '12 credits', status: 'Completed' },
  { id: 'job_71a…', model: 'Llama', gpu: 'H100', duration: '5m 41s', usage: '28 credits', status: 'Completed' },
  { id: 'job_90c…', model: 'SDXL', gpu: 'H100', duration: '12m 03s', usage: '64 credits', status: 'Running' },
];

export function TransparencySection() {
  return (
    <section className="section transparency-section" id="transparency">
      <div className="container">
        <div className="transparency-heading"><SectionIntro title="KNOW WHAT YOUR COMPUTE IS DOING." body={<>GPU compute should not disappear behind an opaque credit number.<br /><br />Computree tracks workload activity across the infrastructure layer.</>} /><div className="demo-badge demo-badge-outline">DEMO DATA · VISUAL MOCK RECORDS</div></div>
        <div className="transparency-dashboard">
          <div className="dash-topbar"><div className="dash-title"><span className="mini-computree-mark"><Icon name="tree" /></span><span>Recent Jobs</span></div><span className="dash-view mono">VISUAL EXAMPLE</span></div>
          <div className="table-wrap"><table className="data-table"><thead><tr>{['JOB ID', 'MODEL', 'GPU', 'DURATION', 'USAGE', 'STATUS'].map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{DEMO_JOBS.map((job) => <tr key={job.id}><td className="mono">{job.id}</td><td>{job.model}</td><td>{job.gpu}</td><td>{job.duration}</td><td>{job.usage}</td><td><span className={`status-pill${job.status === 'Running' ? ' status-running' : ''}`}>{job.status}</span></td></tr>)}</tbody></table></div>
          <div className="dash-foot"><span>Mock records only. Not connected to production.</span><span className="mono">DATA SOURCE: REPLACEABLE</span></div>
        </div>
        <div className="transparency-metrics">{[['JOBS', 'Every workload receives its own execution record.'], ['GPU', 'The actual GPU class when reported by the underlying provider.'], ['RUNTIME', 'How long the workload executed.'], ['USAGE', 'How much compute was consumed.'], ['PROVIDER', 'The infrastructure source when available.'], ['COST', 'The underlying compute cost when available.']].map(([heading, desc]) => <div key={heading}><span className="section-label">{heading}</span><p>{desc}</p></div>)}</div>
      </div>
    </section>
  );
}

export function TreasurySection() {
  return (
    <section className="section treasury-section soft-section" id="treasury">
      <div className="container">
        <SectionIntro title="FOLLOW THE COMPUTE." body={<>The infrastructure dashboard connects compute usage with the resources required to provide it.<br /><br />View:</>} />
        <div className="treasury-overview">{[['TREASURY', 'Available infrastructure funding.', 'treasury'], ['COMPUTE PURCHASES', 'Capacity acquired from providers.', 'provider'], ['GPU CAPACITY', 'Available and active compute.', 'gpu'], ['WORKLOADS', 'Jobs currently executing or completed.', 'job'], ['USAGE', 'Compute consumed across accounts.', 'allocation'], ['TRANSACTIONS', 'Relevant infrastructure funding activity.', 'route']].map(([title, desc, icon]) => <article className="treasury-tile" key={title}><Icon name={icon as IconName} /><span className="section-label">{title}</span><p>{desc}</p></article>)}</div>
        <p className="treasury-statement">The objective is straightforward:<br /><strong>Make the relationship between capital, infrastructure and compute visible.</strong></p>
        <div className="transactions-panel"><div className="dash-topbar"><div className="dash-title"><Icon name="route" />Infrastructure funding activity</div><span className="awaiting-indicator"><i /> Awaiting live transaction data</span></div><div className="table-wrap"><table className="data-table"><thead><tr>{['DATE', 'ASSET', 'AMOUNT', 'NETWORK', 'PURPOSE', 'TX'].map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody><tr><td colSpan={6} className="empty-table">Awaiting live transaction data</td></tr></tbody></table></div><div className="demo-caption">Transaction activity appears when live data is available.</div></div>
      </div>
    </section>
  );
}

export function WorkloadSection() {
  const items = [['AI INFERENCE', 'Run supported open models through GPU-backed infrastructure.', 'model'], ['MODEL WORKLOADS', 'Execute custom model workloads.', 'gpu'], ['RENDERING', 'Use GPU capacity for supported rendering pipelines.', 'render'], ['SIMULATION', 'Run compute-intensive GPU workloads.', 'simulation'], ['DEVELOPER WORKLOADS', 'Build applications that require accelerated computing.', 'developer']] as const;
  return (
    <section className="section workload-section" id="workloads">
      <div className="container">
        <div className="workload-heading"><SectionIntro title="BUILT FOR GPU-INTENSIVE WORKLOADS." body="The interface can change. The infrastructure remains behind the API." /><a className="text-link" href="#api">Compute through one API <span aria-hidden="true">→</span></a></div>
        <div className="workload-grid">{items.map(([title, desc, icon]) => <article className="workload-item" key={title}><div className="workload-icon"><Icon name={icon} /></div><div className="section-label">{title}</div><p>{desc}</p></article>)}</div>
        <p className="visual-note">Workload availability depends on supported implementations.</p>
      </div>
    </section>
  );
}

export function ArchitectureSection() {
  const layers = ['$CTREE', 'ELIGIBILITY', 'DAILY ALLOCATION', 'COMPUTREE API', 'AUTHENTICATION', 'USAGE METERING', 'WORKLOAD ORCHESTRATION', 'GPU PROVIDER', 'NVIDIA GPU', 'RESULT'];
  return (
    <section className="section architecture-section dark-section" id="architecture">
      <img className="architecture-network-art" src="/compute-network.webp" alt="" aria-hidden="true" loading="lazy" />
      <div className="container">
        <div className="architecture-heading"><SectionIntro title="COMPUTE IS THE PRODUCT." body={<>Computree is not built around selling another AI interface.<br /><br />The product is access to computing infrastructure.<br /><br />The API is the interface.<br /><br />The GPU is the underlying resource.<br /><br />The network acquires the capacity.<br /><br />$CTREE determines access.<br /><br />Users decide what to build with it.</>} dark /></div>
        <div className="architecture-flow">{layers.map((layer, index) => <div className={`architecture-layer${index === 0 || index === 9 ? ' architecture-highlight' : ''}`} key={layer}><span className="architecture-index mono">0{index + 1}</span><span>{layer}</span>{index < layers.length - 1 && <span className="architecture-down" aria-hidden="true">↓</span>}</div>)}</div>
      </div>
    </section>
  );
}

export function TokenFlowSection() {
  const steps = ['$CTREE', 'COMPUTE ALLOCATION', 'COMPUTREE API', 'GPU INFRASTRUCTURE', 'NVIDIA GPU', 'WORKLOAD', 'RESULT'];
  return (
    <section className="section token-flow-section" id="token-flow">
      <div className="container token-flow-layout"><div><SectionIntro title="FROM TOKEN ACCESS TO PHYSICAL COMPUTE." body={<>A qualifying $CTREE balance gives an account access to a measurable amount of daily compute.<br /><br />That compute is backed by infrastructure acquired by the network.<br /><br />The workload executes on GPU infrastructure.<br /><br />The result returns to the application.<br /><br />The entire process can be represented in one flow:</>} /></div><div className="token-flow">{steps.map((step, index) => <div className="token-flow-step" key={step}><span className="token-step-index mono">0{index + 1}</span><span>{step}</span>{index < steps.length - 1 && <span aria-hidden="true">↓</span>}</div>)}</div></div>
    </section>
  );
}

export function ExpansionSection() {
  return (
    <section className="section expansion-section soft-section" id="expansion">
      <div className="container expansion-layout"><div><SectionIntro title="DESIGNED TO EXPAND WITH GPU DEMAND." body={<>As demand for accelerated computing grows, Computree can expand the infrastructure available to its users.<br /><br />Additional providers.<br /><br />Additional GPU capacity.<br /><br />Additional workloads.<br /><br />Additional applications.<br /><br />The user does not need to change how they connect.<br /><br />They continue using the same API and allocation system.</>} /><a className="text-link" href="#infrastructure" data-testid="link-expansion-infrastructure">Explore Infrastructure <span aria-hidden="true">→</span></a></div><div className="expansion-art"><Artwork src="/provider-network.webp" alt="Conceptual global GPU infrastructure topology with connected compute nodes" /><div className="expansion-overlay"><span className="section-label">ONE API</span><span className="mono">CONCEPTUAL NETWORK VISUALIZATION</span></div></div></div>
    </section>
  );
}

export function ModelSection() {
  const rows = [
    ['$CTREE', 'Determines eligibility and compute allocation.', 'allocation'],
    ['COMPUTREE', 'Provides the access and orchestration layer.', 'tree'],
    ['GPU PROVIDERS', 'Supply computing capacity.', 'provider'],
    ['NVIDIA GPUs', 'Execute accelerated workloads.', 'gpu'],
    ['APPLICATIONS', 'Consume the resulting compute.', 'application'],
    ['TREASURY', 'Funds the infrastructure acquisition layer.', 'treasury'],
  ] as const;
  return <section className="section model-section" id="model"><div className="container model-layout"><SectionIntro title="THE COMPUTREE MODEL" /><div className="model-rows">{rows.map(([name, desc, icon]) => <div className="model-row" key={name}><Icon name={icon} /><b>{name}</b><span>{desc}</span></div>)}</div></div></section>;
}

export function FinalCTA() {
  return (
    <section className="final-cta dark-section" id="access">
      <Artwork src="/dark-compute-landscape.webp" alt="" className="cta-art" />
      <div className="cta-overlay" />
      <div className="container cta-content"><div className="section-label eyebrow">COMPUTREE</div><h2 className="section-title">COMPUTE IS THE PRODUCT.</h2><h3 className="cta-secondary-title">ACCESS GPU COMPUTE.</h3><p>Access NVIDIA GPU-backed compute through a programmable API.</p><p>Your $CTREE balance determines your daily allocation.</p><p>The network acquires the infrastructure.</p><p>Your application decides what to build with it.</p><p>Computree turns GPU capacity into a resource that applications can access through one programmable interface.</p><p>Eligible $CTREE holders receive daily compute allocation.</p><p>Infrastructure is acquired by the network.</p><p>Workloads run on supported GPU environments.</p><p>Your application receives the result.</p><div className="cta-buttons"><a className="button button-light" href="#api">Access GPU Compute <span aria-hidden="true">→</span></a><a className="button button-outline-light" href="#api">Read the Documentation <span aria-hidden="true">→</span></a></div></div>
    </section>
  );
}

export function FlowSolutionSection() {
  return (
    <section className="section solution-details">
      <div className="container details-grid">
        <div><span className="section-label eyebrow">THE MODEL</span><h2 className="section-title">ONE ACCESS LAYER. MULTIPLE INFRASTRUCTURE SOURCES.</h2><p className="lead">The user sees one system.<br /><br />Computree manages the underlying infrastructure.</p></div>
        <div className="detail-points">{[['TREASURY', '↓'], ['COMPUTE ACQUISITION', '↓'], ['INFRASTRUCTURE PROVIDER', '↓'], ['NVIDIA GPU', '↓'], ['COMPUTREE', '↓'], ['USER', '']].map(([name, arrow]) => <div className="detail-point" key={name}><span>{name}</span><span aria-hidden="true">{arrow}</span></div>)}</div>
      </div>
    </section>
  );
}
