import crypto from "node:crypto";
import { v5 as uuidv5 } from "uuid";
import {
  CurriculumUnitSchema,
  type CurriculumUnit,
  QuestionsFileSchema,
  type QuestionsFile,
  QuestionSchema,
  type QuestionChoiceSchema
} from "./schema";

const NAMESPACE = "6f6fdbcc-9b75-4f1a-8b8f-5e063a2f2d60"; // constant for uuid v5

// --- Helpers ---
function wpmEstimate(text: string, wpm = 160, buffer = 1.15): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round((words / wpm) * buffer));
}

function sumParagraphMinutes(unit: CurriculumUnit): number {
  const allText = unit.sections.flatMap(s => s.lessons.flatMap(l => l.paragraphs.map(p => p.text))).join(" ");
  return Math.min(120, Math.max(20, wpmEstimate(allText)));
}

function stableQid(j_code: string, course_code: string, unit: number, stem: string, choices: any[]): string {
  const choicesStr = choices?.map(c => {
    if (typeof c === 'string') return c;
    if (c.key && c.text) return `${c.key}:${c.text}`;
    return String(c);
  }).join("|") || "";
  const payload = `${j_code}|${course_code}|${unit}|${stem}|${choicesStr}`;
  const hash = crypto.createHash("sha256").update(payload).digest("hex");
  return uuidv5(hash, NAMESPACE);
}

// Helper function to normalize paragraphs (strings to objects)
function normalizeParagraphs(sections: any[]): any[] {
  return sections.map(section => ({
    ...section,
    lessons: section.lessons.map((lesson: any) => {
      // Handle different lesson formats
      if (lesson.content) {
        // Unit 6/8 format: content array with different types
        const paragraphs = lesson.content.map((item: any) => {
          if (item.type === 'paragraph') {
            return { type: 'p', text: item.text || item.content };
          } else if (item.type === 'bulleted-list') {
            return item.items.map((text: string) => ({ type: 'li', text }));
          } else if (item.type === 'list') {
            return item.items.map((text: string) => ({ type: 'li', text }));
          } else if (item.type === 'bullets') {
            return item.items.map((text: string) => ({ type: 'li', text }));
          } else {
            return { type: 'p', text: item.text || item.content || JSON.stringify(item) };
          }
        }).flat(); // Flatten lists into individual paragraphs
        
        return {
          ...lesson,
          paragraphs
        };
      } else if (lesson.paragraphs) {
        // Standard format: paragraphs array
        return {
          ...lesson,
          paragraphs: lesson.paragraphs.map((p: any) => {
            if (typeof p === 'string') {
              return { type: 'p', text: p };
            }
            return p;
          })
        };
      } else if (lesson.body) {
        // Unit 11 format: body array of strings
        return {
          ...lesson,
          paragraphs: lesson.body.map((text: string) => ({ type: 'p', text }))
        };
      } else {
        // Fallback
        return lesson;
      }
    })
  }));
}

