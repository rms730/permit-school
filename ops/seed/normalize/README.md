# JSON Normalization Toolchain

This toolchain safely migrates all existing curriculum & questions Unit JSON files (Units 1–12, EN/ES) into a **canonical schema** with automatic backups and validation.

## Features

- **Safe & Repeatable**: Dry-run by default, automatic backups when writing
- **Idempotent**: Running multiple times produces the same result
- **Legacy Support**: Handles various legacy JSON formats (flat, meta-based, nested, etc.)
- **Validation**: All files validated against canonical Zod schemas
- **Comprehensive**: Processes both curriculum and questions files

## Usage

### Basic Commands

```bash
# Dry-run (default) - shows what would change
npm run seed:normalize

# Apply changes with automatic backups
npm run seed:normalize:write

# Verify all normalized files
npm run seed:verify
```

### Mode-Specific Commands

```bash
# Curriculum only
npm run seed:normalize:curr
npm run seed:normalize:curr:write

# Questions only  
npm run seed:normalize:questions
npm run seed:normalize:questions:write
```

### Direct CLI Usage

```bash
# Dry-run all files
npx tsx ops/seed/normalize/cli.ts

# Write changes with backups
npx tsx ops/seed/normalize/cli.ts --write

# Curriculum only
npx tsx ops/seed/normalize/cli.ts --mode=curriculum

# Questions only
npx tsx ops/seed/normalize/cli.ts --mode=questions
```

## File Structure

```
ops/seed/
├── normalize/
│   ├── cli.ts          # Main CLI entry point
│   ├── convert.ts      # Core conversion logic
│   ├── detect.ts       # Legacy format detection
│   ├── backup.ts       # Automatic backup utilities
│   ├── log.ts          # Logging utilities
│   ├── verify.ts       # Validation script
│   └── README.md       # This file
├── lib/
│   └── schema.ts       # Canonical Zod schemas
└── .backups/           # Automatic backups (timestamped)
    └── 2025-08-20T06-02-45-958Z/
        └── ops/seed/
            ├── curriculum/CA/DE-ONLINE/units/
            └── questions/CA/DE-ONLINE/units/
```

## Canonical Schemas

### Curriculum Unit Schema

```typescript
{
  unit: number,                    // 1-99
  j_code: "CA",                   // Jurisdiction code
  course_code: "DE-ONLINE",       // Course identifier
  lang: "en" | "es",              // Language
  title: string,                  // Unit title
  minutes_required: number,       // Total time required
  objectives: string[],           // Learning objectives
  sections: [                     // Unit sections
    {
      title: string,
      lessons: [                  // Section lessons
        {
          title: string,
          minutes: number,        // Lesson duration
          content: string[],      // Lesson content paragraphs
          review: [               // Optional review questions
            {
              type: "mcq" | "short",
              prompt: string,
              choices?: string[],  // For MCQ only
              answer: string | number,
              explanation?: string
            }
          ]
        }
      ]
    }
  ],
  metadata: {
    source?: string,
    version: string,
    updated_at?: string
  }
}
```

### Question Set Schema

```typescript
{
  unit: number,                    // 1-99
  j_code: "CA",                   // Jurisdiction code
  course_code: "DE-ONLINE",       // Course identifier
  lang: "en" | "es",              // Language
  questions: [                    // Question array
    {
      ref?: string,               // Optional reference ID
      skill?: string,             // Skill category
      difficulty?: number,        // 1-5 difficulty
      stem: string,               // Question text
      choices: [                  // Multiple choice options
        {
          key: "A" | "B" | "C" | "D",
          text: string
        }
      ],
      answer: string | number,    // Correct answer (A-D or 0-3)
      explanation?: string,       // Answer explanation
      tags?: string[]             // Question tags
    }
  ],
  metadata: {
    source?: string,
    version: string,
    updated_at?: string
  }
}
```

## Legacy Format Support

The toolchain automatically detects and converts various legacy formats:

### Curriculum Legacy Formats

- **Flat Legacy**: Direct unit properties
- **Meta-based**: Properties nested under `meta` object
- **Course/Unit Nested**: Properties nested under `course.unit`
- **Topics vs Lessons**: Converts `topics` to `lessons`
- **Paragraphs vs Content**: Converts `paragraphs` to `content`
- **Duration Variations**: Handles `duration_min`, `minutes`, `durationMinutes`

### Questions Legacy Formats

- **String Choices**: Converts string arrays to choice objects
- **Object Choices**: Normalizes existing choice objects
- **Answer Formats**: Handles various answer representations
- **Translation Structure**: Processes nested translation objects
- **Unit Variations**: Handles `unitNumber`, `unitId`, `meta.unit_no`

## Safety Features

### Automatic Backups

When using `--write`, original files are automatically backed up to:
```
ops/seed/.backups/{timestamp}/ops/seed/{original-path}
```

### Dry-Run by Default

All commands run in dry-run mode unless `--write` is specified, showing what would change without modifying files.

### Idempotent Operations

Running the normalization multiple times on the same files produces identical results - no unnecessary changes.

### Validation

All normalized files are validated against the canonical schemas to ensure data integrity.

## Error Handling

- **Validation Errors**: Files that fail schema validation are reported with specific error messages
- **Parse Errors**: Malformed JSON files are caught and reported
- **Missing Files**: Gracefully handles missing directories or files
- **Backup Failures**: Reports backup creation issues

## Examples

### Successful Normalization

```bash
$ npm run seed:normalize
ℹ️  Normalize Units (dry-run=true) mode=all
✅ Already canonical: ops/seed/curriculum/CA/DE-ONLINE/units/unit01.en.json
✅ Already canonical: ops/seed/curriculum/CA/DE-ONLINE/units/unit01.es.json
...
ℹ️  Summary: checked=48 changed=0 errors=0 write=false
```

### Applying Changes

```bash
$ npm run seed:normalize:write
ℹ️  Normalize Units (dry-run=false) mode=all
✅ Normalized: ops/seed/curriculum/CA/DE-ONLINE/units/unit01.en.json (backup: ops/seed/.backups/2025-08-20T06-02-45-958Z/...)
...
ℹ️  Summary: checked=48 changed=48 errors=0 write=true
```

### Verification

```bash
$ npm run seed:verify
ℹ️  Verifying 48 normalized files...
✅ ✅ ops/seed/curriculum/CA/DE-ONLINE/units/unit01.en.json
...
ℹ️  Summary: valid=48 errors=0
```

## Integration

The toolchain integrates seamlessly with existing seeders:

- **Non-breaking**: Existing seeders continue to work
- **Stricter Validation**: Enhanced schema validation where appropriate
- **NPM Scripts**: Easy integration via package.json scripts
- **CI/CD Ready**: Can be integrated into build pipelines

## Troubleshooting

### Common Issues

1. **"Would normalize" on already canonical files**: Check for timestamp differences in metadata
2. **Validation errors**: Review the specific field causing the error in the schema
3. **Backup failures**: Ensure write permissions in the backup directory

### Debug Mode

For detailed debugging, you can add console.log statements in the conversion functions or examine the backup files to compare before/after states.
