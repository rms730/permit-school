import { getAdmin } from "./lib/supabase";
import { readJson } from "./lib/files";
import { log } from "./lib/log";
import { CurriculumUnitSchema, CurriculumUnit } from "./lib/schema";

type IdMap = { courseId: string; unitId: string; jurisdictionId: number };

async function ensureIds(client: ReturnType<typeof getAdmin>, jurisdiction: string, course: string): Promise<IdMap> {
  // Jurisdiction
  const { data: j } = await client
    .from("jurisdictions")
    .select("id")
    .eq("code", jurisdiction)
    .single();
  if (!j) throw new Error(`Jurisdiction ${jurisdiction} not found`);

  // Get or create PERMIT program
  const { data: program } = await client
    .from("programs")
    .select("id")
    .eq("code", "PERMIT")
    .single();
  if (!program) throw new Error("PERMIT program not found");

  // Course
  const { data: courseData, error: cErr } = await client
    .from("courses")
    .select("id")
    .eq("jurisdiction_id", j.id)
    .eq("program_id", program.id)
    .eq("code", course)
    .single();
  if (cErr) throw cErr;
  if (!courseData) throw new Error(`Course ${course} not found`);

  return { jurisdictionId: j.id, courseId: courseData!.id, unitId: "" };
}

async function ensureUnit(
  client: ReturnType<typeof getAdmin>,
  ids: IdMap,
  meta: CurriculumUnit["meta"]
) {
  const { data: unit, error: uErr } = await client
    .from("course_units")
    .upsert(
      {
        course_id: ids.courseId,
        unit_no: meta.unit_no,
        title: meta.unit_title,
        minutes_required: meta.minutes_required,
        objectives: meta.objectives.join("\n"),
        is_published: true,
      },
      { onConflict: "course_id,unit_no" }
    )
    .select("id")
    .single();
  if (uErr) throw uErr;
  ids.unitId = unit!.id;
}

async function upsertParagraphs(
  client: ReturnType<typeof getAdmin>,
  ids: IdMap,
  unit: CurriculumUnit
) {
  let ord = 0;
  for (const s of unit.sections) {
    for (const l of s.lessons) {
      for (const p of l.paragraphs) {
        ord++;
        const section_ref = `${s.id}:${l.id}:${ord}`; // stable reference
        // Check if content chunk already exists
        let chunk;
        const { data: existingChunk } = await client
          .from("content_chunks")
          .select("id")
          .eq("jurisdiction_id", ids.jurisdictionId)
          .eq("lang", unit.meta.lang)
          .eq("section_ref", section_ref)
          .single();
        
        if (existingChunk) {
          chunk = existingChunk;
        } else {
          const { data: newChunk, error: cErr } = await client
            .from("content_chunks")
            .insert({
              jurisdiction_id: ids.jurisdictionId,
              lang: unit.meta.lang,
              section_ref,
              source_url: unit.meta.source,
              chunk: p.text,
            })
            .select("id")
            .single();
          if (cErr) throw cErr;
          chunk = newChunk;
        }

        // Check if unit chunk mapping already exists
        const { data: existingUnitChunk } = await client
          .from("unit_chunks")
          .select("chunk_id")
          .eq("unit_id", ids.unitId)
          .eq("ord", ord)
          .single();
        
        if (!existingUnitChunk) {
          const { error: ucErr } = await client
            .from("unit_chunks")
            .insert({
              unit_id: ids.unitId,
              chunk_id: chunk!.id,
              ord,
            });
          if (ucErr) throw ucErr;
        }
      }
    }
  }
  log.ok(`Inserted/updated ${ord} paragraphs for ${unit.meta.lang}`);
}

export async function seedCurriculum(unit: number, lang: string, jurisdiction: string, course: string) {
  const client = getAdmin();
  const unitStr = unit.toString().padStart(2, '0');
  const filePath = `ops/seed/curriculum/${jurisdiction}/${course}/units/unit${unitStr}.${lang}.json`;
  
  const curriculum = CurriculumUnitSchema.parse(
    await readJson<CurriculumUnit>(filePath)
  );

  // IDs & unit creation
  const ids = await ensureIds(client, jurisdiction, course);
  await ensureUnit(client, ids, curriculum.meta);

  // Insert paragraphs
  await upsertParagraphs(client, ids, curriculum);

  log.ok(`Curriculum seeding complete for Unit ${unit} (${lang.toUpperCase()}).`);
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

  // Seed curriculum for all languages
  for (const lang of langs) {
    await seedCurriculum(unit, lang, jurisdiction, course);
  }
  
  log.ok(`Curriculum seeding complete for Unit ${unit} (${langs.join('/').toUpperCase()}).`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
