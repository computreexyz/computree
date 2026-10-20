import { isDemoMode } from './demo';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:5000';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export type AccessTokenGetter = () => Promise<string | null>;

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  getAccessToken?: AccessTokenGetter;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, getAccessToken } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (isDemoMode()) {
    headers['x-demo-account'] = 'demo-user';
  } else if (getAccessToken) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, `API unreachable at ${API_BASE_URL}`);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data: unknown = await res.json();
      if (
        data !== null &&
        typeof data === 'object' &&
        'error' in data &&
        typeof (data as { error: unknown }).error === 'string'
      ) {
        message = (data as { error: string }).error;
      }
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}
