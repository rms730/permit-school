# Final Exams

## Overview

The CA/DE-ONLINE course uses an active final exam blueprint that draws questions across Units 1–12 with balanced skills and difficulty. Pass criteria and question count are sourced from `jurisdiction_configs`.

## Blueprint Configuration

### Coverage Strategy

The final exam blueprint ensures comprehensive coverage across all driving skills:

- **Signs & Signals** (18%): Traffic signs, signals, and pavement markings
- **Right-of-Way** (12%): Intersection rules and priority
- **Turns & Parking** (8%): Proper turning techniques and parking rules
- **Sharing the Road** (10%): Pedestrians, cyclists, motorcycles, buses
- **Freeways** (10%): Merging, exiting, and freeway driving
- **Adverse Conditions** (8%): Weather, night driving, visibility
- **Speed & Space** (8%): Speed limits and following distance
- **Alcohol & Drugs** (8%): DUI laws and impairment
- **Emergencies** (8%): Collision procedures and emergency response
- **Lane Control** (6%): Proper lane positioning and usage
- **Licensing & Admin** (4%): License renewal and registration

### Difficulty Distribution

Questions are distributed across difficulty levels for realistic assessment:

- **Level 1** (40%): Basic knowledge and recognition
- **Level 2** (35%): Understanding and application
- **Level 3** (20%): Analysis and decision-making
- **Level 4** (5%): Complex scenarios and judgment
- **Level 5** (0%): Reserved for special cases

### Unit Coverage

Each unit (1-12) is guaranteed at least one question to ensure comprehensive curriculum coverage.

## Configuration

### Jurisdiction Settings

Final exam parameters are configured in `jurisdiction_configs`:

```sql
-- Example CA configuration
INSERT INTO jurisdiction_configs (
  jurisdiction_id,
  final_exam_questions,    -- Number of questions (default: 30)
  final_exam_pass_pct      -- Pass percentage (default: 0.8 = 80%)
) VALUES (
  (SELECT id FROM jurisdictions WHERE code = 'CA'),
  30,                      -- 30 questions
  0.8                      -- 80% pass rate
);
```

### Environment Overrides

For local testing and development, you can override settings:

```bash
# Override question count for testing
FINAL_EXAM_QUESTION_COUNT=15 npm run seed:final

# Override pass percentage
FINAL_EXAM_PASS_PCT=0.7 npm run seed:final
```

## Seeding

### Basic Commands

```bash
# Create/update final exam blueprint and generate missing questions
npm run seed:final

# Verify blueprint and question coverage
npm run seed:final:verify
```

### Seeding Process

The seeding process:

1. **Reads Configuration**: Loads blueprint config from `ops/seed/questions/CA/DE-ONLINE/final.blueprint.json`
2. **Checks Coverage**: Analyzes existing approved questions per skill
3. **Generates Gaps**: Creates missing questions with EN/ES translations
4. **Creates Blueprint**: Upserts active blueprint with rules
5. **Validates**: Ensures all requirements are met

### Question Generation

When gaps are detected, the seeder generates:

- **English Questions**: High-quality, curriculum-aligned questions
- **Spanish Translations**: Faithful translations for ESL learners
- **Proper Tagging**: Includes `final`, `unit:<n>`, and `dmv:<topic>` tags
- **Explanations**: Educational explanations that teach concepts

## Blueprint Rules

### Rule Structure

Each skill has a corresponding blueprint rule:

```sql
-- Example rule for signs-and-signals
INSERT INTO exam_blueprint_rules (
  blueprint_id,
  rule_no,
  skill,
  count,
  min_difficulty,
  max_difficulty,
  include_tags,
  exclude_tags
) VALUES (
  'blueprint-uuid',
  1,
  'signs-and-signals',
  5,                    -- 5 questions (18% of 30)
  1,                    -- Min difficulty
  4,                    -- Max difficulty
  ['dmv:signs', 'dmv:signals'],  -- Required tags
  []                    -- Excluded tags
);
```

### Selection Logic

The exam system selects questions by:

1. **Skill Matching**: Questions must match the rule's skill
2. **Difficulty Range**: Questions within min/max difficulty
3. **Tag Filtering**: Questions must include required tags
4. **Status Check**: Only approved questions are eligible
5. **Random Selection**: From eligible pool, select required count

