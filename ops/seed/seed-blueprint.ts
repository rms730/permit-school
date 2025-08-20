import { getAdmin } from "./lib/supabase";
import { log } from "./lib/log";

export async function seedBlueprint(unit: number, jurisdiction: string, course: string) {
  const client = getAdmin();

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

  // Check if blueprint already exists
  let bp;
  const { data: existingBlueprint } = await client
    .from("exam_blueprints")
    .select("id")
    .eq("course_id", courseData.id)
    .eq("is_active", true)
    .single();
  
  if (existingBlueprint) {
    bp = existingBlueprint;
  } else {
    const { data: newBlueprint, error } = await client
      .from("exam_blueprints")
      .insert({
        course_id: courseData.id,
        name: `Unit ${unit} Practice`,
        total_questions: 12,
        is_active: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    bp = newBlueprint;
  }

  // Check if rule already exists for this unit
  const { data: existingRule } = await client
    .from("exam_blueprint_rules")
    .select("blueprint_id")
    .eq("blueprint_id", bp!.id)
    .eq("rule_no", unit)
    .single();
  
  if (!existingRule) {
    await client.from("exam_blueprint_rules").insert({
      blueprint_id: bp!.id,
      rule_no: unit,
      skill: "General",
      count: 12,
      min_difficulty: 1,
      max_difficulty: 4,
      include_tags: [`unit:${unit}`],
      exclude_tags: [],
    });
  }

  log.ok(`Blueprint ensured for Unit ${unit} practice.`);
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

  await seedBlueprint(unit, jurisdiction, course);
  log.ok(`Blueprint ensured for Unit ${unit} practice.`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
