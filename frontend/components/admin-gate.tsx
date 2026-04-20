'use client';

import { useEffect, useState } from 'react';

type AdminGateProps = {
  children: React.ReactNode;
  expectedEmail: string;
  expectedPassword: string;
};

export function AdminGate({ children, expectedEmail, expectedPassword }: AdminGateProps) {
  const [checking, setChecking] = useState(true);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAdminAuthed(sessionStorage.getItem('admin-authenticated') === 'true');
    setChecking(false);
  }, []);

  const handleAdminLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (email !== expectedEmail || password !== expectedPassword) {
      setError('Invalid admin credentials.');
      return;
    }

    sessionStorage.setItem('admin-authenticated', 'true');
    sessionStorage.setItem('admin-auth-email', email);
    setAdminAuthed(true);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFB6A3] mx-auto"></div>
          <p className="text-[#777777] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!adminAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#FADADD] bg-white p-8 shadow-md">
          <h1 className="text-center text-2xl font-bold text-[#333333]">Admin Login</h1>
          <p className="mt-2 text-center text-[#777777]">Sign in with admin credentials to continue.</p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
            <input
              type="email"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setEmail((event.currentTarget as unknown as { value: string }).value)
              }
              placeholder="Admin email"
              className="w-full rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setPassword((event.currentTarget as unknown as { value: string }).value)
              }
              placeholder="Admin password"
              className="w-full rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none transition focus:border-[#FFB6A3]"
              required
            />
            {error ? <p className="text-sm text-[#c4524d]">{error}</p> : null}
            <button
              type="submit"
              className="w-full rounded-2xl bg-[#FFB6A3] px-6 py-3 text-white transition hover:opacity-90"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
