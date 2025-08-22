#!/usr/bin/env node

/**
 * Environment Seeding Script
 * 
 * This script automatically seeds .env files with consistent values across
 * related variables. It ensures that variables with similar purposes have
 * matching values (e.g., NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and STRIPE_PUBLISHABLE_KEY).
 * 
 * Features:
 * - Auto-generates secure tokens and secrets
 * - Cross-file synchronization
 * - Preserves existing values
 * - Supports local, dev, and prod environments
 * - Dry-run mode with diff output
 * - Automatic backups
 * - Validation of API keys and URLs
 * - Robust dotenv parsing/stringifying
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// CLI arguments
const args = process.argv.slice(2);
const options = {
  env: 'local',
  dryRun: false,
  force: false,
  nonInteractive: false,
  json: false,
  files: null,
  help: false
};

// Parse CLI arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  switch (arg) {
    case '--env':
      options.env = args[++i] || 'local';
      break;
    case '--dry-run':
      options.dryRun = true;
      break;
    case '--force':
      options.force = true;
      break;
    case '--non-interactive':
    case '-n':
      options.nonInteractive = true;
      break;
    case '--json':
      options.json = true;
      break;
    case '--files':
      options.files = args[++i] || '';
      break;
    case '--help':
    case '-h':
      options.help = true;
      break;
  }
}

// Show help
if (options.help) {
  console.log(`
🌱 Environment Seeding Script

Usage:
  node scripts/seed-env.mjs [options]

Options:
  --env <local|dev|prod|all>    Target environment(s) (default: local)
  --dry-run                     Show changes without writing files
  --force                       Skip validation warnings
  -n, --non-interactive         Generate all security tokens without prompts
  --json                        Output machine-readable change report
  --files <paths>               Comma-separated list of custom file paths
  -h, --help                    Show this help message

Examples:
  node scripts/seed-env.mjs --env local                    # Local only
  node scripts/seed-env.mjs --env all --dry-run            # Preview all changes
  node scripts/seed-env.mjs --env prod --non-interactive   # Production setup
  npm run env:seed                                           # From web directory
`);
  process.exit(0);
}

// Environment file mappings
const ENV_FILES = {
  local: {
    root: ['.env.local'],
    web: ['web/.env.local']
  },
  dev: {
    root: ['.env.dev'],
    web: ['web/.env.development']
  },
  prod: {
    root: ['.env.prod'],
    web: ['web/.env.production']
  },
  all: {
    root: ['.env.local', '.env.dev', '.env.prod'],
    web: ['web/.env.local', 'web/.env.development', 'web/.env.production']
  }
};

// Configuration for seeding values
const SEED_VALUES = {
  // Supabase - Local development
  supabase: {
    url: 'http://127.0.0.1:54321',
    anonKey: 'local_dev_anon_key',
    serviceRoleKey: 'local_dev_service_role_key',
    functionsUrl: 'http://127.0.0.1:54321/functions/v1'
  },
  
  // Stripe - Test keys (replace with your actual test keys)
  stripe: {
    publishableKey: 'pk_test_your_publishable_key_here',
    secretKey: 'sk_test_your_secret_key_here',
    webhookSecret: 'whsec_your_webhook_secret_here',
    priceId: 'price_your_test_price_id_here'
  },
  
  // App URLs
  app: {
    baseUrl: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    siteUrl: 'http://localhost:3000'
  },
  
  // Email configuration
  email: {
    from: 'no-reply@yourdomain.com',
    support: 'support@yourdomain.com',
    resendKey: 're_your_resend_api_key_here'
  },
  
  // Monitoring
  monitoring: {
    sentryDsn: 'https://your_sentry_dsn_here'
  },
  
  // Security tokens (will be auto-generated)
  security: {
    adminToken: null, // Will be generated
    backgroundWorkerToken: null, // Will be generated
    regulatorySigningSecret: null, // Will be generated
    fulfillmentHmacSecret: null, // Will be generated
    mfaSecret: null // Will be generated
  },
  
  // Google
  google: {
    clientId: 'your_google_client_id_here'
  },
  
  // OpenAI
  openai: {
    apiKey: 'sk-proj_your_openai_key_here'
  }
};

// Security variables that can be auto-generated
const GENERATABLE_SECURITY_VARS = [
  'ADMIN_JOB_TOKEN',
  'BACKGROUND_WORKER_TOKEN', 
  'REGULATORY_SIGNING_SECRET',
  'FULFILLMENT_HMAC_SECRET',
  'MFA_SECRET'
];

// Deterministic variable mappings - private/non-public values are source of truth
const VARIABLE_MAPPINGS = {
  // Supabase
  'SUPABASE_URL': 'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_ANON_KEY': 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  
  // Stripe
  'STRIPE_PUBLISHABLE_KEY': 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  
  // App URLs
  'APP_BASE_URL': 'NEXT_PUBLIC_APP_BASE_URL',
  'BASE_URL': 'NEXT_PUBLIC_SITE_URL',
  
  // Email
  'SUPPORT_EMAIL': 'NEXT_PUBLIC_SUPPORT_EMAIL',
  
  // Sentry
  'SENTRY_DSN': 'NEXT_PUBLIC_SENTRY_DSN'
};

// Value mappings - maps variable names to their seed values
const VALUE_MAPPINGS = {
  // Supabase
  'SUPABASE_URL': SEED_VALUES.supabase.url,
  'SUPABASE_ANON_KEY': SEED_VALUES.supabase.anonKey,
  'SUPABASE_SERVICE_ROLE_KEY': SEED_VALUES.supabase.serviceRoleKey,
  'SUPABASE_FUNCTIONS_URL': SEED_VALUES.supabase.functionsUrl,
  
  // Stripe
  'STRIPE_PUBLISHABLE_KEY': SEED_VALUES.stripe.publishableKey,
  'STRIPE_SECRET_KEY': SEED_VALUES.stripe.secretKey,
  'STRIPE_WEBHOOK_SECRET': SEED_VALUES.stripe.webhookSecret,
  'STRIPE_PRICE_ID': SEED_VALUES.stripe.priceId,
  
  // App URLs
  'BASE_URL': SEED_VALUES.app.baseUrl,
  'APP_BASE_URL': SEED_VALUES.app.baseUrl,
  'APP_ORIGIN': SEED_VALUES.app.origin,
  
  // Email
  'FROM_EMAIL': SEED_VALUES.email.from,
  'SUPPORT_EMAIL': SEED_VALUES.email.support,
  'RESEND_API_KEY': SEED_VALUES.email.resendKey,
  
  // Monitoring
  'SENTRY_DSN': SEED_VALUES.monitoring.sentryDsn,
  
  // Security (will be populated after generation)
  'ADMIN_JOB_TOKEN': SEED_VALUES.security.adminToken,
  'BACKGROUND_WORKER_TOKEN': SEED_VALUES.security.backgroundWorkerToken,
  'REGULATORY_SIGNING_SECRET': SEED_VALUES.security.regulatorySigningSecret,
  'FULFILLMENT_HMAC_SECRET': SEED_VALUES.security.fulfillmentHmacSecret,
  'MFA_SECRET': SEED_VALUES.security.mfaSecret,
  
  // Google
  'GOOGLE_CLIENT_ID': SEED_VALUES.google.clientId,
  
  // OpenAI
  'OPENAI_API_KEY': SEED_VALUES.openai.apiKey
};

// Validation functions
function isUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function looksLikeStripeKey(value) {
  return /^(sk_(test|live)_|pk_(test|live)_|whsec_)/.test(value);
}

function looksLikeResendKey(value) {
  return /^re_(test|live)_/.test(value);
}

function looksLikeSentryDsn(value) {
  return /^https:\/\/.*@.*\.ingest\.sentry\.io\/.*/.test(value);
}

