'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const dynamic = 'force-dynamic';

export default function SignOutPage() {
  useEffect(() => {
    const supabase = createPagesBrowserClient();
    supabase.auth.signOut().finally(() => {
      window.location.href = '/';
    });
  }, []);
  return null;
}
