#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const MODE = process.argv[2] || 'local'; // local | development | production

// Root env variables (for scripts/tools) - source of truth
const rootEnv = {
  local: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'BASE_URL'],
  development: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'BASE_URL'],
  production: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'BASE_URL'],
}[MODE];

// Web env variables (for Next.js app)
const webEnv = {
  local: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  development: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  production: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
}[MODE];

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return {};
  const content = fs.readFileSync(file, 'utf8');
  return Object.fromEntries(
    content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => {
        const idx = l.indexOf('=');
        const key = idx === -1 ? l : l.slice(0, idx);
        const value = idx === -1 ? '' : l.slice(idx + 1);
        return [key, value];
      })
  );
}

function findFile(candidates) {
  for (const f of candidates) {
    if (fs.existsSync(f)) return f;
  }
  return null;
}

// Root env resolution (source of truth for scripts/tools)
const rootCandidates = {
  local: ['.env.local', '.env'],
  development: ['.env.dev', '.env'],
  production: ['.env.prod', '.env'],
}[MODE].map((f) => path.join(process.cwd(), f));
const rootFile = findFile(rootCandidates);
const rootVars = rootFile ? loadDotEnv(rootFile) : {};

// Web env resolution
const webDir = path.join(process.cwd(), 'web');
const webCandidates = {
  local: [path.join(webDir, '.env.local'), path.join(webDir, '.env')],
  development: [path.join(webDir, '.env.development'), path.join(webDir, '.env')],
  production: [path.join(webDir, '.env.production'), path.join(webDir, '.env')],
}[MODE];
const webFile = findFile(webCandidates);
const webVars = webFile ? loadDotEnv(webFile) : {};

let missing = [];
let warnings = [];

// Check required root variables
for (const k of rootEnv) {
  if (!rootVars[k] || rootVars[k] === 'REPLACE_WITH_LOCAL_SERVICE_ROLE_KEY' || rootVars[k] === 'REPLACE_WITH_DEV_SERVICE_ROLE_KEY' || rootVars[k] === 'REPLACE_WITH_PROD_SERVICE_ROLE_KEY') {
    missing.push(`[root] ${k}`);
  }
}

// Check TESTKIT_TOKEN if TESTKIT_ON=true
if (rootVars.TESTKIT_ON === 'true' && (!rootVars.TESTKIT_TOKEN || rootVars.TESTKIT_TOKEN === 'REPLACE_WITH_TESTKIT_TOKEN')) {
  missing.push(`[root] TESTKIT_TOKEN (required when TESTKIT_ON=true)`);
}

// Check web variables
for (const k of webEnv) {
  if (!webVars[k] || webVars[k] === 'replace_me') missing.push(`[web] ${k}`);
}

// Optional warnings
if (!rootVars.OPENAI_API_KEY) {
  warnings.push(`[root] OPENAI_API_KEY (optional - only needed for content generation scripts)`);
}

if (missing.length) {
  console.error(`❌ Missing required env variables for '${MODE}':\n` + missing.map((m) => ` - ${m}`).join('\n'));
  if (warnings.length) {
    console.warn(`⚠️  Optional variables:\n` + warnings.map((w) => ` - ${w}`).join('\n'));
  }
  process.exit(1);
} else {
  console.log(`✅ Env check passed for '${MODE}'. Root file: ${rootFile || 'N/A'}; Web file: ${webFile || 'N/A'}`);
  if (warnings.length) {
    console.warn(`⚠️  Optional variables:\n` + warnings.map((w) => ` - ${w}`).join('\n'));
  }
}
