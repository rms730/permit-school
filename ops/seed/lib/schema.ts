import { z } from "zod";

// Curriculum schemas
export const CurriculumParagraphSchema = z.object({
  type: z.enum(["p", "li"]).default("p"),
  text: z.string().min(1),
});

export const CurriculumLessonSchema = z.object({
  id: z.string().min(1),               // "U1-L1" etc - unique within unit
  title: z.string().min(1),
  paragraphs: z.array(CurriculumParagraphSchema).min(1),
});

export const CurriculumSectionSchema = z.object({
  id: z.string().min(1),               // "U1-S1"
  title: z.string().min(1),
  lessons: z.array(CurriculumLessonSchema).min(1),
});

export const CurriculumUnitSchema = z.object({
  meta: z.object({
    j_code: z.literal("CA"),
    course_code: z.literal("DE-ONLINE"),
    unit_no: z.union([z.literal(1), z.literal(2)]),  // support Unit 1 and 2
    lang: z.enum(["en", "es"]),
    unit_title: z.string().min(1),
    minutes_required: z.number().int().min(5).max(240),
    objectives: z.array(z.string()).min(1),
    source: z.string().optional(),     // e.g., DMV handbook ref/URL
  }),
  sections: z.array(CurriculumSectionSchema).min(1),
});

export type CurriculumUnit = z.infer<typeof CurriculumUnitSchema>;

// Question schemas
export const ChoiceSchema = z.object({
  key: z.string().min(1),           // "A", "B", ...
  text: z.string().min(1),
});

export const QuestionSchema = z.object({
  id: z.string().min(1),            // "U1-Q1" - stable within unit
  skill: z.string().min(1),         // e.g., "Right-of-Way"
  difficulty: z.number().int().min(1).max(5).default(2),
  stem: z.string().min(1),
  choices: z.array(ChoiceSchema).min(2),
  answer: z.string().min(1),        // the 'key' that is correct
  explanation: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export const UnitQuestionsSchema = z.object({
  meta: z.object({
    j_code: z.literal("CA"),
    course_code: z.literal("DE-ONLINE"),
    unit_no: z.union([z.literal(1), z.literal(2)]),  // support Unit 1 and 2
    lang: z.enum(["en", "es"]),
  }),
  questions: z.array(QuestionSchema).min(5),
});

export type UnitQuestions = z.infer<typeof UnitQuestionsSchema>;
