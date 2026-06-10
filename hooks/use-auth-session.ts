'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AUTH_SESSION_EVENT,
  clearAuthSession,
  getAuthSession,
  isAuthSessionActive,
  type AuthSession,
} from '@/lib/auth-session';

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setSession(getAuthSession());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(AUTH_SESSION_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [refresh]);

  return {
    ready,
    session,
    isLoggedIn: ready && isAuthSessionActive(),
    logout: clearAuthSession,
  };
}