// --- Curriculum Normalizer ---
export function normalizeCurriculum(raw: any): CurriculumUnit {
  // Try canonical first
  if (raw && raw.unit && raw.j_code && raw.course_code && raw.lang && raw.sections) {
    const normalized = {
      ...raw,
      sections: normalizeParagraphs(raw.sections)
    };
    const parsed = CurriculumUnitSchema.parse(normalized);
    return {
      ...parsed,
      minutes_required: parsed.minutes_required ?? sumParagraphMinutes(parsed),
      objectives: parsed.objectives?.length ? parsed.objectives : ["Learn core CA traffic safety concepts"]
    };
  }
  
  // Canonical without j_code/course_code (Unit 11)
  if (raw && raw.unit && raw.lang && raw.sections && !raw.j_code && !raw.course_code) {
    const normalized = {
      ...raw,
      j_code: "CA",
      course_code: "DE-ONLINE",
      sections: normalizeParagraphs(raw.sections)
    };
    const parsed = CurriculumUnitSchema.parse(normalized);
    return {
      ...parsed,
      minutes_required: parsed.minutes_required ?? sumParagraphMinutes(parsed),
      objectives: parsed.objectives?.length ? parsed.objectives : ["Learn core CA traffic safety concepts"]
    };
  }

  // Legacy variants:
  // 1) meta wrapper: { meta: { unit_no, j_code, course_code, lang, title, minutes_required?, objectives? }, sections: [...] }
  if (raw?.meta && raw?.sections) {
    const u = raw.meta.unit_no ?? raw.meta.unit ?? raw.meta.unitNumber ?? raw.meta.unitId;
    const normalized: CurriculumUnit = {
      unit: Number(u),
      j_code: raw.meta.j_code,
      course_code: raw.meta.course_code,
      lang: raw.meta.lang,
      title: raw.meta.title ?? raw.meta.unit_title ?? `Unit ${u}`,
      minutes_required: raw.meta.minutes_required,
      objectives: raw.meta.objectives ?? ["Learn core CA traffic safety concepts"],
      sections: normalizeParagraphs(raw.sections),
    };
    const parsed = CurriculumUnitSchema.parse(normalized);
    return {
      ...parsed,
      minutes_required: parsed.minutes_required ?? sumParagraphMinutes(parsed),
    };
  }

  // 2) course/unit wrapper: { course:{ j_code, code }, unit:{ unit_no, title, minutes_required?, objectives?, sections } }
  if (raw?.course && raw?.unit && raw.unit.sections) {
    const u = raw.unit.unit_no ?? raw.unit.unitNumber ?? raw.unit.id ?? raw.unit.unitId;
    const normalized: CurriculumUnit = {
      unit: Number(u),
      j_code: raw.course.j_code,
      course_code: raw.course.course_code,
      lang: raw.lang ?? "en",
      title: raw.unit.title ?? `Unit ${u}`,
      minutes_required: raw.unit.minutes_required,
      objectives: raw.unit.objectives ?? ["Learn core CA traffic safety concepts"],
      sections: normalizeParagraphs(raw.unit.sections),
    };
    const parsed = CurriculumUnitSchema.parse(normalized);
    return {
      ...parsed,
      minutes_required: parsed.minutes_required ?? sumParagraphMinutes(parsed),
    };
  }
  
  // 2b) course/unit wrapper with sections at root: { course:{ j_code, code }, unit:{ unit_no, title, minutes_required?, objectives? }, sections: [...] }
  if (raw?.course && raw?.unit && raw.sections) {
    const u = raw.unit.unit_no ?? raw.unit.unitNumber ?? raw.unit.id ?? raw.unit.unitId;
    const normalized: CurriculumUnit = {
      unit: Number(u),
      j_code: raw.course.j_code,
      course_code: raw.course.course_code,
      lang: raw.lang ?? "en",
      title: raw.unit.title ?? `Unit ${u}`,
      minutes_required: raw.unit.minutes_required,
      objectives: raw.unit.objectives ?? ["Learn core CA traffic safety concepts"],
      sections: normalizeParagraphs(raw.sections),
    };
    const parsed = CurriculumUnitSchema.parse(normalized);
    return {
      ...parsed,
      minutes_required: parsed.minutes_required ?? sumParagraphMinutes(parsed),
    };
  }

  // 3) unitNumber format: { unitNumber, title, minutesRequired, objectives, sections }
  if (raw?.unitNumber && raw?.sections) {
    const normalized: CurriculumUnit = {
      unit: Number(raw.unitNumber),
      j_code: raw.j_code ?? "CA",
      course_code: raw.course_code ?? "DE-ONLINE",
      lang: raw.lang ?? "en",
      title: raw.title,
      minutes_required: raw.minutesRequired,
      objectives: raw.objectives ?? ["Learn core CA traffic safety concepts"],
      sections: normalizeParagraphs(raw.sections),
    };
    const parsed = CurriculumUnitSchema.parse(normalized);
    return {
      ...parsed,
      minutes_required: parsed.minutes_required ?? sumParagraphMinutes(parsed),
    };
  }

  // 4) unitId format: { unitId, title, minutes/estimatedTimeMinutes, objectives, sections }
  if (raw?.unitId && raw?.sections) {
    const unitNum = parseInt(raw.unitId.replace(/\D/g, '')) || 1;
    const normalized: CurriculumUnit = {
      unit: unitNum,
      j_code: raw.j_code ?? "CA",
      course_code: raw.course_code ?? "DE-ONLINE",
      lang: raw.lang ?? "en",
      title: raw.title,
      minutes_required: raw.minutes ?? raw.estimatedTimeMinutes,
      objectives: raw.objectives ?? ["Learn core CA traffic safety concepts"],
      sections: normalizeParagraphs(raw.sections),
    };
    const parsed = CurriculumUnitSchema.parse(normalized);
    return {
      ...parsed,
      minutes_required: parsed.minutes_required ?? sumParagraphMinutes(parsed),
    };
  }

  throw new Error("Unrecognized curriculum JSON shape");
}

