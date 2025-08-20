#!/usr/bin/env node

import { execSync } from 'child_process';

async function testUnit(unit) {
  try {
    console.log(`\n🧪 Testing Unit ${unit}...`);
    execSync(`npm run seed:unit${unit}`, { stdio: 'pipe' });
    console.log(`✅ Unit ${unit} - SUCCESS`);
    return true;
  } catch (error) {
    console.log(`❌ Unit ${unit} - FAILED`);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing all units (3-12)...\n');
  
  const results = [];
  for (let unit = 3; unit <= 12; unit++) {
    const success = await testUnit(unit);
    results.push({ unit, success });
  }
  
  console.log('\n📊 Results Summary:');
  console.log('==================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length} units`);
  successful.forEach(r => console.log(`   - Unit ${r.unit}`));
  
  console.log(`❌ Failed: ${failed.length} units`);
  failed.forEach(r => console.log(`   - Unit ${r.unit}`));
  
  console.log(`\n🎯 Success Rate: ${Math.round((successful.length / results.length) * 100)}%`);
}

main().catch(console.error);
