/** API is always used — mock data is disabled. */
export const USE_API = true;

/**
 * Browser: same-origin `/api` (proxied by Next.js → backend).
 * Server: direct URL (rewrite does not apply to Node fetch).
 */
function resolveApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: always use same-origin relative path /api to bypass browser CORS checks
    return '/api';
  }
  // Server-side: use base URL environment variables, fallback to localhost
  const env = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '');
  const proxy = process.env.API_PROXY_TARGET?.trim().replace(/\/$/, '');
  return proxy ? `${proxy}/api` : (env || 'http://localhost:3001/api');
}

export const API_BASE_URL = resolveApiBaseUrl();

export const API_TIMEOUT_MS = 30_000;