// --- Questions Normalizer ---
export function normalizeQuestions(raw: any, context: { j_code: string; course_code: string; unit: number; lang: "en"|"es"; }): QuestionsFile {
  const parsed = QuestionsFileSchema.parse(raw);

  // Canonical path: questions[] with proper choice objects
  if (parsed.questions && Array.isArray(parsed.questions)) {
    const normalized = parsed.questions.map(q => {
      // Handle Unit 7 format: prompt/options/answerIndex
      if (q.prompt && q.options && typeof q.answerIndex === 'number') {
        const choices = q.options.map((text: string, index: number) => ({
          key: String.fromCharCode(65 + index) as "A" | "B" | "C" | "D",
          text
        }));
        const answer = String.fromCharCode(65 + q.answerIndex) as "A" | "B" | "C" | "D";
        
        return {
          stem: q.prompt,
          choices,
          answer,
          explanation: q.explanation || "No explanation provided",
          skill: q.skill || "general",
          difficulty: q.difficulty || 3,
          tags: q.tags || [],
          qid: stableQid(context.j_code, context.course_code, context.unit, q.prompt, choices)
        };
      }
      
      // Handle legacy string choices format
      if (Array.isArray(q.choices) && q.choices.length > 0 && typeof q.choices[0] === 'string') {
        const choices = q.choices.map((text: string, index: number) => ({
          key: String.fromCharCode(65 + index) as "A" | "B" | "C" | "D", // A, B, C, D
          text
        }));
        
        // Handle legacy numeric answer format
        let answer: "A" | "B" | "C" | "D";
        if (typeof q.answer === 'number') {
          answer = String.fromCharCode(65 + q.answer) as "A" | "B" | "C" | "D";
        } else if (typeof q.answer === 'string') {
          // If answer is full text, find matching choice
          const answerIndex = q.choices.findIndex((choice: string) => choice === q.answer);
          answer = String.fromCharCode(65 + answerIndex) as "A" | "B" | "C" | "D";
        } else {
          answer = q.answer;
        }
        
        return {
          ...q,
          choices,
          answer,
          qid: stableQid(context.j_code, context.course_code, context.unit, q.stem, choices)
        };
      }
      
      // Already in canonical format
      return {
        ...q,
        qid: stableQid(context.j_code, context.course_code, context.unit, q.stem, q.choices)
      };
    });
    
    return { ...context, questions: normalized };
  }

  // Legacy ES translations path: translations: { "<EN_STEM_HASH>": "<SPANISH_STEM>" } etc.
  if (parsed.translations) {
    return { ...context, translations: parsed.translations };
  }

  // Legacy wrappers with unit_no/unitNumber/unitId on file:
  if (!parsed.questions && (parsed.unit || parsed.unit_no || parsed.unitNumber || parsed.unitId)) {
    // Some legacy EN files had questions directly under raw.questions but with missing header info.
    if (raw.questions) {
      const unit = parsed.unit ?? parsed.unit_no ?? parsed.unitNumber ?? (parsed.unitId ? parseInt(parsed.unitId.replace(/\D/g, '')) : null);
      const normalized = raw.questions.map((q: any) => {
        // Handle Unit 7 format: prompt/options/answerIndex
        if (q.prompt && q.options && typeof q.answerIndex === 'number') {
          const choices = q.options.map((text: string, index: number) => ({
            key: String.fromCharCode(65 + index) as "A" | "B" | "C" | "D",
            text
          }));
          const answer = String.fromCharCode(65 + q.answerIndex) as "A" | "B" | "C" | "D";
          
          return {
            stem: q.prompt,
            choices,
            answer,
            explanation: q.explanation || "No explanation provided",
            skill: q.skill || "general",
            difficulty: q.difficulty || 3,
            tags: q.tags || [],
            qid: stableQid(context.j_code, context.course_code, Number(unit), q.prompt, choices)
          };
        }
        
        // Handle Unit 7 format: prompt/options/answerIndex (fallback)
        if (q.prompt && q.options && typeof q.answerIndex === 'number') {
          const choices = q.options.map((text: string, index: number) => ({
            key: String.fromCharCode(65 + index) as "A" | "B" | "C" | "D",
            text
          }));
          const answer = String.fromCharCode(65 + q.answerIndex) as "A" | "B" | "C" | "D";
          
          return {
            stem: q.prompt,
            choices,
            answer,
            explanation: q.explanation || "No explanation provided",
            skill: q.skill || "general",
            difficulty: q.difficulty || 3,
            tags: q.tags || [],
            qid: stableQid(context.j_code, context.course_code, Number(unit), q.prompt, choices)
          };
        }
        
        // Handle Unit 8 format: stem/options with objects/answer
        if (q.stem && q.options && Array.isArray(q.options) && q.options[0] && typeof q.options[0] === 'object' && q.options[0].id) {
          const choices = q.options.map((opt: any) => ({
            key: opt.id as "A" | "B" | "C" | "D",
            text: opt.text
          }));
          
          return {
            stem: q.stem,
            choices,
            answer: q.answer,
            explanation: q.explanation || "No explanation provided",
            skill: q.skill || "general",
            difficulty: q.difficulty || 3,
            tags: q.tags || [],
            qid: stableQid(context.j_code, context.course_code, Number(unit), q.stem, choices)
          };
        }
        
        // Handle other legacy formats
        const stem = q.stem || q.prompt;
        const choices = q.choices || q.options || [];
        return {
          ...q,
          stem: stem,
          choices: choices,
          qid: stableQid(context.j_code, context.course_code, Number(unit), stem, choices)
        };
      });
      return { ...context, unit: Number(unit), questions: normalized };
    }
  }

  throw new Error("Unrecognized questions JSON shape");
}
