# Dual Product Lines Implementation

This document outlines the implementation of support for two product lines in the permit-school codebase:

1. **Driver Permits** (existing product)
2. **College Test Prep** (new product - ACT and SAT)

## Architecture Overview

The implementation introduces a **program-aware architecture** that cleanly supports both products without duplicating the project. Key architectural decisions:

- **Programs table**: Classifies courses as either `permit` or `test_prep`
- **Standardized tests**: Supports ACT, SAT, and extensible to GMAT/GRE
- **Sectioned attempts**: For standardized tests with multiple sections and timing
- **Outcomes decoupling**: Certificates for permits, score reports for test prep
- **Scaled scoring**: Raw-to-scaled score conversion using lookup tables

## Database Schema Changes

### New Tables

1. **`programs`** - Product line classification
   - `code`: 'PERMIT', 'ACT', 'SAT'
   - `kind`: 'permit' or 'test_prep'
   - `title_i18n`: Localized titles

2. **`standardized_tests`** - Test definitions
   - `code`: 'ACT', 'SAT'
   - `metadata`: Test-specific information and disclaimers

3. **`test_sections`** - Test sections (e.g., ACT: English, Math, Reading, Science)
   - `order_no`: Section sequence
   - `time_limit_sec`: Section time limits

4. **`score_scales`** - Raw-to-scaled score conversion
   - `section_id`: NULL for overall/composite scores
   - `raw_score` → `scaled_score` mapping

5. **`attempt_sections`** - Section-level attempt tracking
   - Links attempts to test sections
   - Tracks timing and scores per section

6. **`outcomes`** - Unified outcome system
   - `kind`: 'certificate', 'score_report', 'badge'
   - `payload`: JSON data specific to outcome type

### Modified Tables

1. **`courses`** - Added `program_id` and `locale`
2. **`attempts`** - Added `test_id`, `kind`, `scaled_score`, `raw_score`
3. **`attempt_items`** - Added `attempt_section_id`
4. **`exam_blueprints`** - Added `test_id` and `time_limit_sec`
5. **`exam_blueprint_rules`** - Added `section_id` and `tags_any`
6. **`question_bank`** - Added `locale`, `stem_i18n`, `explanation_i18n`

## API Endpoints

### New Prep Endpoints

- `POST /api/prep/attempt/create` - Creates sectioned attempts
- `POST /api/prep/attempt/submit` - Grades attempts and generates score reports
- `GET /api/prep/score-report/[attemptId]` - Retrieves detailed score reports

### Modified Endpoints

- `POST /api/certificates/[attemptId]` - Now only works for permit programs
- Existing exam endpoints remain unchanged for backward compatibility

### Testkit Endpoints

- `POST /api/testkit/programs/seed` - Seeds programs and test prep courses
- `POST /api/testkit/prep/seed-tests` - Seeds standardized tests, sections, and score scales
- `POST /api/testkit/prep/seed-blueprints` - Seeds exam blueprints and sample questions

## Marketing Pages

### `/permits` - Driver Permits Landing
- Hero section with permit-specific messaging
- Features: DMV-approved content, flexible learning, progress tracking
- Available states: California (active), Texas (coming soon)
- Clear CTAs for signup and login

### `/prep` - College Test Prep Landing
- Hero section with ACT/SAT focus
- Test comparison: ACT (1-36) vs SAT (400-1600)
- Features: Adaptive practice, detailed reports, personalized plans
- Practice types: Mock tests, section practice, diagnostics
- Trademark disclaimers for ACT® and SAT®

## Scoring System

### ACT Scoring
- **Sections**: English, Math, Reading, Science
- **Section scores**: 1-36 (raw → scaled conversion)
- **Composite**: Average of section scores, rounded
- **Timing**: 45m, 60m, 35m, 35m respectively

### SAT Scoring
- **Sections**: Reading & Writing, Math
- **Section scores**: 200-800 (raw → scaled conversion)
- **Total**: Sum of section scores
- **Timing**: 60m each section

### Score Scales
- Fictional sample mappings for demonstration
- Monotonic raw → scaled conversion
- Separate scales for sections and overall scores
- Extensible for future tests (GMAT, GRE)

## Security & RLS

### Row Level Security Policies
- **Programs, tests, sections, scales**: Public read, admin write
- **Attempt sections**: Owner read/write, admin read
- **Outcomes**: Owner read, admin read/write
- **Updated existing policies** for new schema

