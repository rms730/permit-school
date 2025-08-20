#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { readEnvFile, writeEnvFile, ensureFromExample, mergeKey } from './utils.mjs';

const ROOT = process.cwd();
const fileMappings = {
  local:  { root: '.env.local', web: 'web/.env.local', exampleRoot: 'env-examples/root.env.local.example', exampleWeb: 'env-examples/web.env.local.example' },
  development: { root: '.env.dev', web: 'web/.env.development', exampleRoot: 'env-examples/root.env.dev.example', exampleWeb: 'env-examples/web.env.development.example' },
  production:  { root: '.env.prod', web: 'web/.env.production', exampleRoot: 'env-examples/root.env.prod.example', exampleWeb: 'env-examples/web.env.production.example' },
};

// Helper: basic terminal prompt
function ask(question, { mask = false, defaultValue } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!mask) {
      const promptText = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
      rl.question(promptText, (ans) => { rl.close(); resolve(ans || defaultValue || ''); });
    } else {
      const stdin = process.stdin;
      const stdout = process.stdout;
      stdout.write(question + (defaultValue ? ` [hidden default exists]` : '') + ': ');
      stdin.resume();
      stdin.setRawMode?.(true);
      let input = '';
      stdin.on('data', (char) => {
        char = char + '';
        if (char === '\n' || char === '\r' || char === '\u0004') {
          stdin.setRawMode?.(false);
          stdout.write('\n');
          rl.close();
          resolve(input || defaultValue || '');
        } else if (char === '\u0003') { // ctrl-c
          process.exit(1);
        } else {
          input += char;
        }
      });
    }
  });
}

const validators = {
  url(v) { try { new URL(v); return true; } catch { return false; } },
  email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
  secret(v) { return typeof v === 'string' && v.length > 0; },
  supabaseUrl(v) { return /^https:\/\/.*\.supabase\.co$/.test(v) || /^http:\/\/127\.0\.0\.1:54321$/.test(v); },
  supabaseJwtLike(v) { return /^eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+$/.test(v); },
  stripeSecret(v) { return /^sk_(test|live)_/.test(v); },
  stripePublishable(v) { return /^pk_(test|live)_/.test(v); },
  stripeWebhook(v) { return /^whsec_/.test(v); },
  resendKey(v) { return /^re_/.test(v); },
};

function looksSensitive(v) {
  return /^sk_/.test(v) || /^whsec_/.test(v) || /^eyJ/.test(v);
}

