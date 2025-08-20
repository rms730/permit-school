// tools/env/check.mjs
import { z } from 'zod';
import 'dotenv-flow/config'; // loads .env*, e.g., .env.local, .env.dev, .env.prod

const boolStr = z.enum(['true', 'false']).transform(v => v === 'true');

const baseSchema = z.object({
  SUPABASE_URL: z.string().url({ message: 'SUPABASE_URL must be a valid URL' }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, 'SUPABASE_SERVICE_ROLE_KEY is required (server-only)'),
  SUPABASE_ANON_KEY: z.string().min(10, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().min(10, 'OPENAI_API_KEY is required'),
  TESTKIT_ON: boolStr.default('false'),
  TESTKIT_TOKEN: z.string().optional(),
  BASE_URL: z.string().url().default('http://localhost:3000'),
  CI: boolStr.default('false'),
});

function mask(v) {
  if (!v) return v;
  if (v.length <= 8) return '********';
  return `${v.slice(0, 4)}…${v.slice(-4)}`;
}

function parseArgs() {
  const envArg = process.argv.find(a => a.startsWith('--env='));
  const mode = envArg ? envArg.split('=')[1] : process.env.NODE_ENV || 'development';
  return { mode };
}

function refineByMode(mode, parsed) {
  // Example: production must use https Supabase URL.
  if (mode === 'production' && !parsed.SUPABASE_URL.startsWith('https://')) {
    throw new Error('In production, SUPABASE_URL must use https://');
  }
  // If TESTKIT_ON=true then TESTKIT_TOKEN is required (non-prod usage).
  if (parsed.TESTKIT_ON && !parsed.TESTKIT_TOKEN) {
    throw new Error('TESTKIT_TOKEN is required when TESTKIT_ON=true');
  }
}

try {
  const { mode } = parseArgs();
  const parsed = baseSchema.parse(process.env);
  refineByMode(mode, parsed);

  const redacted = Object.fromEntries(
    Object.entries(parsed).map(([k, v]) => {
      if (k.includes('KEY') || k.includes('TOKEN') || k.includes('API')) return [k, mask(String(v))];
      return [k, v];
    })
  );

  console.log(`✅ Root env validation passed for mode=${mode}`);
  console.table(redacted);
} catch (err) {
  console.error('❌ Root env validation failed:\n', err?.issues ?? err?.message ?? err);
  process.exit(1);
}
