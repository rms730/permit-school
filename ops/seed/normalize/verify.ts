#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { CurriculumUnitCanonicalSchema, QuestionSetCanonicalSchema } from "../lib/schema";
import { info, ok, err } from "./log";

const GLOB_CURR = "ops/seed/curriculum/CA/DE-ONLINE/units";
const GLOB_Q = "ops/seed/questions/CA/DE-ONLINE/units";

const files: string[] = [];
for (const dir of [GLOB_CURR, GLOB_Q]) {
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith(".json")) files.push(path.join(dir, f));
    }
  }
}

(async function run() {
  info(`Verifying ${files.length} normalized files...`);
  let valid = 0, errors = 0;

  for (const file of files) {
    const isCurr = file.includes("/curriculum/");
    const isQ = file.includes("/questions/");
    
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      
      if (isCurr) {
        CurriculumUnitCanonicalSchema.parse(raw);
      } else if (isQ) {
        QuestionSetCanonicalSchema.parse(raw);
      }
      
      valid++;
      ok(`✅ ${file}`);
    } catch (e: any) {
      errors++;
      err(`❌ ${file}: ${e?.message ?? e}`);
    }
  }

  info(`Summary: valid=${valid} errors=${errors}`);
  process.exit(errors ? 1 : 0);
})();
