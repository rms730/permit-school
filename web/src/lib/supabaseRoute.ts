import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getRouteClient() {
  return createRouteHandlerClient({ cookies });
}