### Program Validation
- Certificate generation only for `permit` programs
- Score reports only for `test_prep` programs
- API endpoints validate program type before processing

## Testing

### Playwright E2E Tests
- **`dual-product.spec.ts`** - Comprehensive test suite
- Tests both product marketing pages
- Verifies permit exam → certificate flow
- Verifies ACT/SAT mock → score report flow
- Tests program-specific outcome enforcement
- Validates sectioned attempts with timing

### Test Coverage
- Marketing page rendering
- API endpoint functionality
- Outcome generation and validation
- Error handling for invalid program types
- Section timing and scoring accuracy

## Seeding & Development

### Database Reset
```bash
supabase db reset
```

### Seed Commands
```bash
# Seed programs and courses
curl -XPOST "$BASE_URL/api/testkit/programs/seed" -H "Authorization: Bearer $TESTKIT_TOKEN"

# Seed standardized tests and scales
curl -XPOST "$BASE_URL/api/testkit/prep/seed-tests" -H "Authorization: Bearer $TESTKIT_TOKEN"

# Seed blueprints and questions
curl -XPOST "$BASE_URL/api/testkit/prep/seed-blueprints" -H "Authorization: Bearer $TESTKIT_TOKEN"
```

### Sample Data
- **Programs**: PERMIT, ACT, SAT
- **Courses**: DE-ONLINE (permit), ACT-PREP-101, SAT-PREP-101
- **Tests**: ACT (4 sections), SAT (2 sections)
- **Questions**: 20 sample questions per section
- **Score scales**: Fictional but realistic mappings

## Migration Strategy

### Database Migration
- **Rebuild-friendly**: All changes in existing migration files
- **Idempotent**: Safe to run multiple times
- **Backward compatible**: Existing permit flows unchanged

### Code Migration
- **Minimal changes** to existing permit code
- **Program checks** in key decision points only
- **New prep code** isolated in `/prep` routes
- **Shared infrastructure** (auth, database, UI components)

## Future Extensibility

### Additional Tests
- **GMAT**: Graduate school admissions
- **GRE**: Graduate school admissions
- **LSAT**: Law school admissions
- **MCAT**: Medical school admissions

### Advanced Features
- **Adaptive testing**: Multi-stage adaptivity
- **Proctoring**: Lockdown browsers
- **Analytics**: Detailed performance insights
- **Badges**: Achievement system

## Deployment Notes

### Environment Variables
- No new environment variables required
- Existing auth and database config unchanged

### Dependencies
- No new npm packages required
- Uses existing MUI components
- Leverages existing Supabase setup

### Monitoring
- New API endpoints should be monitored
- Score scale lookups for performance
- Section timing for user experience

## Acceptance Criteria Met

✅ **Schema compiles** with `supabase db reset`  
✅ **Marketing pages** render unique copy and CTAs  
✅ **Permit exams** produce certificates only  
✅ **ACT/SAT mocks** produce score reports only  
✅ **Admin can manage** tests, sections, and scales  
✅ **RLS policies** enforce proper access control  
✅ **Playwright tests** pass for both product lines  

## Files Modified

### Database
- `supabase/migrations/0000_initial_schema.sql`
- `supabase/migrations/0002_curriculum_admin.sql`
- `supabase/migrations/0007_question_bank_admin.sql`
- `supabase/migrations/0008_rls_policies.sql` (new)

### API Routes
- `web/src/app/api/prep/attempt/create/route.ts` (new)
- `web/src/app/api/prep/attempt/submit/route.ts` (new)
- `web/src/app/api/prep/score-report/[attemptId]/route.ts` (new)
- `web/src/app/api/certificates/[attemptId]/route.ts` (new)
- `web/src/app/api/testkit/programs/seed/route.ts` (new)
- `web/src/app/api/testkit/prep/seed-tests/route.ts` (new)
- `web/src/app/api/testkit/prep/seed-blueprints/route.ts` (new)

### Marketing Pages
- `web/src/app/(public)/permits/page.tsx` (new)
- `web/src/app/(public)/prep/page.tsx` (new)

### Tests
- `web/tests/e2e/dual-product.spec.ts` (new)
- `web/tests/e2e/utils/testkit.ts` (updated)

### Documentation
- `DUAL_PRODUCT_IMPLEMENTATION.md` (this file)
