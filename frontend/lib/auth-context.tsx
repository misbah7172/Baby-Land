'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getMe, logout as apiLogout } from './api';
import type { SessionUser } from './types';

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<SessionUser | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const result = await getMe();
    setUser(result.user);
    return result.user;
  };

  useEffect(() => {
    refreshUser()
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = Boolean(user?.email && adminEmail && user.email === adminEmail);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    isAdmin,
    refreshUser,
    logout
  }), [user, loading, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
