#!/usr/bin/env node

import fs from 'node:fs';
import readline from 'node:readline';

// Define the variables that need to be configured
const variables = [
  // Supabase
  {
    name: 'SUPABASE_URL',
    description: 'Supabase project URL (e.g., https://your-project.supabase.co)',
    type: 'url',
    files: ['root'],
    example: 'https://your-project.supabase.co'
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (starts with eyJ...)',
    type: 'secret',
    files: ['root', 'web'],
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    name: 'SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key (starts with eyJ...)',
    type: 'secret',
    files: ['root'],
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key for client (starts with eyJ...)',
    type: 'secret',
    files: ['web'],
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase URL for client (same as SUPABASE_URL)',
    type: 'url',
    files: ['web'],
    example: 'https://your-project.supabase.co'
  },
  
  // Stripe
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key (starts with sk_test_ or sk_live_)',
    type: 'secret',
    files: ['root', 'web'],
    example: 'sk_test_...'
  },
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    description: 'Stripe publishable key (starts with pk_test_ or pk_live_)',
    type: 'secret',
    files: ['web'],
    example: 'pk_test_...'
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe webhook secret (starts with whsec_)',
    type: 'secret',
    files: ['root', 'web'],
    example: 'whsec_...'
  },
  
  // Resend
  {
    name: 'RESEND_API_KEY',
    description: 'Resend API key (starts with re_test_ or re_live_)',
    type: 'secret',
    files: ['root', 'web'],
    example: 're_test_...'
  },
  
  // Sentry
  {
    name: 'SENTRY_DSN',
    description: 'Sentry DSN for server (optional)',
    type: 'url',
    files: ['root', 'web'],
    example: 'https://your-sentry-dsn.ingest.sentry.io/...',
    optional: true
  },
  {
    name: 'NEXT_PUBLIC_SENTRY_DSN',
    description: 'Sentry DSN for client (optional)',
    type: 'url',
    files: ['web'],
    example: 'https://your-sentry-dsn.ingest.sentry.io/...',
    optional: true
  },
  
  // URLs
  {
    name: 'BASE_URL',
    description: 'Base URL for the application',
    type: 'url',
    files: ['root'],
    example: 'http://localhost:3000'
  },
  {
    name: 'APP_BASE_URL',
    description: 'App base URL for email templates',
    type: 'url',
    files: ['root', 'web'],
    example: 'http://localhost:3000'
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    description: 'Site URL for client',
    type: 'url',
    files: ['web'],
    example: 'http://localhost:3000'
  },
  
  // Email
  {
    name: 'FROM_EMAIL',
    description: 'From email address for sending emails',
    type: 'email',
    files: ['root', 'web'],
    example: 'no-reply@yourdomain.com'
  },
  {
    name: 'SUPPORT_EMAIL',
    description: 'Support email address',
    type: 'email',
    files: ['root', 'web'],
    example: 'support@yourdomain.com'
  },
  {
    name: 'NEXT_PUBLIC_SUPPORT_EMAIL',
    description: 'Support email for client',
    type: 'email',
    files: ['web'],
    example: 'support@yourdomain.com'
  },
  
  // Security
  {
    name: 'ADMIN_JOB_TOKEN',
    description: 'Admin job security token',
    type: 'secret',
    files: ['root', 'web'],
    example: 'your-secure-admin-token'
  },
  {
    name: 'REGULATORY_SIGNING_SECRET',
    description: 'Regulatory signing secret',
    type: 'secret',
    files: ['root', 'web'],
    example: 'your-regulatory-signing-secret'
  }
];

// File mappings
const fileMappings = {
  root: ['.env.local', '.env.dev', '.env.prod'],
  web: ['web/.env.local', 'web/.env.development', 'web/.env.production']
};

// Validation functions
const validators = {
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  email: (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  secret: (value) => {
    return value.length > 0;
  }
};

// Update a variable in a file
function updateVariableInFile(filePath, variableName, value) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File ${filePath} does not exist, skipping...`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let updated = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith(`${variableName}=`)) {
      lines[i] = `${variableName}=${value}`;
      updated = true;
      break;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  } else {
    console.log(`⚠️  Variable ${variableName} not found in ${filePath}`);
    return false;
  }
}

// Prompt for user input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Main setup function
async function setupEnvironment() {
  console.log('🔧 Interactive Environment Setup\n');
  console.log('This script will help you configure all environment variables.');
  console.log('For each variable, you can:');
  console.log('- Enter a value to set it');
  console.log('- Press Enter to skip (if optional)');
  console.log('- Type "skip" to skip this variable entirely\n');

  const results = {};

  for (const variable of variables) {
    console.log(`\n📝 ${variable.name}`);
    console.log(`   Description: ${variable.description}`);
    console.log(`   Example: ${variable.example}`);
    console.log(`   Files: ${variable.files.map(f => fileMappings[f].join(', ')).join('; ')}`);
    
    if (variable.optional) {
      console.log(`   ⚠️  This variable is optional`);
    }

    const input = await prompt(`   Enter value${variable.optional ? ' (or press Enter to skip)' : ''}: `);
    
    if (input === 'skip') {
      console.log(`   ⏭️  Skipped ${variable.name}`);
      continue;
    }

    if (!input && variable.optional) {
      console.log(`   ⏭️  Skipped optional variable ${variable.name}`);
      continue;
    }

    if (!input && !variable.optional) {
      console.log(`   ❌ ${variable.name} is required. Please provide a value.`);
      continue;
    }

    // Validate input
    const validator = validators[variable.type];
    if (validator && !validator(input)) {
      console.log(`   ❌ Invalid ${variable.type} format for ${variable.name}`);
      continue;
    }

    // Update files
    let updatedCount = 0;
    for (const fileType of variable.files) {
      for (const filePath of fileMappings[fileType]) {
        if (updateVariableInFile(filePath, variable.name, input)) {
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      console.log(`   ✅ Updated ${variable.name} in ${updatedCount} file(s)`);
      results[variable.name] = input;
    } else {
      console.log(`   ❌ Failed to update ${variable.name} in any files`);
    }
  }

  console.log('\n🎉 Environment setup complete!');
  console.log(`\nUpdated ${Object.keys(results).length} variables:`);
  Object.keys(results).forEach(key => {
    console.log(`   ${key}: ${results[key].substring(0, 20)}${results[key].length > 20 ? '...' : ''}`);
  });

  console.log('\n📋 Next steps:');
  console.log('1. Review your .env files to ensure all values are correct');
  console.log('2. Make sure your .env files are in .gitignore');
  console.log('3. Test your application to ensure everything works');
}

// Run the setup
setupEnvironment().catch(console.error);
