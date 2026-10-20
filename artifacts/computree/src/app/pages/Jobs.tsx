import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FeatureBanner } from '../components/FeatureBanner';
import { Panel, RelativeTime, StatusPill } from '../components/StatusPill';
import { TypedLines } from '../components/TypedLines';
import { useJobs } from '../mock/hooks';
import { ModelMark, PipelineArt2 } from '../components/AppVisuals';
import { MODEL_LABELS } from '../mock/data';
import type { ComputeJob, GpuClass, JobStatus, ModelId } from '../mock/data';

const MODELS: ModelId[] = ['qwen', 'llama', 'sdxl', 'whisper'];
const GPUS: GpuClass[] = ['A100', 'H100', 'L40S'];
const STATUSES: JobStatus[] = ['completed', 'running', 'failed', 'queued'];

type SortKey = 'startedAt' | 'durationSec' | 'credits';

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function logLines(job: ComputeJob): string[] {
  const done = job.status === 'completed' || job.status === 'failed';
  const lines = [
    `$ ctree logs ${job.id}`,
    `[+0.000s] queued · waiting for capacity`,
    `[+${(job.queueMs / 1000).toFixed(3)}s] routed · provider=${job.provider.toLowerCase()} gpu=${job.gpu.toLowerCase()}`,
    `[+${((job.queueMs + 400) / 1000).toFixed(3)}s] running · model=${job.model} warmup=ok`,
  ];
  if (done) {
    lines.push(`[+${(job.durationSec).toFixed(3)}s] tokens_in=${job.tokensIn} tokens_out=${job.tokensOut}`);
    if (job.status === 'completed') {
      lines.push(`[+${(job.durationSec + 0.2).toFixed(3)}s] completed · credits=${job.credits.toFixed(1)} latency=${job.latencyMs}ms`);
    } else {
      lines.push(`[+${(job.durationSec + 0.2).toFixed(3)}s] failed · exit_code=1 · credits_refunded=${job.credits.toFixed(1)}`);
    }
  } else if (job.status === 'running') {
    lines.push(`[live] streaming output · tokens_out=${Math.floor(job.tokensOut / 2)}…`);
  }
  return lines;
}

function timelineSteps(job: ComputeJob): Array<{ label: string; ts: number | null }> {
  const queued = job.startedAt - job.queueMs;
  const routed = job.startedAt - Math.floor(job.queueMs / 2);
  const end = job.startedAt + job.durationSec * 1000;
  const terminalLabel = job.status === 'failed' ? 'FAILED' : 'COMPLETED';
  const steps: Array<{ label: string; ts: number | null }> = [
    { label: 'QUEUED', ts: queued },
    { label: 'ROUTED', ts: routed },
    { label: 'RUNNING', ts: job.startedAt },
    { label: terminalLabel, ts: job.status === 'queued' || job.status === 'running' ? null : end },
  ];
  if (job.status === 'queued') {
    steps[1] = { label: 'ROUTED', ts: null };
    steps[2] = { label: 'RUNNING', ts: null };
  }
  return steps;
}

