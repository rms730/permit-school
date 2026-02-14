import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdmin() {
  // Prefer server-only SUPABASE_URL, but fall back to NEXT_PUBLIC_SUPABASE_URL
  // so local dev can work even when only the web env file is configured.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY environment variables",
    );
  }

  return createClient(url, key);
}
