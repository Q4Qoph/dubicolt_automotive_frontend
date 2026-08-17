/** API is always used — mock data is disabled. */
export const USE_API = true;

/**
 * Browser: same-origin `/api` (proxied by Next.js → backend).
 * Server: direct URL (rewrite does not apply to Node fetch).
 */
function resolveApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV === 'development') return '/api';
    return env || '/api';
  }
  return env || 'http://localhost:3001/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const API_TIMEOUT_MS = 30_000;

