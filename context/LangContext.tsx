'use client';
import { createContext, useContext, useState } from 'react';
import { LANG } from '@/lib/data';

const LangContext = createContext<any>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const toggle = () => setLang(l => l === 'en' ? 'hi' : 'en');
  const t = LANG[lang];
  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
