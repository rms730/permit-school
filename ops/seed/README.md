# Seeding (Canonical)

This directory contains the hardened and standardized seeding pipeline for curriculum and questions. The pipeline normalizes all legacy JSON structures to a canonical format, ensures deterministic question IDs, and provides comprehensive verification.

## Quick Start

```bash
# Local development
npm run env:check:local
npm run seed:all

# Single files
tsx ops/seed/seed-curriculum.ts ops/seed/curriculum/CA/DE-ONLINE/units/unit03.en.json
tsx ops/seed/seed-questions.ts ops/seed/questions/CA/DE-ONLINE/units/unit03.en.json CA DE-ONLINE 3 en
tsx ops/seed/seed-questions.ts ops/seed/questions/CA/DE-ONLINE/units/unit03.es.json CA DE-ONLINE 3 es

# Verify & report
npm run seed:verify
cat artifacts/seed/verify-report.json
```

## Canonical Schema

### Curriculum Schema

All curriculum files are normalized to this canonical structure:

```typescript
{
  unit: number,                    // Unit number (1-12)
  j_code: string,                  // Jurisdiction code (e.g., "CA")
  course_code: string,             // Course code (e.g., "DE-ONLINE")
  lang: "en" | "es",              // Language
  title: string,                   // Unit title
  minutes_required?: number,       // Estimated minutes (auto-calculated if missing)
  objectives?: string[],           // Learning objectives
  sections: [                      // Content sections
    {
      id?: string,                 // Optional section ID
      title: string,               // Section title
      lessons: [                   // Lessons within section
        {
          id?: string,             // Optional lesson ID
          title: string,           // Lesson title
          paragraphs: [            // Content paragraphs
            {
              type?: "p" | "note" | "tip" | "warning",  // Paragraph type
              text: string,        // Paragraph content
              handbook_refs?: string[]  // Optional handbook references
            }
          ]
        }
      ]
    }
  ]
}
```

### Questions Schema

All question files are normalized to this canonical structure:

```typescript
{
  unit?: number,                   // Unit number (legacy support)
  j_code?: string,                 // Jurisdiction code (legacy support)
  course_code?: string,            // Course code (legacy support)
  lang?: "en" | "es",             // Language (legacy support)
  questions?: [                    // Canonical questions array
    {
      stem: string,                // Question text
      choices: [                   // Exactly 4 choices
        {
          key: "A" | "B" | "C" | "D",
          text: string
        }
      ],
      answer: "A" | "B" | "C" | "D",  // Correct answer
      explanation: string,         // Answer explanation
      skill: string,               // Skill category
      difficulty: number,          // 1-5 difficulty
      tags: string[],              // Question tags
      handbook_refs?: string[],    // Optional handbook references
      qid?: string                 // Deterministic UUID (injected during normalization)
    }
  ],
  translations?: Record<string, string>  // Legacy Spanish translations map
}
```

## Normalizer

The normalizer (`ops/seed/lib/normalize.ts`) converts all existing legacy structures to canonical format:

### Curriculum Normalization

Supports these legacy formats:

- **Flat structure**: `{ unit, j_code, course_code, lang, title, sections }`
- **Meta wrapper**: `{ meta: { unit_no, j_code, course_code, lang, title }, sections }`
- **Course/Unit wrapper**: `{ course: { j_code, code }, unit: { unit_no, title, sections } }`
- **unitNumber format**: `{ unitNumber, title, minutesRequired, objectives, sections }`
- **unitId format**: `{ unitId, title, estimatedTimeMinutes, objectives, sections }`

### Questions Normalization

Supports these legacy formats:

- **Canonical questions**: `{ questions: [...] }`
- **Legacy translations**: `{ translations: { "hash": "spanish_text" } }`
- **Legacy wrappers**: `{ unit_no, questions: [...] }`

## Deterministic Question IDs

Questions use UUID v5 with a stable namespace to ensure:

- **Idempotency**: Same content always generates same ID
- **Consistency**: English and Spanish versions of same question share same ID
- **Stability**: IDs don't change between runs

The ID is generated from: `j_code|course_code|unit|stem|choices`

## Spanish Translations

Spanish content is handled in two ways:

1. **Canonical ES questions**: Full question objects with deterministic IDs matching English
2. **Legacy translations**: Simple text mappings (deprecated, will show warnings)

## Quality Gates

The verifier enforces these quality gates:

### Curriculum Gates

- Minimum 40 paragraphs per unit
- Objectives array must be present
- Minutes required between 20-120
- Valid JSON structure

### Question Gates

- Exactly 4 choices per question
- Explanations minimum 8 characters
- No duplicate choice keys
- Minimum 15 English questions per unit
- Valid answer keys (A, B, C, D)

## File Structure

```
ops/seed/
├── lib/
│   ├── schema.ts          # Canonical Zod schemas
│   ├── normalize.ts       # Legacy → canonical normalizer
│   ├── files.ts           # File utilities
│   └── supabase.ts        # Database client
├── curriculum/
│   └── CA/DE-ONLINE/units/
│       ├── unit03.en.json
│       ├── unit03.es.json
│       └── ...
├── questions/
│   └── CA/DE-ONLINE/units/
│       ├── unit03.en.json
│       ├── unit03.es.json
│       └── ...
├── seed-curriculum.ts     # Curriculum seeder
├── seed-questions.ts      # Questions seeder
├── seed-all.ts           # Orchestrator
├── verify-seed.ts        # Quality verifier
└── README.md
```

## Commands

### Orchestration

- `npm run seed:all` - Seed all units (curriculum → questions → verify)
- `npm run seed:verify` - Verify all units and generate report

### Individual Files

- `npm run seed:curriculum <file>` - Seed single curriculum file
- `npm run seed:questions <file> <j_code> <course_code> <unit> <lang>` - Seed single questions file

### Legacy Support

- `npm run seed:unit3` - Legacy unit-specific commands (still work)
- `npm run seed:verify:unit3` - Legacy verification commands

## Reports

Verification reports are written to `artifacts/seed/verify-report.json`:

```json
[
  {
    "unit": 3,
    "lang": "en",
    "errors": [],
    "warnings": [],
    "stats": {
      "paragraphs": 48,
      "questions": 20
    }
  }
]
```

## Migration from Legacy

To migrate existing units to canonical format:

1. **Curriculum**: Use the normalizer - no changes needed to files
2. **Questions**: Convert Spanish translation maps to full question objects
3. **Run verification**: `npm run seed:verify` to identify issues
4. **Fix warnings**: Address any quality gate violations
5. **Re-seed**: `npm run seed:all` to apply changes

## Environment

Required environment variables:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

## Dependencies

- `zod` - Schema validation
- `uuid` - Deterministic ID generation
- `@supabase/supabase-js` - Database client
- `dotenv-flow` - Environment loading
- `tsx` - TypeScript execution