function maskSecret(value) {
  if (!value || value.length < 8) return value;
  return `${value.substring(0, 4)}...${value.substring(value.length - 4)}`;
}

function isPlaceholder(value) {
  if (!value || value === '') return true;
  return value.includes('your_') || value.includes('REPLACE_WITH_');
}

// Robust dotenv parser that preserves comments and structure
function parseEnvFileWithComments(filePath) {
  if (!fs.existsSync(filePath)) {
    return { variables: new Map(), lines: [], comments: [] };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const variables = new Map();
  const parsedLines = [];
  const comments = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (trimmed.startsWith('#')) {
      comments.push({ line: i, content: line });
      parsedLines.push({ type: 'comment', content: line, original: line });
    } else if (trimmed && trimmed.includes('=')) {
      const equalIndex = trimmed.indexOf('=');
      const key = trimmed.substring(0, equalIndex);
      const value = trimmed.substring(equalIndex + 1);
      
      variables.set(key, value);
      parsedLines.push({ type: 'variable', key, value, original: line });
    } else {
      parsedLines.push({ type: 'empty', content: line, original: line });
    }
  }
  
  return { variables, lines: parsedLines, comments };
}

// Robust dotenv stringifier
function stringifyEnvWithComments(parsed) {
  return parsed.lines.map(line => line.original).join('\n');
}

