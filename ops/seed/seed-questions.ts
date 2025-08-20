import { getAdmin } from "./lib/supabase";
import { readJson } from "./lib/files";
import { log } from "./lib/log";
import { UnitQuestionsSchema, UnitQuestions } from "./lib/schema";

async function resolveCourseId(client: ReturnType<typeof getAdmin>, jurisdiction: string, course: string) {
  const { data: j } = await client
    .from("jurisdictions")
    .select("id")
    .eq("code", jurisdiction)
    .single();
  if (!j) throw new Error(`Jurisdiction ${jurisdiction} not found`);
  const { data: courseData } = await client
    .from("courses")
    .select("id")
    .eq("jurisdiction_id", j.id)
    .eq("code", course)
    .single();
  if (!courseData) throw new Error(`Course ${course} not found`);
  return courseData.id as string;
}

async function upsertQuestions(
  client: ReturnType<typeof getAdmin>,
  courseId: string,
  questions: UnitQuestions,
  unit: number
) {
  let count = 0;
  for (const q of questions.questions) {
    const row = {
      course_id: courseId,
      skill: q.skill,
      difficulty: q.difficulty,
      stem: q.stem,
      choices: q.choices,
      answer: q.answer,
      explanation: q.explanation,
      source_sections: [`unit:${unit}`],
      tags: [...new Set([`unit:${unit}`, ...q.tags])],
      source_ref: q.id,
      status: "approved",
      is_generated: false,
    };

    // Check if question already exists
    let qb;
    const { data: existingQuestion } = await client
      .from("question_bank")
      .select("id")
      .eq("course_id", courseId)
      .eq("source_ref", q.id)
      .single();
    
    if (existingQuestion) {
      qb = existingQuestion;
    } else {
      const { data: newQuestion, error: qErr } = await client
        .from("question_bank")
        .insert(row)
        .select("id")
        .single();
      if (qErr) throw qErr;
      qb = newQuestion;
    }

    // For Spanish questions, we'll handle translations separately
    // This function now handles one language at a time

    count++;
  }
  return count;
}

export async function seedQuestions(unit: number, lang: string, jurisdiction: string, course: string) {
  const client = getAdmin();
  const unitStr = unit.toString().padStart(2, '0');
  const filePath = `ops/seed/questions/${jurisdiction}/${course}/units/unit${unitStr}.${lang}.json`;
  
  const questions = UnitQuestionsSchema.parse(
    await readJson<UnitQuestions>(filePath)
  );

  const courseId = await resolveCourseId(client, jurisdiction, course);
  const n = await upsertQuestions(client, courseId, questions, unit);
  log.ok(`Upserted ${n} questions for Unit ${unit} (${lang.toUpperCase()}).`);
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const unitArg = args.find(arg => arg.startsWith('--unit='));
  const langArg = args.find(arg => arg.startsWith('--lang='));
  const jArg = args.find(arg => arg.startsWith('--j='));
  const courseArg = args.find(arg => arg.startsWith('--course='));

  const unit = unitArg ? parseInt(unitArg.split('=')[1]) : 1;
  const langs = langArg ? langArg.split('=')[1].split(',') : ['en', 'es'];
  const jurisdiction = jArg ? jArg.split('=')[1] : 'CA';
  const course = courseArg ? courseArg.split('=')[1] : 'DE-ONLINE';

  // Seed questions for all languages
  for (const lang of langs) {
    await seedQuestions(unit, lang, jurisdiction, course);
  }
  
  log.ok(`Questions seeding complete for Unit ${unit} (${langs.join('/').toUpperCase()}).`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
