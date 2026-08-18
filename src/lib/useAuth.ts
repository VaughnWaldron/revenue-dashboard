import { useCallback, useEffect, useState } from 'react';
import { checkAuth, login as loginRequest, logout as logoutRequest } from './api';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('checking');

  const refresh = useCallback(async () => {
    try {
      const { authenticated } = await checkAuth();
      setStatus(authenticated ? 'authenticated' : 'unauthenticated');
    } catch {
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (password: string) => {
    await loginRequest(password);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setStatus('unauthenticated');
  }, []);

  return { status, login, logout, refresh };
}