function JobDrawer({ job, onClose }: { job: ComputeJob | null; onClose: () => void }) {
  const lines = useMemo(() => (job ? logLines(job) : []), [job]);
  return (
    <Sheet open={job !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-[min(420px,94vw)] sm:max-w-[420px] rounded-none p-0 gap-0 overflow-y-auto">
        {job ? (
          <div>
            <SheetHeader className="px-4 py-3 border-b border-border text-left space-y-0" style={{ paddingRight: 44 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <SheetTitle className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{job.id}</SheetTitle>
                <StatusPill status={job.status} />
              </div>
              <div className="app-meta" style={{ marginTop: 6 }}>
                {job.model.toUpperCase()} · {job.gpu} · {job.provider.toUpperCase()}
              </div>
            </SheetHeader>

            <div className="app-meta" style={{ padding: '14px 16px 6px' }}>EXECUTION TIMELINE</div>
            <div style={{ padding: '0 16px 6px' }}>
              {timelineSteps(job).map((step, index, arr) => (
                <div key={step.label}>
                  <div className="app-timeline-step" style={{ borderBottom: 'none', minHeight: 30 }}>
                    <span style={{ fontWeight: 700, fontSize: 10 }}>{step.label}</span>
                    <span />
                    <span className="mono" style={{ fontSize: 9, color: step.ts ? 'var(--asub)' : 'var(--ameta)' }}>
                      {step.ts ? format(step.ts, 'HH:mm:ss') : '-'}
                    </span>
                  </div>
                  {index < arr.length - 1 ? (
                    <div className="mono" style={{ padding: '0 0 0 34px', color: 'var(--ameta)', fontSize: 10, lineHeight: 1 }}>↓</div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="app-meta" style={{ padding: '14px 16px 6px' }}>METRICS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px 14px' }}>
              <div className="app-metric"><span className="app-meta">DURATION</span><b>{job.durationSec}s</b></div>
              <div className="app-metric"><span className="app-meta">CREDITS</span><b>{job.credits.toFixed(1)}</b></div>
              <div className="app-metric"><span className="app-meta">QUEUE</span><b>{job.queueMs}ms</b></div>
              <div className="app-metric"><span className="app-meta">LATENCY</span><b>{job.latencyMs}ms</b></div>
              <div className="app-metric"><span className="app-meta">TOKENS IN</span><b>{job.tokensIn.toLocaleString('en-US')}</b></div>
              <div className="app-metric"><span className="app-meta">TOKENS OUT</span><b>{job.tokensOut.toLocaleString('en-US')}</b></div>
            </div>

            <div className="app-meta" style={{ padding: '4px 16px 8px' }}>LOGS</div>
            <div style={{ padding: '0 16px 20px' }}>
              <div className="api-panel">
                <div className="code-window-bar">
                  <div className="code-dots"><i /><i /><i /></div>
                  LOG STREAM
                  <span className="code-method">{job.status.toUpperCase()}</span>
                </div>
                <TypedLines lines={lines} speed={16} numbered={false} pause={2600} />
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function FilterGroup({ label, values, selected, onToggle, withModelMarks = false }: { label: string; values: string[]; selected: string[]; onToggle: (v: string) => void; withModelMarks?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span className="app-meta">{label}</span>
      {values.map((value) => (
        <button
          key={value}
          className={`app-filter-chip${selected.includes(value) ? ' is-on' : ''}`}
          onClick={() => onToggle(value)}
        >
          {withModelMarks ? <ModelMark model={value as ModelId} size={12} /> : null}
          {withModelMarks ? MODEL_LABELS[value as ModelId] : value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Jobs() {
  const { data, isLoading } = useJobs();
  const [models, setModels] = useState<ModelId[]>([]);
  const [gpus, setGpus] = useState<GpuClass[]>([]);
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('startedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<ComputeJob | null>(null);

  const jobs = useMemo(() => {
    let list = data ?? [];
    if (models.length) list = list.filter((j) => models.includes(j.model));
    if (gpus.length) list = list.filter((j) => gpus.includes(j.gpu));
    if (statuses.length) list = list.filter((j) => statuses.includes(j.status));
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((j) => j.id.includes(q) || j.model.includes(q) || j.provider.toLowerCase().includes(q));
    return [...list].sort((a, b) => {
      const diff = a[sortKey] - b[sortKey];
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [data, models, gpus, statuses, search, sortKey, sortDir]);

  const sortBy = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? <ArrowUp size={9} style={{ display: 'inline', verticalAlign: 0 }} /> : <ArrowDown size={9} style={{ display: 'inline', verticalAlign: 0 }} />) : null;

  const hasFilters = models.length + gpus.length + statuses.length > 0 || search.length > 0;

  return (
    <div>
      <FeatureBanner feature="jobs" title="Jobs" meta="Compute workloads across the network" />
      <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
        <FilterGroup label="MODEL" values={MODELS} selected={models} onToggle={(v) => setModels((l) => toggleIn(l, v as ModelId))} withModelMarks />
        <FilterGroup label="GPU" values={GPUS} selected={gpus} onToggle={(v) => setGpus((l) => toggleIn(l, v as GpuClass))} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <FilterGroup label="STATUS" values={STATUSES} selected={statuses} onToggle={(v) => setStatuses((l) => toggleIn(l, v as JobStatus))} />
          <span style={{ flex: 1 }} />
          <div style={{ position: 'relative', width: 'min(240px, 100%)' }}>
            <Search size={12} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--ameta)' }} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH JOBS…"
              className="rounded-none h-[30px] pl-7 text-[10px] font-mono tracking-wider"
              data-testid="input-job-search"
            />
          </div>
          {hasFilters ? (
            <button className="app-filter-chip" onClick={() => { setModels([]); setGpus([]); setStatuses([]); setSearch(''); }}>
              <X size={10} /> CLEAR
            </button>
          ) : null}
        </div>
      </div>

      <Panel title="Jobs" right={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}><span style={{ width: 170, height: 52 }} aria-hidden="true"><PipelineArt2 /></span><span className="app-meta">{jobs.length} of {data?.length ?? 0}</span></span>} flush>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>JOB</th>
                <th>MODEL</th>
                <th>GPU</th>
                <th className="app-th-sort" onClick={() => sortBy('durationSec')}>DURATION {sortIcon('durationSec')}</th>
                <th className="app-th-sort" onClick={() => sortBy('credits')}>CREDITS {sortIcon('credits')}</th>
                <th>STATUS</th>
                <th className="app-th-sort" style={{ textAlign: 'right' }} onClick={() => sortBy('startedAt')}>STARTED {sortIcon('startedAt')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 6 }, (_, i) => (
                    <tr key={i}>
                      <td colSpan={7}><div className="app-skel" style={{ height: 14 }} /></td>
                    </tr>
                  ))
                : jobs.map((job) => (
                    <tr key={job.id} className="app-table-row" onClick={() => setSelected(job)} data-testid={`row-job-${job.id}`}>
                      <td className="mono" style={{ fontSize: 10 }}>{job.id.slice(0, 12)}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 500 }}><ModelMark model={job.model} size={15} />{MODEL_LABELS[job.model]}</span>
                      </td>
                      <td className="mono" style={{ fontSize: 10 }}>{job.gpu}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.durationSec}s</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{job.credits.toFixed(1)}</td>
                      <td><StatusPill status={job.status} /></td>
                      <td className="mono" style={{ textAlign: 'right', fontSize: 9, color: 'var(--ameta)' }}><RelativeTime ts={job.startedAt} /></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        {!isLoading && jobs.length === 0 ? (
          <div className="empty-table">NO JOBS MATCH THE CURRENT FILTERS.</div>
        ) : null}
      </Panel>

      <JobDrawer job={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
