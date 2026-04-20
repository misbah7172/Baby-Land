'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { languageCookieName, normalizeLanguage, type Language } from './i18n';

type BrowserDocument = {
  documentElement: { lang: string };
  body?: { classList: { toggle: (token: string, force?: boolean) => void } };
  cookie: string;
};

type BrowserStorage = {
  setItem: (key: string, value: string) => void;
};

function getBrowserDocument() {
  return (globalThis as { document?: BrowserDocument }).document;
}

function getBrowserStorage() {
  return (globalThis as { localStorage?: BrowserStorage }).localStorage;
}

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children, initialLanguage }: { children: React.ReactNode; initialLanguage: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const applyLanguage = (nextLanguage: Language) => {
    const normalizedLanguage = normalizeLanguage(nextLanguage);
    setLanguageState(normalizedLanguage);
    const browserDocument = getBrowserDocument();
    if (browserDocument) {
      browserDocument.documentElement.lang = normalizedLanguage;
      browserDocument.body?.classList.toggle('lang-bn', normalizedLanguage === 'bn');
      browserDocument.cookie = `${languageCookieName}=${normalizedLanguage}; path=/; max-age=31536000`;
    }

    try {
      getBrowserStorage()?.setItem(languageCookieName, normalizedLanguage);
    } catch {
      // ignore storage issues
    }
  };

  useEffect(() => {
    const browserDocument = getBrowserDocument();
    if (browserDocument) {
      browserDocument.documentElement.lang = language;
      browserDocument.body?.classList.toggle('lang-bn', language === 'bn');
      browserDocument.cookie = `${languageCookieName}=${language}; path=/; max-age=31536000`;
    }
    try {
      getBrowserStorage()?.setItem(languageCookieName, language);
    } catch {
      // ignore storage issues
    }
  }, [language]);

  const value = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage: applyLanguage
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}