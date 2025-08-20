import { CurriculumUnitCanonicalSchema, QuestionSetCanonicalSchema } from "../lib/schema";
import { detectShape } from "./detect";

const asArray = <T>(val: T | T[] | undefined, fallback: T[] = []): T[] =>
  Array.isArray(val) ? val : val ? [val] : fallback;

// Helpers
function normalizeAnswer(answer: any): string | number {
  if (typeof answer === "number") return Math.max(0, Math.min(3, answer));
  if (typeof answer === "string") {
    const up = answer.trim().toUpperCase();
    if (["A","B","C","D"].includes(up)) return up;
    const idx = Number.parseInt(up, 10);
    if (!Number.isNaN(idx)) return Math.max(0, Math.min(3, idx));
  }
  return "A";
}

function normalizeChoices(choices: any): any[] {
  if (!choices) return [
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" }
  ];
  
  if (Array.isArray(choices) && typeof choices[0] === "string") {
    // Convert string array to choice objects
    return choices.map((text: string, index: number) => ({
      key: String.fromCharCode(65 + index) as "A" | "B" | "C" | "D",
      text: text || ""
    })).slice(0, 4);
  }
  
  if (Array.isArray(choices) && typeof choices[0] === "object") {
    // Already in object format, ensure proper structure
    return choices.map((c: any, index: number) => ({
      key: c.key || String.fromCharCode(65 + index) as "A" | "B" | "C" | "D",
      text: c.text || c.label || ""
    })).slice(0, 4);
  }
  
  return [
    { key: "A", text: "" },
    { key: "B", text: "" },
    { key: "C", text: "" },
    { key: "D", text: "" }
  ];
}

// Convert paragraphs to content array
function normalizeContent(paragraphs: any[]): string[] {
  return asArray(paragraphs).map((p: any) => {
    if (typeof p === "string") return p;
    if (p?.text) return p.text;
    if (p?.content) return p.content;
    return String(p);
  }).filter(Boolean);
}

// Convert review questions
function normalizeReview(review: any[]): any[] {
  return asArray(review).map((r: any) => {
    if (r?.type === "mcq" || r?.choices) {
      return {
        type: "mcq" as const,
        prompt: r?.prompt ?? r?.question ?? "",
        choices: normalizeChoices(r?.choices ?? r?.options).map(c => c.text),
        answer: normalizeAnswer(r?.answer ?? r?.correct),
        explanation: r?.explanation,
      };
    }
    return {
      type: "short" as const,
      prompt: r?.prompt ?? r?.question ?? "",
      answer: String(r?.answer ?? ""),
      explanation: r?.explanation,
    };
  });
}

export function toCanonicalCurriculum(obj: any): any {
  const shape = detectShape(obj, "curriculum");
  
    if (shape === "curriculum-canonical") {
    return CurriculumUnitCanonicalSchema.parse({
      ...obj,
      metadata: {
        version: obj?.metadata?.version ?? "1.0.0",
        updated_at: obj?.metadata?.updated_at ?? new Date().toISOString(),
        source: obj?.metadata?.source
      },
    });
  }

  // Extract common fields across shapes
  let unit = 0;
  if (obj?.unit && typeof obj.unit === "number") unit = Number(obj.unit);
  else if (obj?.unit?.unit_no) unit = Number(obj.unit.unit_no);
  else if (obj?.unit?.unitNumber) unit = Number(obj.unit.unitNumber);
  else if (obj?.unit?.id) unit = Number(obj.unit.id);
  else if (obj?.unitId) {
    const match = String(obj.unitId).match(/\d+/);
    unit = match ? Number(match[0]) : 0;
  }
  else if (obj?.unitNumber) unit = Number(obj.unitNumber);
  else if (obj?.meta?.unit_no) unit = Number(obj.meta.unit_no);
  else if (obj?.meta?.unit) unit = Number(obj.meta.unit);

  const j_code = obj?.j_code ?? obj?.course?.j_code ?? obj?.meta?.j_code ?? "CA";
  const course_code = obj?.course_code ?? obj?.course?.code ?? obj?.meta?.course_code ?? "DE-ONLINE";
  const lang = obj?.lang ?? obj?.meta?.lang ?? "en";
  const title = obj?.title ?? obj?.unit?.title ?? obj?.meta?.title ?? obj?.meta?.unit_title ?? `Unit ${unit}`;
  const minutes_required =
    obj?.minutes_required ?? obj?.unit?.minutes_required ?? obj?.meta?.minutes_required ?? 
    obj?.minutes ?? obj?.estimatedTimeMinutes ?? 30;

  const objectives =
    obj?.objectives ?? obj?.unit?.objectives ?? obj?.meta?.objectives ?? [];

  // Sections/lessons normalization
  const rawSections = obj?.sections ?? obj?.unit?.sections ?? [];
  const sections = asArray(rawSections).map((s:any) => {
    const lessonsRaw = s?.lessons ?? s?.topics ?? [];
    const lessons = asArray(lessonsRaw).map((l:any) => {
      // Handle different lesson structures
      const content = normalizeContent(l?.paragraphs ?? l?.content ?? l?.body ?? []);
      const minutes = l?.minutes ?? l?.duration_min ?? l?.durationMinutes ?? 5;
      const review = normalizeReview(l?.review ?? []);
      
      return {
        title: l?.title ?? l?.name ?? "Lesson",
        minutes: Number(minutes),
        content,
        review,
      };
    });
    return { title: s?.title ?? s?.name ?? "Section", lessons };
  });

  const result = {
    unit: Number(unit),
    j_code,
    course_code,
    lang,
    title,
    minutes_required: Number(minutes_required),
    objectives: objectives.length > 0 ? objectives : ["Learn core CA traffic safety concepts"],
    sections,
    metadata: {
      source: obj?.metadata?.source ?? obj?.meta?.source,
      version: obj?.metadata?.version ?? "1.0.0",
      updated_at: new Date().toISOString(),
    },
  };

  return CurriculumUnitCanonicalSchema.parse(result);
}

