#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { toCanonicalCurriculum, toCanonicalQuestions } from "./convert";
import { CurriculumUnitCanonicalSchema, QuestionSetCanonicalSchema } from "../lib/schema";
import { backupFile } from "./backup";
import { info, ok, warn, err } from "./log";

type Mode = "curriculum"|"questions";
const args = process.argv.slice(2);
const write = args.includes("--write");
const mode: Mode | "all" =
  (args.find(a=>a.startsWith("--mode="))?.split("=")[1] as any) ?? "all";

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

const stamp = new Date().toISOString().replace(/[:.]/g,"-");

function pretty(obj:any) { return JSON.stringify(obj, null, 2) + "\n"; }

(async function run() {
  info(`Normalize Units (dry-run=${!write}) mode=${mode}`);
  let changed = 0, errors = 0, checked = 0;

  for (const file of files) {
    const isCurr = file.includes("/curriculum/");
    const isQ = file.includes("/questions/");
    if (mode !== "all" && ((mode==="curriculum" && !isCurr) || (mode==="questions" && !isQ))) continue;

    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      const canonical = isCurr ? toCanonicalCurriculum(raw) : toCanonicalQuestions(raw);
      // Re-validate strictly
      if (isCurr) CurriculumUnitCanonicalSchema.parse(canonical);
      else QuestionSetCanonicalSchema.parse(canonical);

      const out = pretty(canonical);
      const original = fs.readFileSync(file, "utf8");
      if (original !== out) {
        changed++;
        if (write) {
          const b = backupFile(file, stamp);
          fs.writeFileSync(file, out, "utf8");
          ok(`Normalized: ${file} (backup: ${b})`);
        } else {
          warn(`Would normalize: ${file}`);
        }
      } else {
        ok(`Already canonical: ${file}`);
      }
      checked++;
    } catch (e:any) {
      errors++;
      err(`Failed on ${file}: ${e?.message ?? e}`);
    }
  }

  info(`Summary: checked=${checked} changed=${changed} errors=${errors} write=${write}`);
  process.exit(errors ? 1 : 0);
})();