// Copy example file if target doesn't exist
function copyExampleIfMissing(targetPath) {
  if (fs.existsSync(targetPath)) return targetPath;
  
  const examplePath = `${targetPath}.example`;
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, targetPath);
    console.log(`📋 Copied ${examplePath} → ${targetPath}`);
    return targetPath;
  }
  
  // Create new file with standard header
  const header = `# -------------------------------------------------------------------
# ${path.basename(targetPath)} - Auto-generated by seed-env.mjs
# -------------------------------------------------------------------
# This file is managed by the environment seeding script.
# Manual changes may be overwritten.
# -------------------------------------------------------------------

`;
  fs.writeFileSync(targetPath, header);
  console.log(`📋 Created new file: ${targetPath}`);
  return targetPath;
}

// Append auto-managed block
function appendAutoManagedBlock(filePath, newVariables) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const autoManagedStart = '# --- BEGIN AUTO-MANAGED (seed-env) ---';
  const autoManagedEnd = '# --- END AUTO-MANAGED (seed-env) ---';
  
  let newContent = content;
  
  // Remove existing auto-managed block if present
  const startIndex = content.indexOf(autoManagedStart);
  const endIndex = content.indexOf(autoManagedEnd);
  
  if (startIndex !== -1 && endIndex !== -1) {
    newContent = content.substring(0, startIndex) + content.substring(endIndex + autoManagedEnd.length);
  }
  
  // Add new auto-managed block
  const autoManagedBlock = `\n${autoManagedStart}
${Object.entries(newVariables).map(([key, value]) => `${key}=${value}`).join('\n')}
${autoManagedEnd}\n`;
  
  fs.writeFileSync(filePath, newContent + autoManagedBlock);
}

// Generate security tokens
function generateSecureToken(length = 32, prefix = '') {
  const bytes = crypto.randomBytes(length);
  const token = bytes.toString('base64url');
  return prefix ? `${prefix}_${token}` : token;
}

function generateHmacSecret() {
  return generateSecureToken(64, 'hmac');
}

function generateMfaSecret() {
  const bytes = crypto.randomBytes(20);
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  
  for (let i = 0; i < bytes.length; i += 5) {
    const chunk = bytes.slice(i, i + 5);
    let value = 0;
    
    for (let j = 0; j < chunk.length; j++) {
      value = (value << 8) | chunk[j];
    }
    
    const bits = chunk.length * 8;
    const chars = Math.ceil(bits / 5);
    
    for (let j = 0; j < chars; j++) {
      const index = (value >>> (bits - 5 - j * 5)) & 31;
      result += base32Chars[index];
    }
  }
  
  return result;
}

