import "dotenv-flow/config";
import { readJson } from "./lib/files";
import { getAdmin } from "./lib/supabase";
import { normalizeQuestions } from "./lib/normalize";
import { QuestionsFileSchema } from "./lib/schema";

async function ensureCourse(admin: ReturnType<typeof getAdmin>, j_code: string, course_code: string) {
  const { data: course } = await admin.from("courses").select("id").eq("code", course_code).limit(1).single();
  if (!course) throw new Error(`Course not found: ${j_code}/${course_code}`);
  return course.id;
}

async function upsertEnglishQuestions(admin: ReturnType<typeof getAdmin>, courseId: string, unitNo: number, qfile: any) {
  for (const q of qfile.questions ?? []) {
    // Insert/upsert into question_bank with deterministic id
    const row = {
      id: q.qid, // deterministic
      course_id: courseId,
      skill: q.skill || "general",
      difficulty: q.difficulty,
      stem: q.stem,
      choices: q.choices,
      answer: q.answer,
      explanation: q.explanation,
      tags: q.tags ?? [],
      source_sections: [`unit:${unitNo}`],
      status: "approved",
    };
    const { error } = await admin.from("question_bank")
      .upsert(row, { onConflict: "id" });
    if (error) throw error;
  }
}

async function upsertSpanishTranslations(admin: ReturnType<typeof getAdmin>, courseId: string, unitNo: number, qfile: any) {
  // Two possibilities:
  // a) canonical ES with questions[] + deterministic ids matching EN (same qid algorithm)
  if (qfile.questions) {
    for (const q of qfile.questions) {
      // For now, create Spanish questions as new questions rather than translations
      // since the English questions may not exist yet
      const row = {
        id: q.qid, // deterministic
        course_id: courseId,
        skill: q.skill || "general",
        difficulty: q.difficulty,
        stem: q.stem,
        choices: q.choices,
        answer: q.answer,
        explanation: q.explanation,
        tags: q.tags ?? [],
        source_sections: [`unit:${unitNo}`],
        status: "approved",
      };
      const { error } = await admin.from("question_bank")
        .upsert(row, { onConflict: "id" });
      if (error) throw error;
    }
    return;
  }
  // b) legacy translations dictionary: { [someKey]: "spanish text ..." } – here we cannot resolve choices/explanations; skip with warning.
  if (qfile.translations) {
    console.warn("⚠️ Legacy ES translations map found; please migrate to canonical ES questions[] with deterministic IDs.");
  }
}

async function main() {
  const [file, j_code, course_code, unitStr, lang] = process.argv.slice(2);
  if (!file || !j_code || !course_code || !unitStr || !lang) {
    throw new Error("Usage: tsx ops/seed/seed-questions.ts <file> <j_code> <course_code> <unit> <en|es>");
  }
  const unit = Number(unitStr) || 0;

  const raw = await readJson(file);
  const normalized = normalizeQuestions(raw, { j_code, course_code, unit, lang: lang as "en"|"es" });
  QuestionsFileSchema.parse(normalized);

  const admin = getAdmin();
  const courseId = await ensureCourse(admin, j_code, course_code);

  if (lang === "en") {
    await upsertEnglishQuestions(admin, courseId, unit, normalized);
  } else {
    await upsertSpanishTranslations(admin, courseId, unit, normalized);
  }

  console.log(`✅ Questions seeded: U${unit} ${lang}`);
}

main().catch(e => { console.error(e); process.exit(1); });
