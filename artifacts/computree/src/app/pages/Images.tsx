import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePrivy } from '@privy-io/react-auth';
import { Download, ExternalLink, Sparkles } from 'lucide-react';
import { useCallback, useState } from 'react';
import { apiFetch } from '../lib/api';
import { FeatureBanner } from '../components/FeatureBanner';
import { ModelSelect, type ModelOption } from '../components/ModelSelect';
import { ImagesArt } from '../components/AppVisuals';
import { AllocationCard } from '../components/AllocationCard';
import { Panel, RelativeTime } from '../components/StatusPill';
import {
  useAllocation,
  useImageGeneration,
  type ImageGenerateResponse,
} from '../mock/hooks';

const MODEL_OPTIONS: ModelOption[] = [
  { value: 'google/gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', logo: '/brands/googlegemini.svg' },
  { value: 'openai/gpt-5-image-mini', label: 'GPT-5 Image Mini', logo: '/brands/openai.svg' },
  { value: 'bytedance/seedream-4.0', label: 'Seedream 4.0', logo: '/brands/bytedance.svg' },
];

const CREDITS_PER_IMAGE = 10;

interface ImageJob {
  id: string;
  model: string;
  status: string;
  credits: number;
  startedAt: number;
}

interface Generation {
  id: string;
  prompt: string;
  result: ImageGenerateResponse;
}

