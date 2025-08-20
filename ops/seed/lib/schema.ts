import { z } from "zod";

export const CurriculumParagraphSchema = z.object({
  type: z.string().default("p"),
  text: z.string().min(1),
  handbook_refs: z.array(z.string()).optional(), // e.g., ["Ch2:Signs", "Ch3:RightOfWay"]
});

export const CurriculumLessonSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  paragraphs: z.array(CurriculumParagraphSchema).min(1),
});

export const CurriculumSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  lessons: z.array(CurriculumLessonSchema).min(1),
});

export const CurriculumUnitSchema = z.object({
  unit: z.number().int().positive(),
  j_code: z.string().length(2),
  course_code: z.string().min(2),
  lang: z.enum(["en", "es"]),
  title: z.string().min(3),
  minutes_required: z.number().int().positive().optional(),
  objectives: z.array(z.string()).min(1).optional(),
  sections: z.array(CurriculumSectionSchema).min(1),
});

export type CurriculumUnit = z.infer<typeof CurriculumUnitSchema>;

export const QuestionChoiceSchema = z.object({
  key: z.enum(["A","B","C","D"]),
  text: z.string().min(1),
});

export const QuestionSchema = z.object({
  stem: z.string().min(8).optional(), // Allow legacy formats
  prompt: z.string().min(8).optional(), // Unit 7 format
  choices: z.array(z.union([QuestionChoiceSchema, z.string()])).length(4).optional(), // Allow legacy string choices
  options: z.array(z.union([z.string(), z.object({ id: z.string(), text: z.string() })])).length(4).optional(), // Unit 7/8 format
  answer: z.union([z.enum(["A","B","C","D"]), z.number(), z.string()]).optional(), // Allow legacy formats
  answerIndex: z.number().optional(), // Unit 7 format
  explanation: z.string().min(8).optional(), // Allow missing explanations
  skill: z.string().min(2).optional(), // Allow missing skills
  difficulty: z.number().int().min(1).max(5).default(3),
  tags: z.array(z.string()).default([]),
  handbook_refs: z.array(z.string()).optional(),
  // Will be injected during normalization:
  qid: z.string().uuid().optional(),
});

export const QuestionsFileSchema = z.object({
  unit: z.number().int().positive().optional(),
  unit_no: z.number().int().positive().optional(), // legacy
  unitNumber: z.number().int().positive().optional(), // legacy
  unitId: z.string().optional(), // legacy
  j_code: z.string().length(2).optional(),
  course_code: z.string().min(2).optional(),
  lang: z.enum(["en","es"]).optional(),
  // canonical path
  questions: z.array(QuestionSchema).optional(),
  // legacy translation path (spanish):
  translations: z.array(z.object({
    ref_id: z.string(),
    stem: z.string(),
    choices: z.array(QuestionChoiceSchema),
    explanation: z.string(),
    citations: z.array(z.any()).optional(),
  })).optional()
});

export type QuestionsFile = z.infer<typeof QuestionsFileSchema>;

// === CANONICAL SCHEMAS FOR NORMALIZATION ===

export const CurriculumLessonCanonicalSchema = z.object({
  title: z.string().min(3),
  minutes: z.number().int().positive().max(60),
  content: z.array(z.string().min(1)).min(1),
  review: z
    .array(
      z.union([
        z.object({
          type: z.literal("mcq"),
          prompt: z.string().min(3),
          choices: z.array(z.string().min(1)).length(4),
          answer: z.union([z.string().length(1), z.number().int().min(0).max(3)]),
          explanation: z.string().min(3).optional(),
        }),
        z.object({
          type: z.literal("short"),
          prompt: z.string().min(3),
          answer: z.string().min(1),
          explanation: z.string().min(3).optional(),
        }),
      ])
    )
    .optional()
    .default([]),
});

export const CurriculumSectionCanonicalSchema = z.object({
  title: z.string().min(3),
  lessons: z.array(CurriculumLessonCanonicalSchema).min(1),
});

export const CurriculumUnitCanonicalSchema = z.object({
  unit: z.number().int().min(1).max(99),
  j_code: z.literal("CA"),
  course_code: z.literal("DE-ONLINE"),
  lang: z.enum(["en", "es"]),
  title: z.string().min(3),
  minutes_required: z.number().int().positive().max(300),
  objectives: z.array(z.string().min(3)).min(1).optional().default([]),
  sections: z.array(CurriculumSectionCanonicalSchema).min(1),
  metadata: z
    .object({
      source: z.string().min(1).optional(),
      version: z.string().min(1).default("1.0.0"),
      updated_at: z.string().min(5).optional(), // ISO string preferred
    })
    .optional()
    .default({ version: "1.0.0" }),
});

export type CurriculumUnitCanonical = z.infer<typeof CurriculumUnitCanonicalSchema>;

export const QuestionChoiceCanonicalSchema = z.object({
  key: z.enum(["A", "B", "C", "D"]),
  text: z.string().min(1),
});

export const QuestionCanonicalSchema = z.object({
  ref: z.string().min(1).optional(), // optional stable ref
  skill: z.string().min(2).optional().default("General"),
  difficulty: z.number().int().min(1).max(5).default(2),
  stem: z.string().min(5),
  choices: z.array(QuestionChoiceCanonicalSchema).length(4),
  answer: z.union([
    z.string().length(1),             // A-D
    z.number().int().min(0).max(3),   // 0-3
  ]),
  explanation: z.string().min(5).optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const QuestionSetCanonicalSchema = z.object({
  unit: z.number().int().min(1).max(99),
  j_code: z.literal("CA"),
  course_code: z.literal("DE-ONLINE"),
  lang: z.enum(["en", "es"]),
  questions: z.array(QuestionCanonicalSchema).min(1),
  metadata: z
    .object({
      source: z.string().min(1).optional(),
      version: z.string().min(1).default("1.0.0"),
      updated_at: z.string().min(5).optional(),
    })
    .optional()
    .default({ version: "1.0.0" }),
});

export type QuestionSetCanonical = z.infer<typeof QuestionSetCanonicalSchema>;
