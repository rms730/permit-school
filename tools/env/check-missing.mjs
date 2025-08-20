#!/usr/bin/env node

import fs from "node:fs";

function extractVarsFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.match(/^[A-Z_][A-Z0-9_]*=/gm) || [];
  return matches.map(v => v.replace('=', ''));
}

function main() {
  console.log("Checking for missing environment variables...\n");
  
  // Read inventory
  const keys = JSON.parse(fs.readFileSync('artifacts/env/keys.json', 'utf8'));
  const inventoryVars = keys.map(k => k.key);
  
  // Check root example files
  const rootLocalVars = extractVarsFromFile('env-examples/root.env.local.example');
  const rootDevVars = extractVarsFromFile('env-examples/root.env.dev.example');
  const rootProdVars = extractVarsFromFile('env-examples/root.env.prod.example');
  
  // Check web example files
  const webLocalVars = extractVarsFromFile('env-examples/web.env.local.example');
  const webDevVars = extractVarsFromFile('env-examples/web.env.development.example');
  const webProdVars = extractVarsFromFile('env-examples/web.env.production.example');
  
  // Find missing variables
  const missingFromRootLocal = inventoryVars.filter(v => !rootLocalVars.includes(v));
  const missingFromRootDev = inventoryVars.filter(v => !rootDevVars.includes(v));
  const missingFromRootProd = inventoryVars.filter(v => !rootProdVars.includes(v));
  
  const missingFromWebLocal = inventoryVars.filter(v => !webLocalVars.includes(v));
  const missingFromWebDev = inventoryVars.filter(v => !webDevVars.includes(v));
  const missingFromWebProd = inventoryVars.filter(v => !webProdVars.includes(v));
  
  console.log("📊 Summary:");
  console.log(`   Inventory: ${inventoryVars.length} variables`);
  console.log(`   Root local: ${rootLocalVars.length} variables`);
  console.log(`   Root dev: ${rootDevVars.length} variables`);
  console.log(`   Root prod: ${rootProdVars.length} variables`);
  console.log(`   Web local: ${webLocalVars.length} variables`);
  console.log(`   Web dev: ${webDevVars.length} variables`);
  console.log(`   Web prod: ${webProdVars.length} variables`);
  
  console.log("\n🔍 Missing from root.env.local.example:");
  if (missingFromRootLocal.length === 0) {
    console.log("   ✅ All variables present");
  } else {
    missingFromRootLocal.forEach(v => console.log(`   ❌ ${v}`));
  }
  
  console.log("\n🔍 Missing from root.env.dev.example:");
  if (missingFromRootDev.length === 0) {
    console.log("   ✅ All variables present");
  } else {
    missingFromRootDev.forEach(v => console.log(`   ❌ ${v}`));
  }
  
  console.log("\n🔍 Missing from root.env.prod.example:");
  if (missingFromRootProd.length === 0) {
    console.log("   ✅ All variables present");
  } else {
    missingFromRootProd.forEach(v => console.log(`   ❌ ${v}`));
  }
  
  console.log("\n🔍 Missing from web.env.local.example:");
  if (missingFromWebLocal.length === 0) {
    console.log("   ✅ All variables present");
  } else {
    missingFromWebLocal.forEach(v => console.log(`   ❌ ${v}`));
  }
  
  console.log("\n🔍 Missing from web.env.development.example:");
  if (missingFromWebDev.length === 0) {
    console.log("   ✅ All variables present");
  } else {
    missingFromWebDev.forEach(v => console.log(`   ❌ ${v}`));
  }
  
  console.log("\n🔍 Missing from web.env.production.example:");
  if (missingFromWebProd.length === 0) {
    console.log("   ✅ All variables present");
  } else {
    missingFromWebProd.forEach(v => console.log(`   ❌ ${v}`));
  }
}

main();
