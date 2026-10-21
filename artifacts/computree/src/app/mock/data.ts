/* ------------------------------------------------------------------ */
/* Computree app - mock data layer.                                    */
/* Shapes mirror the future API contracts; swap the fetchers in        */
/* hooks.ts for real HTTP calls without touching the pages.            */
/* ------------------------------------------------------------------ */

export type JobStatus = 'completed' | 'running' | 'failed' | 'queued';
export type ModelId = 'qwen' | 'llama' | 'sdxl' | 'whisper';

export const MODEL_LABELS: Record<ModelId, string> = {
  qwen: 'Qwen',
  llama: 'Llama',
  sdxl: 'SDXL',
  whisper: 'Whisper',
};
export type GpuClass = 'A100' | 'H100' | 'L40S';

export interface ComputeJob {
  id: string;
  model: ModelId;
  /** Original model slug from the API when it isn't one of the known ModelIds. */
  rawModel?: string;
  gpu: GpuClass;
  status: JobStatus;
  provider: string;
  durationSec: number;
  credits: number;
  startedAt: number; // epoch ms
  latencyMs: number;
  queueMs: number;
  tokensIn: number;
  tokensOut: number;
}

export interface ApiKey {
  id: string;
  name: string;
  masked: string; // ct_live_9Kd3…Xy21
  createdAt: number;
  lastUsedAt: number | null;
  usagePct: number; // 0..100
}

export interface Provider {
  name: string;
  gpuClass: GpuClass | 'MIXED';
  online: boolean;
  capacityPct: number; // 0..100
  jobs24h: number;
}

export interface TreasuryTransaction {
  id: string;
  date: number;
  asset: 'USDC' | 'ETH' | 'CTREE';
  amount: string;
  network: 'Base' | 'Ethereum';
  purpose: string;
  tx: string;
}

export interface HourlyUsage {
  hour: string; // HH:00
  credits: number;
}

export interface DayUsage {
  date: string; // YYYY-MM-DD
  used: number;
  total: number;
}

export interface Allocation {
  used: number;
  total: number;
  cycleStartedAt: number; // epoch ms of last UTC midnight
}

/* ---------------------------- seeded PRNG ---------------------------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hex(rand: () => number, len: number) {
  let out = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < len; i++) out += chars[Math.floor(rand() * 16)];
  return out;
}

function keyChars(rand: () => number, len: number) {
  let out = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < len; i++) out += chars[Math.floor(rand() * chars.length)];
  return out;
}

const NOW = Date.now();
const UTC_MIDNIGHT = Math.floor(NOW / 86400000) * 86400000;

/* ------------------------------- jobs -------------------------------- */

const MODELS: ModelId[] = ['qwen', 'llama', 'sdxl', 'whisper'];
const GPUS: GpuClass[] = ['A100', 'H100', 'L40S'];
const PROVIDER_NAMES = ['Golem', 'CoreWeave', 'Lambda', 'Nebius', 'Crusoe'];

function buildJobs(): ComputeJob[] {
  const rand = mulberry32(0xc7eee);
  const jobs: ComputeJob[] = [];
  for (let i = 0; i < 24; i++) {
    const startedAt = NOW - Math.floor(rand() * 30 * 3600 + 120) * 1000;
    const running = i === 0;
    const roll = rand();
    const status: JobStatus = running
      ? 'running'
      : roll < 0.72
        ? 'completed'
        : roll < 0.84
          ? 'failed'
          : roll < 0.94
            ? 'queued'
            : 'completed';
    const durationSec = Math.floor(rand() * 420 + 8);
    jobs.push({
      id: `job_${hex(rand, 8)}`,
      model: MODELS[Math.floor(rand() * MODELS.length)],
      gpu: GPUS[Math.floor(rand() * GPUS.length)],
      status,
      provider: PROVIDER_NAMES[Math.floor(rand() * PROVIDER_NAMES.length)],
      durationSec,
      credits: Math.round((durationSec / 60) * (2 + rand() * 6) * 10) / 10,
      startedAt,
      latencyMs: Math.floor(rand() * 900 + 120),
      queueMs: Math.floor(rand() * 4000 + 200),
      tokensIn: Math.floor(rand() * 1800 + 40),
      tokensOut: Math.floor(rand() * 900 + 20),
    });
  }
  jobs.sort((a, b) => b.startedAt - a.startedAt);
  jobs[0] = { ...jobs[0], status: 'running' };
  return jobs;
}