function RecentImageJobs() {
  const { getAccessToken } = usePrivy();
  const { data } = useQuery({
    queryKey: ['app', 'jobs', 'image'],
    queryFn: () => apiFetch<ImageJob[]>('/api/jobs?provider=image&limit=6', { getAccessToken }),
    staleTime: 15_000,
  });
  const jobs = data ?? [];
  if (jobs.length === 0) return null;
  return (
    <Panel title="Recent images" right={<span className="app-meta">{jobs.length} jobs</span>} flush>
      <div className="table-wrap">
        <table className="data-table" style={{ minWidth: 480 }}>
          <thead>
            <tr>
              <th>Job</th>
              <th>Model</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Credits</th>
              <th style={{ textAlign: 'right' }}>Started</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="mono" style={{ fontSize: 10 }}>{job.id.slice(0, 12)}</td>
                <td className="mono" style={{ fontSize: 10 }}>{job.model}</td>
                <td style={{ fontWeight: 500 }}>{job.status}</td>
                <td className="app-tnum" style={{ textAlign: 'right' }}>{job.credits.toFixed(1)}</td>
                <td className="app-meta" style={{ textAlign: 'right' }}><RelativeTime ts={job.startedAt} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export default function Images() {
  const queryClient = useQueryClient();
  const generation = useImageGeneration();
  const { data: allocation } = useAllocation();

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState(MODEL_OPTIONS[0].value);
  const [count, setCount] = useState<1 | 2>(1);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Generation[]>([]);

  const noAllocation = allocation !== undefined && allocation.total === 0;
  const cost = CREDITS_PER_IMAGE * count;

  const generate = useCallback(async () => {
    const text = prompt.trim();
    if (!text || sending || noAllocation) return;
    setError(null);
    setSending(true);
    try {
      const result = await generation.mutateAsync({ prompt: text, model, count });
      setResults((prev) => [{ id: `gen_${Date.now()}`, prompt: text, result }, ...prev].slice(0, 6));
      queryClient.invalidateQueries({ queryKey: ['app', 'allocation'] });
      queryClient.invalidateQueries({ queryKey: ['app', 'jobs'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setSending(false);
    }
  }, [prompt, sending, noAllocation, model, count, generation, queryClient]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <FeatureBanner
        feature="images"
        title="Images"
        meta="Generate images with frontier models · 10 CR per image"
      />

      <div className="pg-layout">
        <Panel title="Generate" flush={false}>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div className="app-meta" style={{ marginBottom: 7 }}>MODEL</div>
              <ModelSelect options={MODEL_OPTIONS} value={model} onChange={setModel} testId="select-image-model" />
            </div>
            <div>
              <div className="app-meta" style={{ marginBottom: 7 }}>PROMPT</div>
              <textarea
                className="pg-textarea"
                style={{ minHeight: 90 }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void generate();
                  }
                }}
                placeholder="A minimal black tree logo on white…"
                data-testid="input-image-prompt"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="app-meta">COUNT</span>
              <span className="app-segment" role="tablist" aria-label="Image count">
                {([1, 2] as const).map((n) => (
                  <button
                    key={n}
                    role="tab"
                    aria-selected={count === n}
                    className={count === n ? 'is-on' : undefined}
                    onClick={() => setCount(n)}
                    data-testid={`segment-count-${n}`}
                  >
                    {n}
                  </button>
                ))}
              </span>
              <span style={{ flex: 1 }} />
              <span className="app-meta">{cost} CR</span>
              <button
                className="button button-dark"
                style={{ minHeight: 38 }}
                onClick={() => void generate()}
                disabled={!prompt.trim() || sending || noAllocation}
                data-testid="button-generate-image"
              >
                <Sparkles size={13} /> {sending ? 'Generating…' : 'Generate'}
              </button>
            </div>
            <div className="app-meta">10 CR PER IMAGE · FALLBACK MODELS TRIED AUTOMATICALLY</div>
            {noAllocation ? (
              <div className="mono" style={{ fontSize: 9, letterSpacing: '.06em', color: 'var(--ameta)' }} data-testid="note-stake-to-generate">
                STAKE TOKENIZED NVDA (NVDAon) TO GENERATE IMAGES
              </div>
            ) : null}
            {error ? (
              <div className="pg-error" role="alert" data-testid="banner-image-error">
                {error}
              </div>
            ) : null}
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 16 }}>
          <AllocationCard />
        </div>
      </div>

      <Panel title="Results" right={<span className="app-meta">{results.reduce((n, g) => n + g.result.images.length, 0)} images this session</span>} flush={false}>
        {sending ? (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="app-skel" style={{ height: 220, borderRadius: 'var(--aradius-sm)' }} data-testid={`skel-image-${i}`} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', display: 'grid', justifyItems: 'center', gap: 12, padding: '18px 0' }}>
            <div style={{ width: 220, height: 120 }} aria-hidden="true">
              <ImagesArt />
            </div>
            <div className="app-sub">Generate your first image</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {results.map((gen) => (
              <div key={gen.id}>
                <div className="app-meta" style={{ marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  “{gen.prompt}”
                </div>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  {gen.result.images.map((url, i) => (
                    <figure key={i} style={{ margin: 0 }} className="app-panel" data-testid={`card-image-${gen.id}-${i}`}>
                      <img
                        src={url}
                        alt={gen.prompt}
                        style={{ display: 'block', width: '100%', borderRadius: 'var(--aradius-sm) var(--aradius-sm) 0 0', background: 'var(--abg)' }}
                      />
                      <figcaption style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', flexWrap: 'wrap' }}>
                        <span className="pg-chip">{gen.result.model.toUpperCase()}</span>
                        <span className="pg-chip">{gen.result.creditsUsed} CR</span>
                        <span style={{ flex: 1 }} />
                        <a className="app-filter-chip" style={{ textDecoration: 'none' }} href={url} download={`computree-${gen.id}-${i + 1}.png`} data-testid={`button-download-${gen.id}-${i}`}>
                          <Download size={10} /> Download
                        </a>
                        <a className="app-filter-chip" style={{ textDecoration: 'none' }} href={url} target="_blank" rel="noreferrer" data-testid={`button-fullsize-${gen.id}-${i}`}>
                          <ExternalLink size={10} /> Full size
                        </a>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {gen.result.text ? (
                  <div className="app-meta" style={{ marginTop: 8 }}>{gen.result.text}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <RecentImageJobs />
    </div>
  );
}