const manifest = [
  // --- Supabase ---
  { name: 'SUPABASE_URL', desc: 'Supabase project URL (local or cloud)', type: 'supabaseUrl' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase service role key (server-side only)', type: 'supabaseJwtLike', secret: true },
  { name: 'SUPABASE_ANON_KEY', desc: 'Supabase anon key', type: 'supabaseJwtLike', secret: true },
  { name: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase URL for client', type: 'supabaseUrl', webOnly: true },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', desc: 'Supabase anon key for client', type: 'supabaseJwtLike', webOnly: true, secret: true },

  // --- Stripe ---
  { name: 'STRIPE_SECRET_KEY', desc: 'Stripe secret key', type: 'stripeSecret', secret: true },
  { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', desc: 'Stripe publishable key', type: 'stripePublishable' },
  { name: 'STRIPE_WEBHOOK_SECRET', desc: 'Stripe webhook secret', type: 'stripeWebhook', secret: true },

  // --- Resend ---
  { name: 'RESEND_API_KEY', desc: 'Resend API key', type: 'resendKey', secret: true },

  // --- Sentry (optional) ---
  { name: 'SENTRY_DSN', desc: 'Sentry DSN (server)', type: 'url', optional: true },
  { name: 'NEXT_PUBLIC_SENTRY_DSN', desc: 'Sentry DSN (client)', type: 'url', optional: true },

  // --- URLs & Email ---
  { name: 'BASE_URL', desc: 'Base URL for app (root scripts)', type: 'url' },
  { name: 'APP_BASE_URL', desc: 'Base URL for emails (root/web)', type: 'url' },
  { name: 'NEXT_PUBLIC_SITE_URL', desc: 'Public site URL (client)', type: 'url', webOnly: true },
  { name: 'FROM_EMAIL', desc: 'From email address', type: 'email' },
  { name: 'SUPPORT_EMAIL', desc: 'Support email address', type: 'email' },
  { name: 'NEXT_PUBLIC_SUPPORT_EMAIL', desc: 'Support email for client', type: 'email', webOnly: true },

  // --- Admin/Regulatory ---
  { name: 'ADMIN_JOB_TOKEN', desc: 'Admin job token (HMAC endpoints)', type: 'secret', secret: true },
  { name: 'REGULATORY_SIGNING_SECRET', desc: 'Regulatory manifest signing secret', type: 'secret', secret: true },
];

function getEnvFilesForTarget(target) {
  const m = fileMappings[target];
  return [
    { kind: 'root', file: path.join(ROOT, m.root), example: path.join(ROOT, m.exampleRoot) },
    { kind: 'web',  file: path.join(ROOT, m.web),  example: path.join(ROOT, m.exampleWeb) },
  ];
}

function prefillValue(name, files) {
  for (const { file } of files) {
    const { map } = readEnvFile(file);
    if (map.has(name)) return map.get(name);
  }
  return '';
}

async function main() {
  console.log('🔧 Environment Setup (secure & scoped)\n');

  const targetsAns = (await ask('Select environments (comma-separated): local, development, production', { defaultValue: 'local' }))
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const validTargets = ['local','development','production'];
  const targets = targetsAns.filter(t => validTargets.includes(t));
  if (targets.length === 0) {
    console.error('No valid environments selected. Exiting.');
    process.exit(1);
  }

  const dryRun = (await ask('Dry run? (y/N)', { defaultValue: 'N' })).toLowerCase().startsWith('y');
  const makeBackup = (await ask('Create .bak backups? (Y/n)', { defaultValue: 'Y' })).toLowerCase() !== 'n';

  // Ensure files exist (copy from examples if available)
  for (const t of targets) {
    for (const f of getEnvFilesForTarget(t)) {
      ensureFromExample(f.file, f.example);
    }
  }

  const changes = []; // { target, kind, file, name, oldValue, newValue }

  for (const v of manifest) {
    // Skip writing webOnly vars into root files and vice versa (we'll handle scoping during write)
    const allFiles = targets.flatMap(t => getEnvFilesForTarget(t));
    const prefill = prefillValue(v.name, allFiles) || '';

    const question = `${v.name} — ${v.desc}`;
    const value = await ask(question, { mask: !!v.secret, defaultValue: prefill });

    if (!value && v.optional) {
      console.log(`⏭️  Skipped optional ${v.name}`);
      continue;
    }
    if (!value && !v.optional) {
      console.log(`❌ ${v.name} is required. Please rerun if needed.`);
      continue;
    }

    // Validate
    const validator = validators[v.type] || (() => true);
    if (!validator(value)) {
      console.log(`❌ Invalid value for ${v.name} (${v.type}). Skipping.`);
      continue;
    }

    // Apply to selected targets with scoping
    for (const target of targets) {
      const files = getEnvFilesForTarget(target);
      for (const f of files) {
        // Respect webOnly scope
        if (v.webOnly && f.kind !== 'web') continue;
        // Warn if writing sensitive value to NEXT_PUBLIC_ var
        if (v.name.startsWith('NEXT_PUBLIC_') && looksSensitive(value)) {
          console.log(`⚠️  WARNING: ${v.name} looks sensitive; avoid exposing secrets via NEXT_PUBLIC_. Skipping.`);
          continue;
        }
        const { map, order, eol } = readEnvFile(f.file);
        const oldValue = map.get(v.name) || '';
        if (!dryRun) {
          mergeKey(map, v.name, value);
          writeEnvFile(f.file, map, order, eol, { backup: makeBackup });
        }
        changes.push({ target, kind: f.kind, file: f.file, name: v.name, oldValue, newValue: value });
      }
    }
  }

  // Preview/summary
  console.log('\n📄 Summary of changes:');
  for (const c of changes) {
    const oldMasked = (c.oldValue && c.oldValue.length) ? '****' : '(none)';
    const newMasked = '****';
    console.log(`  [${c.target}][${c.kind}] ${c.name}: ${oldMasked} -> ${newMasked} (${path.relative(ROOT, c.file)})`);
  }
  if (dryRun) {
    console.log('\n✅ Dry run complete (no files written).');
  } else {
    console.log('\n✅ Updates complete. Backups created:', makeBackup ? 'yes' : 'no');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
