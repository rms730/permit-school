"use client";

import React, { createContext, useContext, ReactNode } from 'react';

import { type SupportedLocale, type Dictionary } from './index';

interface I18nContextType {
  locale: SupportedLocale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
  locale: SupportedLocale;
  dict: Dictionary;
}

export function I18nProvider({ children, locale, dict }: I18nProviderProps) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    // During build time or when context is not available, return a fallback
    if (typeof window === 'undefined') {
      // Server-side rendering or build time
      return {
        locale: 'en' as SupportedLocale,
        dict: {} as Dictionary
      };
    }
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
