"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { register } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { Button, Card } from '@/components/ui';
import { signInWithGooglePopup } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { language } = useLanguage();
  const text = getCopy(language);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formData = new (FormData as any)(event.currentTarget);
    try {
      const payload = Object.fromEntries(formData.entries()) as { name: string; email: string; password: string };
      await register(payload);
      await refreshUser();
      setMessage('Account created successfully. Redirecting...');
      router.push('/');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    try {
      await signInWithGooglePopup();
      await refreshUser();
      setMessage('Signed in successfully with Google. Redirecting...');
      router.push('/');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-[#FFF8F0] flex items-center">
      <div className="mx-auto w-full max-w-md px-4 py-10 md:px-8 md:py-0">
        <div className="text-center mb-8">
          <span className="inline-block bg-[#FADADD] text-[#333333] px-4 py-2 rounded-2xl text-sm font-semibold mb-4">
            {text.register.badge}
          </span>
          <h1 className="text-4xl font-bold text-[#333333] mt-4">{text.register.title}</h1>
          <p className="text-[#777777] mt-2">{text.register.subtitle}</p>
        </div>
        
        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              name="name" 
              placeholder={text.register.name} 
              required
              className="w-full rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10 transition" 
            />
            <input 
              name="email" 
              placeholder={text.register.email} 
              type="email"
              required
              className="w-full rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10 transition" 
            />
            <input 
              name="password" 
              type="password" 
              placeholder={text.register.password} 
              required
              minLength={8}
              className="w-full rounded-2xl border border-[#FADADD] bg-white px-4 py-3 outline-none focus:border-[#FFB6A3] focus:ring-2 focus:ring-[#FFB6A3] focus:ring-opacity-10 transition" 
            />
            <Button type="submit" className="w-full bg-[#FFB6A3] text-white hover:opacity-90" disabled={loading}>
              {loading ? text.register.submitting : text.register.submit}
            </Button>
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full rounded-2xl border border-[#FADADD] bg-white px-4 py-3 text-sm font-semibold text-[#333333] transition hover:bg-[#FFF8F0] disabled:opacity-60"
            >
              {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
            </button>
            {message && (
              <div className={`p-3 rounded-2xl text-sm text-center ${
                message.includes('successfully') 
                  ? 'bg-[#D5F5E3] text-[#2d7a5e]' 
                  : 'bg-[#FFE4E4] text-[#c4524d]'
              }`}>
                {message}
              </div>
            )}
            <div className="text-center text-sm text-[#777777] pt-2">
              {text.register.switchText} <Link href="/login" className="text-[#FFB6A3] font-semibold hover:underline">{text.register.switchLink}</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}