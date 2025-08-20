import "dotenv-flow/config";
import fs from "node:fs";
import path from "node:path";
import { readJson } from "./lib/files";
import { normalizeCurriculum, normalizeQuestions } from "./lib/normalize";
import { CurriculumUnitSchema, QuestionsFileSchema } from "./lib/schema";

type Report = {
  unit: number;
  lang: "en"|"es";
  errors: string[];
  warnings: string[];
  stats: {
    paragraphs: number;
    questions?: number;
  }
};

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function collectParagraphs(unit: any): number {
  return unit.sections.flatMap((s: any) => s.lessons.flatMap((l: any) => l.paragraphs)).length;
}

async function verifyCurriculum(file: string): Promise<Report> {
  const raw = await readJson(file);
  const unit = normalizeCurriculum(raw);
  CurriculumUnitSchema.parse(unit);
  const paragraphs = collectParagraphs(unit);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (paragraphs < 40) warnings.push(`Unit has few paragraphs: ${paragraphs} (< 40).`);
  if (!unit.objectives?.length) errors.push("Missing objectives[]");
  if (unit.minutes_required && (unit.minutes_required < 20 || unit.minutes_required > 120)) {
    warnings.push(`minutes_required looks off: ${unit.minutes_required}`);
  }
  return { unit: unit.unit, lang: unit.lang, warnings, errors, stats: { paragraphs } };
}

async function verifyQuestions(file: string, j_code: string, course_code: string, unit: number, lang: "en"|"es"): Promise<Report> {
  const raw = await readJson(file);
  const qf = normalizeQuestions(raw, { j_code, course_code, unit, lang });
  QuestionsFileSchema.parse(qf);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (qf.questions) {
    for (const [i,q] of qf.questions.entries()) {
      if (!q.choices || q.choices.length !== 4) errors.push(`Q${i+1}: needs exactly 4 choices`);
      if (!q.explanation || q.explanation.length < 8) errors.push(`Q${i+1}: missing/short explanation`);
      if (q.choices && q.choices.length === 4) {
        const keys = new Set(q.choices.map(c => c.key));
        if (keys.size !== 4) errors.push(`Q${i+1}: duplicate choice keys`);
      }
    }
  } else if (qf.translations) {
    warnings.push("legacy translations map; please migrate to canonical ES questions[]");
  }

  const questionsCount = qf.questions?.length ?? 0;
  if (lang === "en" && questionsCount < 15) warnings.push(`Only ${questionsCount} EN questions (<15).`);

  return { unit, lang, warnings, errors, stats: { paragraphs: 0, questions: questionsCount } };
}

async function main() {
  const outDir = path.join("artifacts", "seed");
  ensureDir(outDir);

  const reports: Report[] = [];

  // Discover curriculum and questions (CA/DE-ONLINE units)
  const curDir = "ops/seed/curriculum/CA/DE-ONLINE/units";
  const qDir = "ops/seed/questions/CA/DE-ONLINE/units";
  const files = fs.readdirSync(curDir).filter(f => f.endsWith(".json"));

  for (const f of files) {
    const [_, uStr, lang] = f.match(/^unit(\d{2})\.(en|es)\.json$/) ?? [];
    if (!uStr) continue;
    const unit = Number(uStr);
    const langCode = lang as "en"|"es";
    const cfile = path.join(curDir, f);
    const report = await verifyCurriculum(cfile);
    reports.push(report);

    // Match questions file
    const qfile = path.join(qDir, `unit${uStr}.${lang}.json`);
    if (fs.existsSync(qfile)) {
      const qReport = await verifyQuestions(qfile, "CA", "DE-ONLINE", unit, langCode);
      reports.push(qReport);
    } else {
      reports.push({ unit, lang: langCode, errors: [], warnings: ["No questions file found"], stats: { paragraphs: 0, questions: 0 } });
    }
  }

  const output = path.join(outDir, `verify-report.json`);
  fs.writeFileSync(output, JSON.stringify(reports, null, 2), "utf-8");
  const errors = reports.flatMap(r => r.errors);
  console.log(`Verification complete. Errors: ${errors.length}. Report: ${output}`);
  if (errors.length) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
