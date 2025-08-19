#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const MODE = process.argv[2] || 'local'; // local | development | production

// Root env variables (for scripts/tools)
const rootEnv = {
  local: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'OPENAI_API_KEY', 'BASE_URL'],
  development: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'OPENAI_API_KEY', 'BASE_URL'],
  production: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY', 'OPENAI_API_KEY', 'BASE_URL'],
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

// Root env resolution
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
for (const k of rootEnv) {
  if (!rootVars[k] || rootVars[k] === 'replace_me') missing.push(`[root] ${k}`);
}
for (const k of webEnv) {
  if (!webVars[k] || webVars[k] === 'replace_me') missing.push(`[web] ${k}`);
}

if (missing.length) {
  console.error(`❌ Missing required env variables for '${MODE}':\n` + missing.map((m) => ` - ${m}`).join('\n'));
  process.exit(1);
} else {
  console.log(`✅ Env check passed for '${MODE}'. Root file: ${rootFile || 'N/A'}; Web file: ${webFile || 'N/A'}`);
}