## E2E Testing

### Test Coverage

The E2E test suite validates:

- **Blueprint Creation**: Ensures active blueprint exists
- **Fail Scenario**: Tests failing with ~50% correct answers
- **Pass Scenario**: Tests passing with 100% correct answers
- **Certificate Eligibility**: Verifies passing enables certificate
- **Rule Validation**: Checks blueprint rule structure

### Running Tests

```bash
# Run final exam tests
npx playwright test tests/e2e/final-exam.spec.ts

# Run with UI
npx playwright test tests/e2e/final-exam.spec.ts --ui
```

### Test Scenarios

1. **Fail Flow**: Student takes exam, answers ~50% correctly, fails
2. **Pass Flow**: Student retakes exam, answers all correctly, passes
3. **Certificate Check**: Verifies passing exam enables certificate eligibility

## Local Development

### Setup

```bash
# Ensure environment is configured
cp .env.example .env.local
# Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

# Seed the final exam
npm run seed:final

# Verify everything is working
npm run seed:final:verify

# Run E2E tests
npx playwright test tests/e2e/final-exam.spec.ts
```

### Troubleshooting

#### Common Issues

1. **Missing Questions**: Run `npm run seed:final` to generate missing questions
2. **Blueprint Not Found**: Check if active blueprint exists in database
3. **Translation Errors**: Verify Spanish translations are properly formatted
4. **Rule Mismatch**: Ensure blueprint rules match question bank skills

#### Debug Commands

```bash
# Check question bank status
npm run seed:verify

# Validate blueprint structure
npm run seed:final:verify

# Check jurisdiction config
psql $DATABASE_URL -c "SELECT * FROM jurisdiction_configs WHERE jurisdiction_id = (SELECT id FROM jurisdictions WHERE code = 'CA');"
```

## Production Deployment

### CI/CD Integration

The final exam system integrates with CI/CD:

1. **Pre-deployment**: Run `npm run seed:final:verify` to ensure readiness
2. **Post-deployment**: Run `npm run seed:final` to update blueprints
3. **Monitoring**: Check question coverage and blueprint status

### Monitoring

Key metrics to monitor:

- **Question Coverage**: Ensure sufficient questions per skill
- **Blueprint Status**: Verify active blueprint exists
- **Pass Rates**: Track actual vs expected pass rates
- **Translation Quality**: Monitor Spanish question quality

### Rollback Strategy

If issues arise:

1. **Deactivate Blueprint**: Set `is_active = false` on current blueprint
2. **Restore Previous**: Reactivate previous blueprint if available
3. **Regenerate**: Run `npm run seed:final` to create new blueprint
4. **Verify**: Run `npm run seed:final:verify` to confirm fix

## API Integration

### Exam Start

```typescript
// Start final exam
const response = await fetch("/api/exam/start", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    j_code: "CA",
    course_code: "DE-ONLINE",
    mode: "final",
  }),
});

const { attemptId, items } = await response.json();
```

### Exam Completion

```typescript
// Complete final exam
const response = await fetch("/api/exam/complete", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    attemptId: "attempt-uuid",
    answers: [
      { item_no: 1, answer: "A" },
      { item_no: 2, answer: "B" },
      // ... all answers
    ],
  }),
});

const { passed, score, total } = await response.json();
```

### Certificate Status

```typescript
// Check certificate eligibility
const response = await fetch(
  "/api/certificates/status?user_id=user-uuid&j_code=CA&course_code=DE-ONLINE",
);
const { eligible, status } = await response.json();
```

## Future Enhancements

### Planned Features

1. **Adaptive Difficulty**: Adjust question difficulty based on student performance
2. **Skill Analytics**: Track performance by skill area
3. **Question Rotation**: Prevent question memorization
4. **Time Limits**: Add configurable time limits per question
5. **Review Mode**: Allow students to review incorrect answers

### Configuration Extensions

1. **Custom Skills**: Allow jurisdiction-specific skill definitions
2. **Dynamic Weights**: Adjust skill weights based on curriculum changes
3. **Seasonal Content**: Include weather/season-specific questions
4. **Regional Variations**: Support state-specific traffic laws
