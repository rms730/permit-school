import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make_admin.mjs user@example.com");
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const {
  data: { users },
  error: listErr,
} = await supabase.auth.admin.listUsers();
if (listErr) throw listErr;

const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error("User not found. Ensure they have signed up and confirmed.");
  process.exit(1);
}

const { error: updErr } = await supabase.auth.admin.updateUserById(user.id, {
  app_metadata: { role: "admin" },
});
if (updErr) throw updErr;

console.log(`Promoted ${email} (${user.id}) to admin.`);
