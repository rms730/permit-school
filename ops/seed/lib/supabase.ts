import "dotenv-flow/config";
import { createClient } from "@supabase/supabase-js";

export function getAdmin() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or service/anon key in env.");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
