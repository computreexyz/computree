import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useSyncExternalStore } from 'react';
import {
  KEYS_STORAGE,
  MOCK_ALLOCATION,
  MOCK_HOURLY_USAGE,
  MOCK_JOBS,
  MOCK_PROVIDERS,
  MOCK_TRANSACTIONS,
  MOCK_TREASURY_STATS,
  MOCK_WEEK_USAGE,
  seedApiKeys,
  type Allocation,
  type ApiKey,
  type ComputeJob,
  type DayUsage,
  type HourlyUsage,
  type Provider,
  type TreasuryTransaction,
} from './data';

/* Mock fetchers — replace these with real HTTP calls to the Computree   */
/* API later; query keys and return shapes are the contract.             */

const delay = (ms = 240) => new Promise((r) => setTimeout(r, ms));

async function fetchJobs(): Promise<ComputeJob[]> {
  await delay();
  return MOCK_JOBS;
}

async function fetchAllocation(): Promise<Allocation> {
  await delay();
  return MOCK_ALLOCATION;
}

async function fetchHourlyUsage(): Promise<HourlyUsage[]> {
  await delay();
  return MOCK_HOURLY_USAGE;
}

async function fetchWeekUsage(): Promise<DayUsage[]> {
  await delay();
  return MOCK_WEEK_USAGE;
}

async function fetchProviders(): Promise<Provider[]> {
  await delay();
  return MOCK_PROVIDERS;
}

async function fetchTreasury(): Promise<{
  stats: typeof MOCK_TREASURY_STATS;
  transactions: TreasuryTransaction[];
}> {
  await delay();
  return { stats: MOCK_TREASURY_STATS, transactions: MOCK_TRANSACTIONS };
}

export function useJobs() {
  return useQuery({ queryKey: ['app', 'jobs'], queryFn: fetchJobs, staleTime: 60_000 });
}

export function useAllocation() {
  return useQuery({ queryKey: ['app', 'allocation'], queryFn: fetchAllocation, staleTime: 60_000 });
}

export function useHourlyUsage() {
  return useQuery({ queryKey: ['app', 'usage', 'hourly'], queryFn: fetchHourlyUsage, staleTime: 60_000 });
}

export function useWeekUsage() {
  return useQuery({ queryKey: ['app', 'usage', 'week'], queryFn: fetchWeekUsage, staleTime: 60_000 });
}

export function useProviders() {
  return useQuery({ queryKey: ['app', 'providers'], queryFn: fetchProviders, staleTime: 60_000 });
}

export function useTreasury() {
  return useQuery({ queryKey: ['app', 'treasury'], queryFn: fetchTreasury, staleTime: 60_000 });
}

/* ------------------------- API keys (localStorage) --------------------- */

function readStoredKeys(): ApiKey[] {
  try {
    const raw = localStorage.getItem(KEYS_STORAGE);
    if (!raw) {
      const seeded = seedApiKeys();
      localStorage.setItem(KEYS_STORAGE, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as ApiKey[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return seedApiKeys();
  }
}

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>(readStoredKeys);

  const persist = useCallback((next: ApiKey[]) => {
    setKeys(next);
    try {
      localStorage.setItem(KEYS_STORAGE, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const addKey = useCallback(
    (key: ApiKey) => persist([key, ...readStoredKeys()]),
    [persist],
  );

  const revokeKey = useCallback(
    (id: string) => persist(readStoredKeys().filter((k) => k.id !== id)),
    [persist],
  );

  return { keys, addKey, revokeKey };
}

/* --------------------------- demo mode flag ---------------------------- */

export const DEMO_STORAGE = 'ctree_demo';

const demoListeners = new Set<() => void>();

function readDemo(): boolean {
  try {
    return localStorage.getItem(DEMO_STORAGE) === '1';
  } catch {
    return false;
  }
}

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
  const demo = useSyncExternalStore(subscribeDemo, readDemo, () => false);
  return [demo, setDemoMode];
}
