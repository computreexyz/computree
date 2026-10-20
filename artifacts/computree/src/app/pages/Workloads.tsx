import { useQueryClient } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { useCallback, useState } from 'react';
import { FeatureBanner } from '../components/FeatureBanner';
import { ModelSelect, type ModelOption } from '../components/ModelSelect';
import { WorkloadsArt } from '../components/AppVisuals';
import { AllocationCard } from '../components/AllocationCard';
import { Panel } from '../components/StatusPill';
import {
  useAllocation,
  useEmbeddings,
  type EmbeddingsResponse,
} from '../mock/hooks';

const MODEL_OPTIONS: ModelOption[] = [
  { value: 'openai/text-embedding-3-small', label: 'Text Embedding 3 Small', logo: '/brands/openai.svg' },
  { value: 'openai/text-embedding-3-large', label: 'Text Embedding 3 Large', logo: '/brands/openai.svg' },
  { value: 'qwen/qwen3-embedding-8b', label: 'Qwen 3 Embedding 8B', logo: '/brands/qwen.svg' },
];

const MAX_INPUTS = 8;

interface Run {
  id: string;
  inputs: string[];
  result: EmbeddingsResponse;
}

function PreviewBars({ preview }: { preview: number[] }) {
  const max = Math.max(...preview.map((v) => Math.abs(v)), 1e-9);
  return (
    <div style={{ display: 'grid', gap: 6 }} data-testid="chart-embedding-preview">
      {preview.map((value, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="mono" style={{ fontSize: 9, color: 'var(--ameta)', width: 22 }}>d{i}</span>
          <div style={{ flex: 1, height: 8, background: 'color-mix(in srgb, var(--aink) 8%, transparent)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ width: `${(Math.abs(value) / max) * 100}%`, height: '100%', background: 'var(--aink)', borderRadius: 99 }} />
          </div>
          <span className="mono" style={{ fontSize: 9, color: 'var(--asub)', width: 84, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {value.toFixed(5)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Workloads() {
  const queryClient = useQueryClient();
  const embeddings = useEmbeddings();
  const { data: allocation } = useAllocation();

  const [model, setModel] = useState(MODEL_OPTIONS[0].value);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);

  const noAllocation = allocation !== undefined && allocation.total === 0;
  const lines = input.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const valid = lines.length > 0 && lines.length <= MAX_INPUTS;

  const run = useCallback(async () => {
    if (!valid || sending || noAllocation) return;
    setError(null);
    setSending(true);
    try {
      const result = await embeddings.mutateAsync({ model, input: lines });
      setRuns((prev) => [{ id: `run_${Date.now()}`, inputs: lines, result }, ...prev].slice(0, 5));
      queryClient.invalidateQueries({ queryKey: ['app', 'allocation'] });
      queryClient.invalidateQueries({ queryKey: ['app', 'jobs'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Workload failed');
    } finally {
      setSending(false);
    }
  }, [valid, sending, noAllocation, model, lines, embeddings, queryClient]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FeatureBanner
        feature="workloads"
        title="Workloads"
        meta="AI model workloads beyond chat · embeddings metered per token"
      />

      <div className="pg-layout">
        <Panel title="Embeddings" flush={false}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div className="app-meta" style={{ marginBottom: 7 }}>MODEL</div>
              <ModelSelect options={MODEL_OPTIONS} value={model} onChange={setModel} testId="select-embedding-model" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                <span className="app-meta">INPUT · ONE PER LINE</span>
                <span className="app-meta">{lines.length}/{MAX_INPUTS}</span>
              </div>
              <textarea
                className="pg-textarea"
                style={{ minHeight: 120, fontFamily: 'var(--app-font-mono)', fontSize: 12 }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={'hello world\ngpu compute'}
                data-testid="input-embedding-text"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="app-meta">1 CR PER 200 TOKENS</span>
              <span style={{ flex: 1 }} />
              <button
                className="button button-dark"
                style={{ minHeight: 38 }}
                onClick={() => void run()}
                disabled={!valid || sending || noAllocation}
                data-testid="button-run-embeddings"
              >
                <Play size={12} /> {sending ? 'Running…' : 'Run'}
              </button>
            </div>
            {error ? (
              <div className="pg-error" role="alert" data-testid="banner-workload-error">
                {error}
              </div>
            ) : null}
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 16 }}>
          <AllocationCard />
        </div>
      </div>

      <Panel title="Results" right={<span className="app-meta">{runs.length} runs this session</span>} flush={false}>
        {runs.length === 0 ? (
          <div style={{ textAlign: 'center', display: 'grid', justifyItems: 'center', gap: 12, padding: '18px 0' }}>
            <div style={{ width: 220, height: 120 }} aria-hidden="true">
              <WorkloadsArt />
            </div>
            <div className="app-sub">Run your first embedding workload</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {runs.map((runItem) => (
              <div key={runItem.id} className="app-panel" style={{ padding: '12px 14px', display: 'grid', gap: 12 }} data-testid={`card-run-${runItem.id}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className="pg-chip">{runItem.result.model.toUpperCase()}</span>
                  <span className="pg-chip">{runItem.result.dimensions.toLocaleString('en-US')} DIMS</span>
                  <span className="pg-chip">{runItem.result.count} VECTORS</span>
                  <span className="pg-chip">{runItem.result.tokensUsed} TOK</span>
                  <span className="pg-chip">{runItem.result.creditsUsed} CR</span>
                  <span className="pg-chip">{runItem.result.remaining.toLocaleString('en-US')} LEFT</span>
                </div>
                <div className="app-meta">
                  INPUTS: {runItem.inputs.map((l) => `“${l.length > 40 ? `${l.slice(0, 40)}…` : l}”`).join(' · ')}
                </div>
                <div>
                  <div className="app-meta" style={{ marginBottom: 7 }}>FIRST VECTOR · FIRST 5 DIMENSIONS</div>
                  <PreviewBars preview={runItem.result.preview} />
                </div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '.06em', color: 'var(--ameta)' }}>
                  FULL VECTOR AVAILABLE VIA THE GPU API
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