export const MOCK_JOBS: ComputeJob[] = buildJobs();

/* ---------------------------- live job feed --------------------------- */

const FEED_MODELS: ModelId[] = ['qwen', 'llama', 'sdxl', 'whisper'];

export function makeFeedJob(tick: number): ComputeJob {
  const rand = mulberry32(0xfeed00 + tick * 7919);
  const durationSec = Math.floor(rand() * 300 + 12);
  return {
    id: `job_${hex(rand, 8)}`,
    model: FEED_MODELS[Math.floor(rand() * FEED_MODELS.length)],
    gpu: GPUS[Math.floor(rand() * GPUS.length)],
    status: 'running',
    provider: PROVIDER_NAMES[Math.floor(rand() * PROVIDER_NAMES.length)],
    durationSec,
    credits: Math.round((durationSec / 60) * (2 + rand() * 6) * 10) / 10,
    startedAt: Date.now(),
    latencyMs: Math.floor(rand() * 900 + 120),
    queueMs: Math.floor(rand() * 4000 + 200),
    tokensIn: Math.floor(rand() * 1800 + 40),
    tokensOut: Math.floor(rand() * 900 + 20),
  };
}

export const FEED_SEED: ComputeJob[] = [4, 3, 2, 1, 0].map((i) => {
  const rand = mulberry32(0xfeed00 + i * 7919);
  const durationSec = Math.floor(rand() * 300 + 12);
  const job: ComputeJob = {
    id: `job_${hex(rand, 8)}`,
    model: FEED_MODELS[Math.floor(rand() * FEED_MODELS.length)],
    gpu: GPUS[Math.floor(rand() * GPUS.length)],
    status: i === 0 ? 'running' : 'completed',
    provider: PROVIDER_NAMES[Math.floor(rand() * PROVIDER_NAMES.length)],
    durationSec,
    credits: Math.round((durationSec / 60) * (2 + rand() * 6) * 10) / 10,
    startedAt: NOW - i * 241 * 1000,
    latencyMs: Math.floor(rand() * 900 + 120),
    queueMs: Math.floor(rand() * 4000 + 200),
    tokensIn: Math.floor(rand() * 1800 + 40),
    tokensOut: Math.floor(rand() * 900 + 20),
  };
  return job;
});

/* ---------------------------- allocation ------------------------------ */

export const MOCK_ALLOCATION: Allocation = {
  used: 653,
  total: 1000,
  cycleStartedAt: UTC_MIDNIGHT,
};

export const MOCK_HOURLY_USAGE: HourlyUsage[] = (() => {
  const rand = mulberry32(0x24cc);
  const out: HourlyUsage[] = [];
  for (let h = 0; h < 24; h++) {
    const wave = Math.sin((h / 24) * Math.PI * 2 - 1.2) * 0.5 + 0.5;
    const credits = Math.round((8 + wave * 34 + rand() * 14) * 10) / 10;
    out.push({ hour: `${String(h).padStart(2, '0')}:00`, credits });
  }
  return out;
})();

export const MOCK_WEEK_USAGE: DayUsage[] = (() => {
  const rand = mulberry32(0x7da7);
  const out: DayUsage[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(UTC_MIDNIGHT - d * 86400000);
    out.push({
      date: date.toISOString().slice(0, 10),
      used: d === 0 ? MOCK_ALLOCATION.used : Math.floor(rand() * 620 + 240),
      total: 1000,
    });
  }
  return out;
})();

