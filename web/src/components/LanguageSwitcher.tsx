"use client";

import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { setLocaleCookie } from '@/lib/i18n';
import { type SupportedLocale } from '@/lib/i18n/locales';

interface LanguageSwitcherProps {
  onLocaleChange?: (locale: SupportedLocale) => void;
}

export default function LanguageSwitcher({ onLocaleChange }: LanguageSwitcherProps) {
  const { locale } = useI18n();

  const handleLocaleChange = async (newLocale: SupportedLocale) => {
    if (newLocale === locale) return;
    
    setLocaleCookie(newLocale);
    onLocaleChange?.(newLocale);
    
    // Try to update profile locale if user is signed in
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale: newLocale }),
      });
      
      if (!response.ok) {
        console.warn('Failed to update profile locale');
      }
    } catch (error) {
      console.warn('Error updating profile locale:', error);
    }
    
    // Trigger a page refresh to apply the new locale
    window.location.reload();
  };

  return (
    <ButtonGroup size="small" variant="outlined">
      <Button
        onClick={() => handleLocaleChange('en')}
        variant={locale === 'en' ? 'contained' : 'outlined'}
        sx={{ 
          minWidth: 'auto',
          px: 1,
          fontSize: '0.75rem'
        }}
      >
        EN
      </Button>
      <Button
        onClick={() => handleLocaleChange('es')}
        variant={locale === 'es' ? 'contained' : 'outlined'}
        sx={{ 
          minWidth: 'auto',
          px: 1,
          fontSize: '0.75rem'
        }}
      >
        ES
      </Button>
    </ButtonGroup>
  );
}
