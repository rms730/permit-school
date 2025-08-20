import { getAdmin } from "./lib/supabase";
import { log } from "./lib/log";

export async function verifySeed(unit: number, jurisdiction: string, course: string) {
  const client = getAdmin();
  const { data: j } = await client.from("jurisdictions").select("id").eq("code", jurisdiction).single();
  if (!j) throw new Error(`Jurisdiction ${jurisdiction} not found`);
  
  const { data: courseData } = await client
    .from("courses")
    .select("id")
    .eq("jurisdiction_id", j.id)
    .eq("code", course)
    .single();
  if (!courseData) throw new Error(`Course ${course} not found`);
  
  const { data: unitData } = await client
    .from("course_units")
    .select("id, title, minutes_required")
    .eq("course_id", courseData.id)
    .eq("unit_no", unit)
    .single();
  if (!unitData) throw new Error(`Unit ${unit} not found`);

  const { count: chunks } = await client
    .from("unit_chunks")
    .select("*", { count: "exact", head: true })
    .eq("unit_id", unitData.id);

  const { count: qEn } = await client
    .from("question_bank")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseData.id)
    .contains("tags", [`unit:${unit}`]);

  const { count: qEs } = await client
    .from("question_translations")
    .select("*", { count: "exact", head: true })
    .eq("lang", "es");

  log.ok(`Unit ${unit} content paragraphs mapped: ${chunks ?? 0}`);
  log.ok(`Unit ${unit} questions (EN): ${qEn ?? 0}; ES translations: ${qEs ?? 0}`);
  log.ok(`Unit ${unit} title: "${unitData.title}" (${unitData.minutes_required} minutes)`);
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const unitArg = args.find(arg => arg.startsWith('--unit='));
  const jArg = args.find(arg => arg.startsWith('--j='));
  const courseArg = args.find(arg => arg.startsWith('--course='));

  const unit = unitArg ? parseInt(unitArg.split('=')[1]) : 1;
  const jurisdiction = jArg ? jArg.split('=')[1] : 'CA';
  const course = courseArg ? courseArg.split('=')[1] : 'DE-ONLINE';

  await verifySeed(unit, jurisdiction, course);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
