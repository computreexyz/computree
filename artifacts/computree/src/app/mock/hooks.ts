import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useSyncExternalStore } from 'react';
import { apiFetch, ApiError, type AccessTokenGetter } from '../lib/api';
import { DEMO_STORAGE, isDemoMode } from '../lib/demo';
import type {
  Allocation,
  ApiKey,
  ComputeJob,
  DayUsage,
  GpuClass,
  HourlyUsage,
  JobStatus,
  ModelId,
  Provider,
  TreasuryTransaction,
} from './data';

/* Real fetchers against the Computree API - query keys and return shapes */
/* are the contract the pages rely on.                                    */

/* ----------------------------- API wire types --------------------------- */

interface ApiJob {
  id: string;
  model: string;
  gpu: string;
  status: string;
  provider: string;
  durationSec: number;
  credits: number;
  startedAt: number;
  tokensIn: number;
  tokensOut: number;
  error?: string;
}

interface ApiKeyResponse {
  id: string;
  name: string;
  masked: string;
  createdAt: number;
  lastUsedAt: number | null;
  usagePct: number;
}

export interface CreatedApiKey extends ApiKey {
  /** Full secret - returned by the API exactly once at creation time. */
  secret: string;
}

interface TreasuryStats {
  balanceUsd: number;
  compute30dUsd: number;
  activeGpuCapacity: number;
  avgCostPerCr: number;
  note?: string;
}

interface TreasuryResponse {
  stats: TreasuryStats;
  transactions: TreasuryTransaction[];
}

/* ------------------------------ mappers -------------------------------- */

const MODEL_IDS: ModelId[] = ['qwen', 'llama', 'sdxl', 'whisper'];
const GPU_CLASSES: GpuClass[] = ['A100', 'H100', 'L40S'];
const JOB_STATUSES: JobStatus[] = ['queued', 'running', 'completed', 'failed'];

function mapModel(slug: string): { model: ModelId; rawModel?: string } {
  const lower = slug.toLowerCase();
  const exact = MODEL_IDS.find((m) => m === lower);
  if (exact) return { model: exact };
  const contained = MODEL_IDS.find((m) => lower.includes(m));
  if (contained) return { model: contained, rawModel: slug };
  if (lower.includes('stable') || lower.includes('diffusion')) {
    return { model: 'sdxl', rawModel: slug };
  }
  return { model: 'qwen', rawModel: slug };
}

function mapGpu(gpu: string): GpuClass {
  const upper = gpu.toUpperCase();
  return GPU_CLASSES.find((g) => g === upper) ?? 'H100';
}

function mapStatus(status: string): JobStatus {
  const lower = status.toLowerCase();
  return JOB_STATUSES.find((s) => s === lower) ?? 'queued';
}

function mapJob(job: ApiJob): ComputeJob {
  return {
    id: job.id,
    ...mapModel(job.model),
    gpu: mapGpu(job.gpu),
    status: mapStatus(job.status),
    provider: job.provider,
    durationSec: job.durationSec,
    credits: job.credits,
    startedAt: job.startedAt,
    latencyMs: 0,
    queueMs: 0,
    tokensIn: job.tokensIn,
    tokensOut: job.tokensOut,
  };
}

/* ------------------------------ fetchers ------------------------------- */

export interface MeResponse {
  account: { id: string; privyDid: string; walletAddress: string | null };
  eligibility: { eligible: boolean; balance: number; asset: string; staked: number };
  chain: { id: number; name: string; testnet: boolean };
}

async function fetchMe(getAccessToken?: AccessTokenGetter): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/me', { getAccessToken });
}

export function useMe() {
  const { getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ['app', 'me'],
    queryFn: () => fetchMe(getAccessToken),
    staleTime: 30_000,
    retry: queryRetry,
  });
}

async function fetchJobs(getAccessToken?: AccessTokenGetter): Promise<ComputeJob[]> {
  const jobs = await apiFetch<ApiJob[]>('/api/jobs', { getAccessToken });
  return jobs.map(mapJob);
}

async function fetchAllocation(getAccessToken?: AccessTokenGetter): Promise<Allocation> {
  return apiFetch<Allocation>('/api/allocation', { getAccessToken });
}

async function fetchHourlyUsage(getAccessToken?: AccessTokenGetter): Promise<HourlyUsage[]> {
  return apiFetch<HourlyUsage[]>('/api/usage/hourly', { getAccessToken });
}

async function fetchWeekUsage(getAccessToken?: AccessTokenGetter): Promise<DayUsage[]> {
  return apiFetch<DayUsage[]>('/api/usage/week', { getAccessToken });
}

async function fetchProviders(): Promise<Provider[]> {
  return apiFetch<Provider[]>('/api/providers');
}

async function fetchTreasury(): Promise<TreasuryResponse> {
  return apiFetch<TreasuryResponse>('/api/treasury');
}

/* Don't retry auth failures - surface the error state instead of looping. */
function queryRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return false;
  }
  return failureCount < 2;
}

export function useJobs(refetchInterval?: number) {
  const { getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ['app', 'jobs'],
    queryFn: () => fetchJobs(getAccessToken),
    staleTime: 60_000,
    retry: queryRetry,
    ...(refetchInterval ? { refetchInterval } : {}),
  });
}

