import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '@observasi/shared';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  forcePasswordChange: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    localStorage.getItem('accessToken'),
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      setSession: (nextUser, token) => {
        localStorage.setItem('accessToken', token);
        setAccessToken(token);
        setUser(nextUser);
      },
      clearSession: () => {
        localStorage.removeItem('accessToken');
        setAccessToken(null);
        setUser(null);
      },
    }),
    [user, accessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}