async function promptYesNo(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function generateSecurityTokens(nonInteractive = false) {
  if (!options.json) {
    console.log('\n🔐 Security Token Generation');
    console.log('============================');
  }
  
  const generatedTokens = {};
  
  for (const varName of GENERATABLE_SECURITY_VARS) {
    let shouldGenerate = nonInteractive;
    
    if (!nonInteractive) {
      shouldGenerate = await promptYesNo(`Generate secure token for ${varName}?`);
    }
    
    if (shouldGenerate) {
      let token;
      switch (varName) {
        case 'MFA_SECRET':
          token = generateMfaSecret();
          break;
        case 'FULFILLMENT_HMAC_SECRET':
          token = generateHmacSecret();
          break;
        default:
          token = generateSecureToken(32, varName.toLowerCase().replace(/_/g, ''));
      }
      
      generatedTokens[varName] = token;
      if (!options.json) {
        console.log(`  ✅ Generated ${varName}: ${maskSecret(token)}`);
      }
    } else {
      if (!options.json) {
        console.log(`  ⏭️  Skipped ${varName}`);
      }
    }
  }
  
  return generatedTokens;
}

// Validate environment variables
function validateEnvironment(variables) {
  const warnings = [];
  
  for (const [key, value] of variables) {
    if (!value || isPlaceholder(value)) continue;
    
    switch (key) {
      case 'SUPABASE_URL':
      case 'NEXT_PUBLIC_SUPABASE_URL':
      case 'APP_BASE_URL':
      case 'NEXT_PUBLIC_APP_BASE_URL':
      case 'BASE_URL':
      case 'NEXT_PUBLIC_SITE_URL':
        if (!isUrl(value)) {
          warnings.push(`${key}: Invalid URL format`);
        }
        break;
      case 'STRIPE_SECRET_KEY':
        if (!looksLikeStripeKey(value)) {
          warnings.push(`${key}: Doesn't look like a valid Stripe secret key`);
        }
        break;
      case 'STRIPE_PUBLISHABLE_KEY':
      case 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY':
        if (!looksLikeStripeKey(value)) {
          warnings.push(`${key}: Doesn't look like a valid Stripe publishable key`);
        }
        break;
      case 'STRIPE_WEBHOOK_SECRET':
        if (!looksLikeStripeKey(value)) {
          warnings.push(`${key}: Doesn't look like a valid Stripe webhook secret`);
        }
        break;
      case 'RESEND_API_KEY':
        if (!looksLikeResendKey(value)) {
          warnings.push(`${key}: Doesn't look like a valid Resend API key`);
        }
        break;
      case 'SENTRY_DSN':
      case 'NEXT_PUBLIC_SENTRY_DSN':
        if (!looksLikeSentryDsn(value)) {
          warnings.push(`${key}: Doesn't look like a valid Sentry DSN`);
        }
        break;
    }
  }
  
  return warnings;
}

// Create backup
function createBackup(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const backupPath = `${filePath}.bak`;
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    if (!options.json) {
      console.log(`💾 Created backup: ${backupPath}`);
    }
  }
}

// Generate unified diff
function generateDiff(originalContent, newContent, filePath) {
  const originalLines = originalContent.split('\n');
  const newLines = newContent.split('\n');
  
  let diff = `--- ${filePath} (original)\n`;
  diff += `+++ ${filePath} (modified)\n`;
  
  for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
    const originalLine = originalLines[i] || '';
    const newLine = newLines[i] || '';
    
    if (originalLine !== newLine) {
      diff += `- ${originalLine}\n`;
      diff += `+ ${newLine}\n`;
    }
  }
  
  return diff;
}

