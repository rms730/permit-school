# Seeding (Curriculum + Questions)

**How to run:**
- `npm run seed:unit1` - Seed Unit 1 (Traffic Signs & Rules)
- `npm run seed:unit2` - Seed Unit 2 (Vehicle Control & Safe Maneuvers)
- `npm run seed:verify` - Verify Unit 1
- `npm run seed:verify:unit2` - Verify Unit 2

**Where content lives:**
- `ops/seed/curriculum/CA/DE-ONLINE/units/unit01.{en,es}.json` - Unit 1 curriculum
- `ops/seed/questions/CA/DE-ONLINE/units/unit01.{en,es}.json` - Unit 1 questions
- `ops/seed/curriculum/CA/DE-ONLINE/units/unit02.{en,es}.json` - Unit 2 curriculum
- `ops/seed/questions/CA/DE-ONLINE/units/unit02.{en,es}.json` - Unit 2 questions

**Schemas:** `ops/seed/lib/schema.ts` (Zod)

**Idempotency:** We upsert on `(jurisdiction_id, lang, section_ref)` for content and `(course_id, source_ref)` for questions.

**Env:** Uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` from root `.env.*`.

## Unit Content Overview

### Unit 1: Traffic Signs & Rules
- Traffic signs, signals, and pavement markings
- Right-of-way rules and emergency vehicles
- Speed limits and violations
- Basic traffic laws and regulations

### Unit 2: Vehicle Control & Safe Maneuvers
- Pre-drive safety checks and vehicle setup
- Steering techniques and speed control
- Following distance and scanning techniques
- Basic turns and intersections
- Parking and backing procedures
- Lane changes and merging (SMOG technique)

## Adding New Units

To add Unit 3, 4, etc.:

1. Create JSON files following the same structure:
   - `ops/seed/curriculum/CA/DE-ONLINE/units/unit03.en.json`
   - `ops/seed/curriculum/CA/DE-ONLINE/units/unit03.es.json`
   - `ops/seed/questions/CA/DE-ONLINE/units/unit03.en.json`
   - `ops/seed/questions/CA/DE-ONLINE/units/unit03.es.json`

2. Add npm scripts to package.json:
   ```json
   "seed:unit3": "tsx ops/seed/seed-unit.ts --unit=03 --lang=en,es --j=CA --course=DE-ONLINE",
   "seed:verify:unit3": "tsx ops/seed/verify-seed.ts --unit=03 --lang=en,es --j=CA --course=DE-ONLINE"
   ```

3. Run: `npm run seed:unit3`

## Adding New Jurisdictions

To add TX, ACT/SAT, etc.:

1. Create new directory structure:
   - `ops/seed/curriculum/TX/DE-ONLINE/units/`
   - `ops/seed/questions/TX/DE-ONLINE/units/`

2. Update schemas to support new jurisdiction codes

3. Modify seed scripts to handle multiple jurisdictions
