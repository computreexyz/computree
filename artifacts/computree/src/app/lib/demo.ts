export const DEMO_STORAGE = 'ctree_demo';

export function isDemoMode(): boolean {
  try {
    return localStorage.getItem(DEMO_STORAGE) === '1';
  } catch {
    return false;
  }
}
