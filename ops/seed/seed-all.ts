import "dotenv-flow/config";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function run(cmd: string) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function list(dir: string, re: RegExp) {
  return fs.readdirSync(dir).filter(f => re.test(f));
}

async function main() {
  const curDir = "ops/seed/curriculum/CA/DE-ONLINE/units";
  const qDir = "ops/seed/questions/CA/DE-ONLINE/units";
  const unitFiles = list(curDir, /^unit\d{2}\.(en|es)\.json$/);

  console.log(`🚀 Starting seed-all: ${unitFiles.length} unit files found`);

  // 1) Seed curriculum (both languages)
  console.log("\n📚 Seeding curriculum...");
  for (const f of unitFiles) {
    run(`tsx ops/seed/seed-curriculum.ts ${path.join(curDir, f)}`);
  }

  // 2) Seed questions EN then ES (when present)
  console.log("\n❓ Seeding questions...");
  const enQ = list(qDir, /^unit\d{2}\.en\.json$/);
  for (const f of enQ) {
    const [_, uStr] = f.match(/^unit(\d{2})\.en\.json$/) ?? [];
    const unit = Number(uStr);
    run(`tsx ops/seed/seed-questions.ts ${path.join(qDir, f)} CA DE-ONLINE ${unit} en`);
    const es = `unit${uStr}.es.json`;
    if (fs.existsSync(path.join(qDir, es))) {
      run(`tsx ops/seed/seed-questions.ts ${path.join(qDir, es)} CA DE-ONLINE ${unit} es`);
    }
  }

  // 3) Verify
  console.log("\n✅ Running verification...");
  run("tsx ops/seed/verify-seed.ts");
  
  console.log("\n🎉 Seed-all complete!");
}

main().catch(e => { console.error(e); process.exit(1); });