/* ----------------------------- providers ------------------------------ */

export const MOCK_PROVIDERS: Provider[] = [
  { name: 'Golem', gpuClass: 'L40S', online: true, capacityPct: 62, jobs24h: 412 },
  { name: 'CoreWeave', gpuClass: 'H100', online: true, capacityPct: 81, jobs24h: 1384 },
  { name: 'Lambda', gpuClass: 'A100', online: true, capacityPct: 44, jobs24h: 655 },
  { name: 'Nebius', gpuClass: 'H100', online: true, capacityPct: 57, jobs24h: 842 },
  { name: 'Crusoe', gpuClass: 'A100', online: false, capacityPct: 0, jobs24h: 0 },
  { name: 'Other', gpuClass: 'MIXED', online: true, capacityPct: 23, jobs24h: 208 },
];

/* ----------------------------- treasury ------------------------------- */

export const MOCK_TREASURY_STATS = {
  balanceUsd: 4_820_000,
  compute30dUsd: 312_400,
  activeGpuCapacity: 214, // GPUs
  avgCostPerCr: 0.41, // USD
};

export const MOCK_TRANSACTIONS: TreasuryTransaction[] = [
  { id: 'tx1', date: NOW - 2 * 86400000, asset: 'USDC', amount: '84,000', network: 'Base', purpose: 'GPU CAPACITY · COREWEAVE', tx: `0x${hex(mulberry32(11), 40)}` },
  { id: 'tx2', date: NOW - 5 * 86400000, asset: 'USDC', amount: '61,500', network: 'Base', purpose: 'GPU CAPACITY · LAMBDA', tx: `0x${hex(mulberry32(22), 40)}` },
  { id: 'tx3', date: NOW - 9 * 86400000, asset: 'ETH', amount: '12.4', network: 'Ethereum', purpose: 'GPU CAPACITY · NEBIUS', tx: `0x${hex(mulberry32(33), 40)}` },
  { id: 'tx4', date: NOW - 14 * 86400000, asset: 'USDC', amount: '120,000', network: 'Base', purpose: 'TREASURY REBALANCE', tx: `0x${hex(mulberry32(44), 40)}` },
  { id: 'tx5', date: NOW - 21 * 86400000, asset: 'CTREE', amount: '2,400,000', network: 'Ethereum', purpose: 'EMISSION · ALLOCATION POOL', tx: `0x${hex(mulberry32(55), 40)}` },
];

/* ------------------------------ api keys ------------------------------ */

export const KEYS_STORAGE = 'ctree_api_keys';

export function seedApiKeys(): ApiKey[] {
  const rand = mulberry32(0x3e91);
  return [
    { id: `key_${hex(rand, 6)}`, name: 'production-backend', masked: `ct_live_${keyChars(rand, 4)}…${keyChars(rand, 4)}`, createdAt: NOW - 32 * 86400000, lastUsedAt: NOW - 14 * 60000, usagePct: 68 },
    { id: `key_${hex(rand, 6)}`, name: 'local-testing', masked: `ct_live_${keyChars(rand, 4)}…${keyChars(rand, 4)}`, createdAt: NOW - 6 * 86400000, lastUsedAt: NOW - 2 * 86400000, usagePct: 12 },
  ];
}

export function generateApiKeySecret(): string {
  const rand = mulberry32((Date.now() ^ (Math.random() * 0xffffffff)) | 0);
  return `ct_live_${keyChars(rand, 32)}`;
}

export function maskApiKey(secret: string): string {
  return `${secret.slice(0, 12)}…${secret.slice(-4)}`;
}

/* ------------------------------- wallet ------------------------------- */

export const MOCK_WALLET = {
  address: '0x7f3a9c21d4e8b6f0a2c4e6d8b1f3a5c7e9d2b4f6',
  network: 'Ethereum Mainnet',
};
