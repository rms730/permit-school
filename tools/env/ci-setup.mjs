#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const rootFile = '.env.local';
const webFile = path.join('web', '.env.local');

const requiredRoot = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'BASE_URL',
  'TESTKIT_ON',
  'TESTKIT_TOKEN',
];

const requiredWeb = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_ENV',
  'NEXT_PUBLIC_SITE_URL',
];

function ensure(keys, context) {
  const missing = keys.filter(k => !process.env[k] || String(process.env[k]).trim() === '');
  if (missing.length) {
    console.error(`❌ Missing required ${context} env vars:`, missing.join(', '));
    console.error('Please add these to GitHub Secrets/Variables in Settings → Secrets and variables → Actions');
    process.exit(1);
  }
}

function writeEnv(file, entries) {
  const lines = Object.entries(entries)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}=${v}`);
  
  // Ensure directory exists
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(file, lines.join('\n') + '\n');
  console.log(`✅ wrote ${file} (${lines.length} entries)`);
}

function main() {
  console.log('👷 Writing CI .env files from GitHub Secrets/Variables...');
  
  // Validate required environment variables
  ensure(requiredRoot, 'root');
  ensure(requiredWeb, 'web');

  // Root environment file
  writeEnv(rootFile, {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    BASE_URL: process.env.BASE_URL,
          TESTKIT_ON: 'true',
      TESTKIT_TOKEN: process.env.TESTKIT_TOKEN || 'dev-super-secret',
    CI: 'true',
  });

  // Web environment file
  writeEnv(webFile, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'ci',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || process.env.BASE_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    NEXT_PUBLIC_COMMIT_SHA: process.env.GITHUB_SHA || '',
    NEXT_PUBLIC_BUILD_AT: process.env.GITHUB_RUN_STARTED_AT || new Date().toISOString(),
  });

  console.log('✅ CI environment setup complete');
}

main();
