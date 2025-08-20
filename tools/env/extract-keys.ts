// tools/env/extract-keys.ts
// Scans the repo and produces a JSON mapping of env var -> usage locations and marks NEXT_PUBLIC.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface EnvKey {
  key: string;
  nextPublic: boolean;
  scope: 'root' | 'web' | 'both';
  paths: string[];
  usageCount: number;
}

function extractEnvKeys(): EnvKey[] {
  const patterns = ["process.env.", "NEXT_PUBLIC_"];
  const cmd = `find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.json" \\) -not -path "./node_modules/*" -not -path "./web/node_modules/*" -not -path "./.next/*" -not -path "./dist/*" -exec grep -Hn "${patterns.join("|")}" {} \\;`;
  const out = spawnSync("bash", ["-lc", cmd], { encoding: "utf8" });

  if (out.status !== 0) {
    console.error("ripgrep command failed:", out.stderr || out.stdout);
    process.exit(out.status ?? 1);
  }

  const lines = out.stdout.split("\n").filter(Boolean);
  const map = new Map<string, Set<string>>();

  for (const line of lines) {
    // line format: path:line:col: text
    const [pathAndLine, ...rest] = line.split(":");
    const filePath = pathAndLine ?? "";
    const text = rest.join(":");
    
    // Match both process.env.VAR and NEXT_PUBLIC_VAR patterns
    const matches = Array.from(text.matchAll(/\bprocess\.env\.([A-Z0-9_]+)\b|(?:\b)(NEXT_PUBLIC_[A-Z0-9_]+)\b/g));
    
    for (const m of matches) {
      const key = (m[1] || m[2])?.trim();
      if (!key) continue;
      
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(filePath);
    }
  }

  const result: EnvKey[] = Array.from(map.entries()).map(([key, paths]) => {
    const pathArray = Array.from(paths).sort();
    const isNextPublic = key.startsWith("NEXT_PUBLIC_");
    
    // Determine scope based on file paths
    let scope: 'root' | 'web' | 'both' = 'root';
    const hasWebFiles = pathArray.some(p => p.startsWith('web/'));
    const hasRootFiles = pathArray.some(p => !p.startsWith('web/') && !p.includes('node_modules'));
    
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
      paths: pathArray,
      usageCount: pathArray.length
    };
  });

  return result.sort((a, b) => a.key.localeCompare(b.key));
}

function categorizeVariables(keys: EnvKey[]) {
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
  console.log("Extracting environment variables from codebase...");
  
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
  
  // Print top used variables
  const topUsed = keys
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 10);
  
  console.log(`\n🔝 Top 10 most used variables:`);
  topUsed.forEach((key, i) => {
    console.log(`   ${i + 1}. ${key.key} (${key.usageCount} usages, ${key.scope} scope)`);
  });
}

if (require.main === module) {
  main();
}