export function useAllocation() {
  const { getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ['app', 'allocation'],
    queryFn: () => fetchAllocation(getAccessToken),
    staleTime: 60_000,
    retry: queryRetry,
  });
}

export function useHourlyUsage() {
  const { getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ['app', 'usage', 'hourly'],
    queryFn: () => fetchHourlyUsage(getAccessToken),
    staleTime: 60_000,
    retry: queryRetry,
  });
}

export function useWeekUsage() {
  const { getAccessToken } = usePrivy();
  return useQuery({
    queryKey: ['app', 'usage', 'week'],
    queryFn: () => fetchWeekUsage(getAccessToken),
    staleTime: 60_000,
    retry: queryRetry,
  });
}

export function useProviders() {
  return useQuery({
    queryKey: ['app', 'providers'],
    queryFn: fetchProviders,
    staleTime: 60_000,
    retry: queryRetry,
  });
}

export function useTreasury() {
  return useQuery({
    queryKey: ['app', 'treasury'],
    queryFn: fetchTreasury,
    staleTime: 60_000,
    retry: queryRetry,
  });
}

/* --------------------------- playground -------------------------------- */

export interface PlaygroundChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PlaygroundRequest {
  model: string;
  system?: string;
  temperature?: number;
  messages: PlaygroundChatMessage[];
}

export interface PlaygroundCompletion {
  content: string;
  model: string;
  usage: { promptTokens: number; completionTokens: number };
  creditsUsed: number;
  remaining: number;
}

export function usePlaygroundCompletion() {
  const { getAccessToken } = usePrivy();
  return useMutation({
    mutationFn: (
      input: PlaygroundRequest & { onResponse?: (res: Response) => void },
    ) => {
      const { onResponse, ...body } = input;
      return apiFetch<PlaygroundCompletion>('/api/playground/completions', {
        method: 'POST',
        body,
        getAccessToken,
        onResponse,
      });
    },
  });
}

/* --------------------------- images ------------------------------------ */

export interface ImageGenerateRequest {
  prompt: string;
  model?: string;
  count?: 1 | 2;
}

export interface ImageGenerateResponse {
  images: string[];
  text?: string;
  model: string;
  creditsUsed: number;
  remaining: number;
}

export function useImageGeneration() {
  const { getAccessToken } = usePrivy();
  return useMutation({
    mutationFn: (body: ImageGenerateRequest) =>
      apiFetch<ImageGenerateResponse>('/api/images/generate', {
        method: 'POST',
        body,
        getAccessToken,
      }),
  });
}

/* --------------------------- workloads --------------------------------- */

export interface EmbeddingsRequest {
  model?: string;
  input: string[];
}

export interface EmbeddingsResponse {
  model: string;
  dimensions: number;
  count: number;
  tokensUsed: number;
  creditsUsed: number;
  remaining: number;
  preview: number[];
}

export function useEmbeddings() {
  const { getAccessToken } = usePrivy();
  return useMutation({
    mutationFn: (body: EmbeddingsRequest) =>
      apiFetch<EmbeddingsResponse>('/api/workloads/embeddings', {
        method: 'POST',
        body,
        getAccessToken,
      }),
  });
}

/* --------------------------- API keys (server) -------------------------- */

export function useApiKeys() {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    queryKey: ['app', 'keys'],
    queryFn: () => apiFetch<ApiKeyResponse[]>('/api/keys', { getAccessToken }),
    staleTime: 60_000,
    retry: queryRetry,
  });

  const invalidateKeys = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['app', 'keys'] }),
    [queryClient],
  );

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      apiFetch<ApiKeyResponse & { secret: string }>('/api/keys', {
        method: 'POST',
        body: { name },
        getAccessToken,
      }),
    onSuccess: invalidateKeys,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ id: string; revoked: boolean }>(`/api/keys/${id}`, {
        method: 'DELETE',
        getAccessToken,
      }),
    onSuccess: invalidateKeys,
  });

  const addKey = useCallback(
    async (name: string): Promise<CreatedApiKey> => {
      const { secret, ...key } = await createMutation.mutateAsync(name);
      return { ...key, secret };
    },
    [createMutation],
  );

  const revokeKey = useCallback(
    (id: string) => {
      revokeMutation.mutate(id);
    },
    [revokeMutation],
  );

  return { keys: data ?? [], keysError: error, keysLoading: isLoading, addKey, revokeKey };
}

/* --------------------------- demo mode flag ---------------------------- */

export { DEMO_STORAGE };

const demoListeners = new Set<() => void>();

function subscribeDemo(callback: () => void): () => void {
  demoListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    demoListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

export function setDemoMode(on: boolean) {
  try {
    if (on) localStorage.setItem(DEMO_STORAGE, '1');
    else localStorage.removeItem(DEMO_STORAGE);
  } catch {
    /* storage unavailable */
  }
  demoListeners.forEach((listener) => listener());
}

export function useDemoMode(): [boolean, (on: boolean) => void] {
  const demo = useSyncExternalStore(subscribeDemo, isDemoMode, () => false);
  return [demo, setDemoMode];
}
