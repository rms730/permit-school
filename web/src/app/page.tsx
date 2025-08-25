"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DEFAULT_LOCALE } from '../lib/i18n/locales';

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/${DEFAULT_LOCALE}`);
  }, [router]);
  
  return null;
}