// Process environment file
function processEnvFile(filePath, generatedTokens) {
  const fullPath = path.join(projectRoot, filePath);
  
  // Ensure file exists
  copyExampleIfMissing(fullPath);
  
  // Parse existing content
  const parsed = parseEnvFileWithComments(fullPath);
  const variables = parsed.variables;
  
  // Apply generated tokens first
  const newVariables = new Map();
  for (const [key, value] of Object.entries(generatedTokens)) {
    if (Object.prototype.hasOwnProperty.call(generatedTokens, key)) {
      newVariables.set(key, value);
    }
  }
  
  // Apply value mappings (only for placeholders or missing values)
  for (const [key, value] of Object.entries(VALUE_MAPPINGS)) {
    const existingValue = variables.get(key);
    if (!existingValue || isPlaceholder(existingValue)) {
      // Don't override generated tokens
      if (!newVariables.has(key)) {
        newVariables.set(key, value);
      }
    }
  }
  
  // Apply deterministic mappings
  for (const [privateKey, publicKey] of Object.entries(VARIABLE_MAPPINGS)) {
    const privateValue = variables.get(privateKey) || newVariables.get(privateKey);
    const publicValue = variables.get(publicKey) || newVariables.get(publicKey);
    
    if (privateValue && !isPlaceholder(privateValue)) {
      // Private value exists and is not placeholder - use as source of truth
      newVariables.set(publicKey, privateValue);
    } else if (publicValue && !isPlaceholder(publicValue)) {
      // Public value exists and is not placeholder - use as source of truth
      newVariables.set(privateKey, publicValue);
    }
  }
  
  // Validate
  const warnings = validateEnvironment(newVariables);
  if (warnings.length > 0 && !options.force) {
    if (!options.json) {
      console.log(`⚠️  Validation warnings for ${filePath}:`);
      warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('Use --force to ignore warnings');
    }
    return null;
  }
  
  // Generate new content by updating existing variables
  const updatedLines = parsed.lines.map(line => {
    if (line.type === 'variable' && newVariables.has(line.key)) {
      return { ...line, value: newVariables.get(line.key), original: `${line.key}=${newVariables.get(line.key)}` };
    }
    return line;
  });
  
  const newContent = updatedLines.map(line => line.original).join('\n');
  
  // Collect variables to append (only those not already in the file)
  const autoManagedVars = {};
  for (const [key, value] of newVariables) {
    if (!variables.has(key)) {
      autoManagedVars[key] = value;
    }
  }
  
  // Append auto-managed variables if any
  let finalContent = newContent;
  if (Object.keys(autoManagedVars).length > 0) {
    const autoManagedBlock = `\n# --- BEGIN AUTO-MANAGED (seed-env) ---
${Object.entries(autoManagedVars).map(([key, value]) => `${key}=${value}`).join('\n')}
# --- END AUTO-MANAGED (seed-env) ---\n`;
    finalContent = newContent + autoManagedBlock;
  }
  
  return { filePath, originalContent: stringifyEnvWithComments(parsed), newContent: finalContent, warnings };
}

// Main execution
async function main() {
  try {
    if (!options.json) {
      console.log('🌱 Environment Seeding Script');
      console.log('=============================');
      console.log(`Environment: ${options.env}`);
      console.log(`Dry run: ${options.dryRun}`);
      console.log(`Force: ${options.force}`);
    }
    
    // Generate security tokens
    const generatedTokens = await generateSecurityTokens(options.nonInteractive);
    
    // Get target files
    const targetFiles = options.files 
      ? options.files.split(',').map(f => f.trim())
      : [...ENV_FILES[options.env].root, ...ENV_FILES[options.env].web];
    
    const results = [];
    const changes = [];
    
    // Process each file
    for (const filePath of targetFiles) {
      const result = processEnvFile(filePath, generatedTokens);
      if (result) {
        results.push(result);
        
        if (options.dryRun) {
          const diff = generateDiff(result.originalContent, result.newContent, filePath);
          changes.push({ filePath, diff, warnings: result.warnings });
        } else {
          const fullPath = path.join(projectRoot, filePath);
          createBackup(fullPath);
          fs.writeFileSync(fullPath, result.newContent);
          if (!options.json) {
            console.log(`✅ Updated: ${filePath}`);
          }
        }
      }
    }
    
    // Output results
    if (options.json) {
      console.log(JSON.stringify({
        environment: options.env,
        dryRun: options.dryRun,
        files: results.map(r => r.filePath),
        warnings: results.flatMap(r => r.warnings),
        changes: changes.map(c => ({ filePath: c.filePath, warnings: c.warnings }))
      }, null, 2));
    } else {
      if (options.dryRun) {
        console.log('\n📋 Dry Run Results:');
        console.log('==================');
        for (const change of changes) {
          console.log(`\nFile: ${change.filePath}`);
          if (change.warnings.length > 0) {
            console.log('Warnings:');
            change.warnings.forEach(w => console.log(`  ${w}`));
          }
          console.log('Diff:');
          console.log(change.diff);
        }
      } else {
        console.log('\n🎉 Environment seeding complete!');
        console.log(`Processed ${results.length} files`);
        console.log('\n📋 Next steps:');
        console.log('1. Review the seeded values in your .env files');
        console.log('2. Replace placeholder values with your actual API keys and secrets');
        console.log('3. Update SEED_VALUES in this script with your preferred defaults');
        console.log('\n⚠️  Important: Never commit real API keys to version control!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
