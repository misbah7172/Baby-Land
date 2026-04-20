'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

import { getMe, logout as apiLogout } from './api';
import type { SessionUser } from './types';
import { auth, signOutFirebase } from './firebase';

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
    try {
      const result = await getMe();
      setUser(result.user);
      return result.user;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    refreshUser()
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, firebaseUser => {
      if (!firebaseUser) {
        return;
      }

      setUser(currentUser => {
        if (currentUser?.email) {
          return currentUser;
        }

        return {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
          email: firebaseUser.email || 'unknown@google.local',
          role: 'CUSTOMER',
          phone: firebaseUser.phoneNumber
        };
      });
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore backend logout errors for Firebase-only sessions.
    }
    await signOutFirebase();
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
