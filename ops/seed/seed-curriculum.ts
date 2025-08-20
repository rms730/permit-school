import "dotenv-flow/config";
import { readJson } from "./lib/files";
import { getAdmin } from "./lib/supabase";
import { normalizeCurriculum } from "./lib/normalize";
import { CurriculumUnitSchema } from "./lib/schema";

function chunk<T>(arr: T[], size = 250): T[][] {
  const out: T[][] = [];
  for (let i=0;i<arr.length;i+=size) out.push(arr.slice(i, i+size));
  return out;
}

async function upsertUnitAndContent(admin: ReturnType<typeof getAdmin>, unit: any) {
  // Get jurisdiction
  const { data: jurisdiction } = await admin
    .from("jurisdictions")
    .select("id")
    .eq("code", unit.j_code)
    .limit(1)
    .single();

  if (!jurisdiction) throw new Error(`Jurisdiction not found: ${unit.j_code}`);

  // Get course
  const { data: course } = await admin
    .from("courses")
    .select("id")
    .eq("code", unit.course_code)
    .limit(1)
    .single();

  if (!course) throw new Error(`Course not found: ${unit.j_code}/${unit.course_code}`);

  // Upsert course unit
  const { data: cu, error: cuErr } = await admin
    .from("course_units")
    .upsert(
      { course_id: course.id, unit_no: unit.unit, title: unit.title, minutes_required: unit.minutes_required },
      { onConflict: "course_id,unit_no" }
    )
    .select("id")
    .single();
  if (cuErr) throw cuErr;

  // Flatten paragraphs into content_chunks + unit_chunks
  const paragraphs = unit.sections.flatMap((s: any, si: number) =>
    s.lessons.flatMap((l: any, li: number) =>
      l.paragraphs.map((p: any, pi: number) => ({
        section: s.title,
        lesson: l.title,
        ord: (si+1)*1000 + (li+1)*10 + (pi+1),
        chunk: p.text,
        lang: unit.lang,
      }))
    )
  );

  // Insert content_chunks in bulk (avoid duplicates by language + text)
  for (const batch of chunk(paragraphs, 500)) {
    const { error } = await admin.from("content_chunks")
      .insert(batch.map(b => ({
        jurisdiction_id: jurisdiction.id,
        lang: b.lang,
        chunk: b.chunk,
        source_url: null,
      })));
    if (error && !String(error.message).includes("duplicate")) throw error;
  }

  // Retrieve inserted chunks (simple approach: fetch by lang recently added)
  const { data: chunks, error: chErr } = await admin
    .from("content_chunks")
    .select("id, chunk")
    .eq("lang", unit.lang)
    .order("id", { ascending: false })
    .limit(paragraphs.length);
  if (chErr) throw chErr;

  // Map back to unit_chunks in the same order
  const chunkIdByText = new Map<string, number>();
  for (const c of chunks ?? []) chunkIdByText.set(c.chunk, c.id);

  const unitChunks = paragraphs
    .map(p => ({ unit_id: cu.id, chunk_id: chunkIdByText.get(p.chunk), ord: p.ord }))
    .filter(uc => uc.chunk_id);

  for (const batch of chunk(unitChunks, 500)) {
    const { error } = await admin.from("unit_chunks").upsert(batch, { onConflict: "unit_id,ord" });
    if (error) throw error;
  }
}

async function main() {
  const file = process.argv[2]; // path to a curriculum JSON
  if (!file) throw new Error("Usage: tsx ops/seed/seed-curriculum.ts <file>");

  const raw = await readJson(file);
  const unit = normalizeCurriculum(raw);
  CurriculumUnitSchema.parse(unit);

  const admin = getAdmin();
  const { error: txStart } = await admin.rpc("begin");
  if (txStart) {/* optional if you have RPC; otherwise rely on upsert atomicity */}

  await upsertUnitAndContent(admin, unit);

  await admin.rpc("commit");
  console.log(`✅ Curriculum seeded: U${unit.unit} ${unit.lang}`);
}

main().catch(e => { console.error(e); process.exit(1); });
