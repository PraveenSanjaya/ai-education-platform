import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, tokenStore } from '../lib/api';
import type { Level, User } from '../lib/types';
import { pendingChallenge } from '../lib/challenge';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    startLevel: Level;
  }) => Promise<void>;
  setChallenge: (c: 'easy' | 'hard') => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  useEffect(() => {
    if (!tokenStore.get()) return;
    api<{ user: User }>('/users/me')
      .then((r) => setUser(r.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    tokenStore.set(r.token);
    setUser(r.user);
  }, []);

  const register: AuthState['register'] = useCallback(async (data) => {
    const r = await api<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { ...data, challenge: pendingChallenge.get() ?? undefined },
    });
    pendingChallenge.clear();
    tokenStore.set(r.token);
    setUser(r.user);
  }, []);

  const setChallenge = useCallback(async (challenge: 'easy' | 'hard') => {
    const r = await api<{ user: User }>('/users/me', { method: 'PUT', body: { challenge } });
    setUser(r.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, setUser, setChallenge }),
    [user, loading, login, register, logout, setChallenge],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
