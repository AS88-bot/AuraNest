'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import hi from '@/locales/hi.json';
import it from '@/locales/it.json';


type Locale = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'it';

const translations: Record<Locale, any> = {
  en,
  es,
  fr,
  de,
  hi,
  it,
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, specificLocale?: Locale) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && translations[savedLocale]) {
      setLocale(savedLocale);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    if (isMounted) {
      localStorage.setItem('locale', newLocale);
    }
    setLocale(newLocale);
  };

  const t = useCallback((key: string, specificLocale?: Locale): string => {
    const targetLocale = specificLocale || locale;
    const keys = key.split('.');
    let result = translations[targetLocale];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        return fallbackResult;
      }
    }
    return result || key;
  }, [locale]);

  if (!isMounted) {
    // Avoid rendering mismatch between server and client
    return null;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
