import { clearAuthSessionOnUnauthorized } from '@/lib/auth-session';
import { API_BASE_URL, API_TIMEOUT_MS } from './config';
import type { ApiErrorBody } from '@/lib/contracts';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(status: number, body: ApiErrorBody): ApiError {
    return new ApiError(
      status,
      body.error.code,
      body.error.message,
      body.error.details,
    );
  }
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  token?: string | null;
  headers?: Record<string, string>;
}

function apiOriginForRelativeBase(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (site) return site;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/** Builds a fetch URL; supports relative bases like `/api/v1` (dev proxy). */
export function buildApiUrl(path: string, query?: RequestOptions['query']): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const pathname = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const url = /^https?:\/\//i.test(base)
    ? new URL(pathname)
    : new URL(pathname, apiOriginForRelativeBase());
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, query, token, headers = {} } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const url = buildApiUrl(path, query);
  const bearerToken = token ?? getAccessToken();

  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) {
      return undefined as T;
    }

    const text = await res.text();
    let json: unknown = null;
    if (text) {
      try {
        json = JSON.parse(text) as unknown;
      } catch {
        throw new ApiError(
          res.status || 0,
          'invalid_response',
          res.ok
            ? 'The API returned an unexpected response.'
            : `The API is unavailable (${res.status || 'network error'}). Start the backend with: cd backend && npm run dev`,
        );
      }
    }

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSessionOnUnauthorized(path, !!bearerToken);
      }
      const errBody = json as ApiErrorBody | null;
      if (errBody?.error) {
        throw ApiError.fromResponse(res.status, errBody);
      }
      throw new ApiError(res.status, 'unknown_error', res.statusText || 'Request failed');
    }

    return json as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError(
        0,
        'timeout',
        'The API took too long to respond. Check that the backend is running (cd backend && npm run dev).',
      );
    }
    if (err instanceof TypeError) {
      throw new ApiError(
        0,
        'network_error',
        `Cannot reach the API (${url}). Start the backend: cd backend && npm run dev, then restart the Next app if you changed config.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw =
      localStorage.getItem('dubicolt_session') ?? localStorage.getItem('dubiken_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { access_token?: string };
    return parsed.access_token ?? null;
  } catch {
    return null;
  }
}
