import { z } from "zod";

// Curriculum schemas - more flexible to handle different structures
export const CurriculumParagraphSchema = z.object({
  type: z.enum(["p", "li"]).default("p"),
  text: z.string().min(1),
});

// Flexible lesson schema that can handle different structures
export const CurriculumLessonSchema = z.object({
  lessonId: z.string().min(1).optional(), // "u3_s1_l1" etc
  id: z.string().min(1).optional(), // Alternative field name
  title: z.string().min(1),
  paragraphs: z.array(z.string()).min(1), // Array of strings
  minutes: z.number().optional(),
  callouts: z.array(z.any()).optional(),
  key_points: z.array(z.string()).optional(),
  citations: z.array(z.any()).optional(),
});

// Flexible section schema
export const CurriculumSectionSchema = z.object({
  sectionId: z.string().min(1).optional(), // "u3_s1"
  id: z.string().min(1).optional(), // Alternative field name
  title: z.string().min(1),
  lessons: z.array(CurriculumLessonSchema).min(1),
});

// Flexible unit schema that can handle different structures
export const CurriculumUnitSchema = z.union([
  // Structure 1: Flat structure (Unit 3, 11)
  z.object({
    unit: z.number().int().min(1).max(12),
    j_code: z.literal("CA"),
    course_code: z.literal("DE-ONLINE"),
    lang: z.enum(["en", "es"]),
    title: z.string().min(1),
    minutes_required: z.number().int().min(5).max(240),
    objectives: z.array(z.string()).min(1),
    sections: z.array(CurriculumSectionSchema).min(1),
  }),
  
  // Structure 2: Meta object (Unit 4)
  z.object({
    meta: z.object({
      j_code: z.literal("CA"),
      course_code: z.literal("DE-ONLINE"),
      unit_no: z.number().int().min(1).max(12),
      lang: z.enum(["en", "es"]),
      title: z.string().min(1),
      minutes_required: z.number().int().min(5).max(240),
      objectives: z.array(z.string()).min(1).optional(),
    }),
    sections: z.array(CurriculumSectionSchema).min(1),
  }),
  
  // Structure 3: Course and Unit objects (Unit 5, 9, 10, 12)
  z.object({
    course: z.object({
      j_code: z.literal("CA"),
      course_code: z.literal("DE-ONLINE"),
    }),
    unit: z.object({
      unit_no: z.number().int().min(1).max(12),
      title: z.string().min(1),
      minutes_required: z.number().int().min(5).max(240),
      objectives: z.array(z.string()).min(1),
    }),
    sections: z.array(CurriculumSectionSchema).min(1),
  }),
  
  // Structure 4: unitNumber (Unit 6)
  z.object({
    unitNumber: z.number().int().min(1).max(12),
    title: z.string().min(1),
    minutesRequired: z.number().int().min(5).max(240),
    objectives: z.array(z.string()).min(1),
    sections: z.array(CurriculumSectionSchema).min(1),
  }),
  
  // Structure 5: unitId (Unit 7, 8)
  z.object({
    unitId: z.string(),
    title: z.string().min(1),
    estimatedTimeMinutes: z.number().int().min(5).max(240),
    objectives: z.array(z.string()).min(1),
    sections: z.array(CurriculumSectionSchema).min(1),
  }),
]);

export type CurriculumUnit = z.infer<typeof CurriculumUnitSchema>;

// Question schemas
export const ChoiceSchema = z.object({
  key: z.string().min(1),           // "A", "B", ...
  text: z.string().min(1),
});

export const QuestionSchema = z.object({
  id: z.string().min(1),            // "u3_q01" - stable within unit
  skill: z.string().min(1),         // e.g., "basic_speed_law"
  difficulty: z.number().int().min(1).max(5).default(2),
  tags: z.array(z.string()).default([]),
  stem: z.string().min(1),
  choices: z.array(ChoiceSchema).min(2),
  answer: z.string().min(1),        // the 'key' that is correct
  explanation: z.string().min(1),
});

export const UnitQuestionsSchema = z.union([
  // Structure 1: Flat structure (Unit 3, 11)
  z.object({
    unit: z.number().int().min(1).max(12),
    j_code: z.literal("CA"),
    course_code: z.literal("DE-ONLINE"),
    lang: z.enum(["en", "es"]),
    questions: z.array(QuestionSchema).min(5),
  }),
  
  // Structure 2: Meta object with questions (Unit 4 EN, etc.)
  z.object({
    meta: z.object({
      j_code: z.literal("CA"),
      course_code: z.literal("DE-ONLINE"),
      unit_no: z.number().int().min(1).max(12),
      lang: z.enum(["en", "es"]),
      count: z.number().optional(),
    }),
    questions: z.array(QuestionSchema).min(5),
  }),
  
  // Structure 3: Meta object with translations (Unit 4 ES, etc.)
  z.object({
    meta: z.object({
      j_code: z.literal("CA"),
      course_code: z.literal("DE-ONLINE"),
      unit_no: z.number().int().min(1).max(12),
      lang: z.enum(["en", "es"]),
      count: z.number().optional(),
    }),
    translations: z.array(z.object({
      ref_id: z.string(),
      stem: z.string(),
      choices: z.array(ChoiceSchema),
      explanation: z.string(),
      citations: z.array(z.any()).optional(),
    })).min(5),
  }),
]);

export type UnitQuestions = z.infer<typeof UnitQuestionsSchema>;
