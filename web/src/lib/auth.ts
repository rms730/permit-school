"use client";

import { createClient } from "@supabase/supabase-js";

// Create Supabase client for auth operations
export function createAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: true } }
  );
}

// Google OAuth sign-in function
export async function signInWithGoogle(redirectTo: string) {
  const supabase = createAuthClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { 
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  if (error) throw error;
}

// Profile upsert interface
export interface ProfileUpsertData {
  id: string;
  full_name?: string;
  avatar_url?: string;
  preferred_name?: string;
  locale?: string;
}

// Profile upsert function (server-side)
export async function upsertProfile(data: ProfileUpsertData) {
  const response = await fetch('/api/auth/profile/upsert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to upsert profile');
  }
  
  return response.json();
}