export function toCanonicalQuestions(obj: any): any {
  const shape = detectShape(obj, "questions");
  
    if (shape === "questions-canonical") {
    return QuestionSetCanonicalSchema.parse({
      ...obj,
      metadata: {
        version: obj?.metadata?.version ?? "1.0.0",
        updated_at: obj?.metadata?.updated_at ?? new Date().toISOString(),
        source: obj?.metadata?.source
      },
    });
  }

  // Extract unit number from various possible locations
  let unit = 0;
  if (obj?.unit) unit = Number(obj.unit);
  else if (obj?.unit_no) unit = Number(obj.unit_no);
  else if (obj?.unitNumber) unit = Number(obj.unitNumber);
  else if (obj?.unitId) {
    const match = String(obj.unitId).match(/\d+/);
    unit = match ? Number(match[0]) : 0;
  }
  else if (obj?.meta?.unit_no) unit = Number(obj.meta.unit_no);
  else if (obj?.meta?.unit) unit = Number(obj.meta.unit);

  const j_code = obj?.j_code ?? obj?.course?.j_code ?? obj?.meta?.j_code ?? "CA";
  const course_code = obj?.course_code ?? obj?.course?.course_code ?? obj?.meta?.course_code ?? "DE-ONLINE";
  const lang = obj?.lang ?? obj?.meta?.lang ?? (obj?.translations ? "es" : "en");

  let questions: any[] = [];

  if (shape === "questions-with-translations") {
    questions = asArray(obj?.translations).map((q:any) => ({
      ref: q?.ref ?? q?.ref_id,
      skill: q?.skill ?? "General",
      difficulty: q?.difficulty ?? 2,
      stem: q?.stem ?? q?.question ?? "",
      choices: normalizeChoices(q?.choices ?? q?.options),
      answer: normalizeAnswer(q?.answer ?? q?.correct),
      explanation: q?.explanation,
      tags: asArray(q?.tags),
    }));
  } else {
    // legacy
    const src = obj?.questions ?? obj?.items ?? [];
    questions = asArray(src).map((q:any, idx:number) => {
      // Handle different answer formats
      let answer = q?.answer;
      if (q?.choices && Array.isArray(q.choices) && q.choices[0]?.correct) {
        // Find the correct choice
        const correctIndex = q.choices.findIndex((c: any) => c.correct);
        answer = correctIndex >= 0 ? correctIndex : 0;
      }
      
      return {
        ref: q?.ref ?? q?.id ?? `Q${idx+1}`,
        skill: q?.skill ?? "General",
        difficulty: q?.difficulty ?? 2,
        stem: q?.stem ?? q?.prompt ?? q?.question ?? "",
        choices: normalizeChoices(q?.choices ?? q?.options),
        answer: normalizeAnswer(answer ?? q?.answerIndex ?? q?.correct),
        explanation: q?.explanation,
        tags: asArray(q?.tags),
      };
    });
  }

  const result = {
    unit: Number(unit),
    j_code,
    course_code,
    lang,
    questions,
    metadata: {
      source: obj?.metadata?.source ?? obj?.meta?.source,
      version: obj?.metadata?.version ?? "1.0.0",
      updated_at: new Date().toISOString(),
    },
  };

  return QuestionSetCanonicalSchema.parse(result);
}
