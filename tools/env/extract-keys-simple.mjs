#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";

function extractEnvKeys() {
  console.log("Extracting environment variables from codebase...");
  
  // Search for process.env. usage
  const processEnvCmd = `grep -r "process.env." . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --include="*.json" | grep -v node_modules | grep -v .next | grep -v dist`;
  const processEnvOut = spawnSync("bash", ["-lc", processEnvCmd], { encoding: "utf8" });
  
  // Search for NEXT_PUBLIC_ usage
  const nextPublicCmd = `grep -r "NEXT_PUBLIC_" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --include="*.json" | grep -v node_modules | grep -v .next | grep -v dist`;
  const nextPublicOut = spawnSync("bash", ["-lc", nextPublicCmd], { encoding: "utf8" });
  
  const allLines = [
    ...(processEnvOut.stdout || "").split("\n").filter(Boolean),
    ...(nextPublicOut.stdout || "").split("\n").filter(Boolean)
  ];
  
  const keyMap = new Map();
  
  for (const line of allLines) {
    const [filePath, ...rest] = line.split(":");
    const text = rest.join(":");
    
    // Extract process.env.VAR patterns
    const processEnvMatches = text.matchAll(/\bprocess\.env\.([A-Z0-9_]+)\b/g);
    for (const match of processEnvMatches) {
      const key = match[1];
      if (!keyMap.has(key)) {
        keyMap.set(key, { paths: new Set(), nextPublic: false });
      }
      keyMap.get(key).paths.add(filePath);
    }
    
    // Extract NEXT_PUBLIC_VAR patterns
    const nextPublicMatches = text.matchAll(/\b(NEXT_PUBLIC_[A-Z0-9_]+)\b/g);
    for (const match of nextPublicMatches) {
      const key = match[1];
      if (!keyMap.has(key)) {
        keyMap.set(key, { paths: new Set(), nextPublic: true });
      }
      keyMap.get(key).paths.add(filePath);
    }
  }
  
  const result = Array.from(keyMap.entries()).map(([key, data]) => {
    const paths = Array.from(data.paths).sort();
    const isNextPublic = key.startsWith("NEXT_PUBLIC_");
    
    // Determine scope
    let scope = 'root';
    const hasWebFiles = paths.some(p => p.startsWith('web/'));
    const hasRootFiles = paths.some(p => !p.startsWith('web/') && !p.includes('node_modules'));
    
    if (hasWebFiles && hasRootFiles) {
      scope = 'both';
    } else if (hasWebFiles) {
      scope = 'web';
    } else {
      scope = 'root';
    }
    
    return {
      key,
      nextPublic: isNextPublic,
      scope,
      paths,
      usageCount: paths.length
    };
  }).sort((a, b) => a.key.localeCompare(b.key));
  
  return result;
}

function categorizeVariables(keys) {
  const categories = {
    supabase: keys.filter(k => k.key.includes('SUPABASE')),
    stripe: keys.filter(k => k.key.includes('STRIPE')),
    email: keys.filter(k => k.key.includes('RESEND') || k.key.includes('EMAIL')),
    monitoring: keys.filter(k => k.key.includes('SENTRY')),
    app: keys.filter(k => k.key.includes('BASE_URL') || k.key.includes('APP_') || k.key.includes('SITE_URL')),
    admin: keys.filter(k => k.key.includes('ADMIN_') || k.key.includes('DUNNING_')),
    regulatory: keys.filter(k => k.key.includes('REGULATORY_')),
    test: keys.filter(k => k.key.includes('TEST_') || k.key.includes('TESTKIT')),
    exam: keys.filter(k => k.key.includes('EXAM_') || k.key.includes('FINAL_')),
    other: keys.filter(k => 
      !k.key.includes('SUPABASE') && 
      !k.key.includes('STRIPE') && 
      !k.key.includes('RESEND') && 
      !k.key.includes('EMAIL') && 
      !k.key.includes('SENTRY') && 
      !k.key.includes('BASE_URL') && 
      !k.key.includes('APP_') && 
      !k.key.includes('SITE_URL') && 
      !k.key.includes('ADMIN_') && 
      !k.key.includes('DUNNING_') && 
      !k.key.includes('REGULATORY_') && 
      !k.key.includes('TEST_') && 
      !k.key.includes('TESTKIT') && 
      !k.key.includes('EXAM_') && 
      !k.key.includes('FINAL_')
    )
  };
  
  return categories;
}

function main() {
  const keys = extractEnvKeys();
  const categories = categorizeVariables(keys);
  
  // Create output directory
  fs.mkdirSync("artifacts/env", { recursive: true });
  
  // Write full inventory
  fs.writeFileSync("artifacts/env/keys.json", JSON.stringify(keys, null, 2));
  
  // Write categorized inventory
  fs.writeFileSync("artifacts/env/keys-categorized.json", JSON.stringify(categories, null, 2));
  
  // Write summary
  const summary = {
    totalKeys: keys.length,
    nextPublicKeys: keys.filter(k => k.nextPublic).length,
    serverOnlyKeys: keys.filter(k => !k.nextPublic).length,
    byScope: {
      root: keys.filter(k => k.scope === 'root').length,
      web: keys.filter(k => k.scope === 'web').length,
      both: keys.filter(k => k.scope === 'both').length
    },
    byCategory: Object.fromEntries(
      Object.entries(categories).map(([cat, keys]) => [cat, keys.length])
    )
  };
  
  fs.writeFileSync("artifacts/env/summary.json", JSON.stringify(summary, null, 2));
  
  console.log("✅ Environment variable extraction complete!");
  console.log(`📊 Found ${keys.length} unique environment variables`);
  console.log(`🔒 ${summary.serverOnlyKeys} server-only variables`);
  console.log(`🌐 ${summary.nextPublicKeys} client-exposed variables (NEXT_PUBLIC_)`);
  console.log(`📁 Output files:`);
  console.log(`   - artifacts/env/keys.json (full inventory)`);
  console.log(`   - artifacts/env/keys-categorized.json (by category)`);
  console.log(`   - artifacts/env/summary.json (summary stats)`);
  
  // Print all variables
  console.log(`\n📋 All environment variables found:`);
  keys.forEach((key, i) => {
    console.log(`   ${i + 1}. ${key.key} (${key.usageCount} usages, ${key.scope} scope, ${key.nextPublic ? 'NEXT_PUBLIC' : 'server-only'})`);
  });
  
  // Print top used variables
  const topUsed = keys
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
  
  console.log(`\n🔝 Top 10 most used variables:`);
  topUsed.forEach((key, i) => {
    console.log(`   ${i + 1}. ${key.key} (${key.usageCount} usages, ${key.scope} scope)`);
  });
}

main();
