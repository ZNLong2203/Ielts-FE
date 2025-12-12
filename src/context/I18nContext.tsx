"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import enMessages from '@/i18n/messages/en.json';
import viMessages from '@/i18n/messages/vi.json';

type Locale = 'en' | 'vi';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper function to flatten nested object
function flattenMessages(messages: any, prefix = ''): Record<string, string> {
  let flattened: Record<string, string> = {};
  
  for (const key in messages) {
    const value = messages[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattened = { ...flattened, ...flattenMessages(value, newKey) };
    } else {
      flattened[newKey] = String(value);
    }
  }
  
  return flattened;
}

// Pre-load all messages
const messagesCache: Record<Locale, Record<string, string>> = {
  en: flattenMessages(enMessages),
  vi: flattenMessages(viMessages),
};

function getMessages(locale: Locale): Record<string, string> {
  return messagesCache[locale] || messagesCache.en;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load initial locale
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check query parameter first (e.g., ?lang=vi)
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang') as Locale;
      
      let initialLocale: Locale = 'en';
      
      if (langParam && (langParam === 'en' || langParam === 'vi')) {
        initialLocale = langParam;
        localStorage.setItem('locale', langParam);
        // Remove query param after setting
        const url = new URL(window.location.href);
        url.searchParams.delete('lang');
        window.history.replaceState({}, '', url);
      } else {
        // Otherwise, load from localStorage
        const savedLocale = localStorage.getItem('locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) {
          initialLocale = savedLocale;
        }
      }

      setLocaleState(initialLocale);
      // Update HTML lang attribute
      document.documentElement.lang = initialLocale;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      // Update HTML lang attribute
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const messages = getMessages(locale);
    let translation = messages[key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(
          new RegExp(`\\{${paramKey}\\}`, 'g'),
          String(paramValue)
        );
      });
    }
    
    return translation;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

