import type { AuthTokensResponse, AuthUser } from '@/lib/contracts';

const STORAGE_KEY = 'dubicolt_session';
const LEGACY_KEY = 'dubiken_session';

export const AUTH_SESSION_EVENT = 'dubicolt-auth-change';

/** Fired after session is cleared due to an API 401 (e.g. expired token). */
export const AUTH_UNAUTHORIZED_EVENT = 'dubicolt-auth-unauthorized';

const AUTH_PATHS_NO_AUTO_LOGOUT = ['/auth/login', '/auth/register'];

export interface AuthSession {
  loggedIn: boolean;
  email?: string;
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
}

function migrateLegacySession(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(STORAGE_KEY)) return;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    localStorage.setItem(STORAGE_KEY, legacy);
    localStorage.removeItem(LEGACY_KEY);
  }
}

/** Mock / demo login (no API) */
export function setAuthSession(email?: string): void {
  if (typeof window === 'undefined') return;
  const session: AuthSession = { loggedIn: true, email };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

/** After `POST /auth/login` or register */
export function setAuthSessionFromTokens(response: AuthTokensResponse): void {
  if (typeof window === 'undefined') return;
  const session: AuthSession = {
    loggedIn: true,
    email: response.user.email,
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    user: response.user,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

/** Clear local session when the API rejects credentials (401). */
export function clearAuthSessionOnUnauthorized(apiPath: string, hadBearerToken: boolean): void {
  if (typeof window === 'undefined' || !hadBearerToken) return;
  if (AUTH_PATHS_NO_AUTO_LOGOUT.some((p) => apiPath === p || apiPath.startsWith(`${p}/`))) {
    return;
  }
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
  const path = window.location.pathname;
  if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
    window.location.assign('/auth/login');
  }
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  migrateLegacySession();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed.loggedIn ? parsed : null;
  } catch {
    return null;
  }
}

export function isAuthSessionActive(): boolean {
  return getAuthSession()?.loggedIn === true;
}
