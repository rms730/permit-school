# Adding a New State

This guide walks through the process of adding a new jurisdiction (state) to the permit-school platform. The platform is designed to be multi-state ready, so adding a new state requires no code changes - only database configuration and optional content ingestion.

## Prerequisites

- Admin access to the platform
- Jurisdiction-specific requirements (exam questions, pass percentage, seat time, etc.)
- Stripe price IDs for course billing (optional)
- Course content and questions (optional)

## Step-by-Step Process

### 1. Create Jurisdiction Record

First, add the jurisdiction to the `jurisdictions` table:

```sql
INSERT INTO public.jurisdictions (code, name) 
VALUES ('TX', 'Texas');
```

**Required fields:**
- `code`: Two-letter state code (e.g., 'TX', 'NY', 'FL')
- `name`: Full state name

### 2. Add Jurisdiction Configuration

Configure the jurisdiction-specific rules using the admin interface:

1. Visit `/admin/jurisdictions`
2. Click "Add Config" for your new jurisdiction
3. Fill in the required configuration:

   **Required Settings:**
   - **Final Exam Questions**: Number of questions in final exam
   - **Pass Percentage**: Minimum score to pass (0.1 to 1.0, e.g., 0.8 = 80%)
   - **Seat Time Required**: Minimum study time in minutes
   - **Certificate Prefix**: Prefix for certificate numbers (e.g., 'TX')

   **Optional Settings:**
   - **Disclaimer**: Legal disclaimer for the course
   - **Support Email**: Contact email for support
   - **Terms URL**: Link to terms of service
   - **Privacy URL**: Link to privacy policy

### 3. Add Course(s)

Create course records for the jurisdiction:

```sql
INSERT INTO public.courses (code, title, jurisdiction_id) 
VALUES (
  'DE-ONLINE-TX', 
  'Texas Driver Education Online Course',
  (SELECT id FROM public.jurisdictions WHERE code = 'TX')
);
```

**Required fields:**
- `code`: Unique course code
- `title`: Course title
- `jurisdiction_id`: Reference to the jurisdiction

### 4. Configure Pricing (Optional)

If you want to charge for the course:

1. Visit `/admin/pricing`
2. Find your course in the list
3. Click "Manage Pricing"
4. Add Stripe price ID(s)
5. Toggle prices active/inactive as needed

**Note:** If no pricing is configured, the system falls back to the environment variable `STRIPE_PRICE_ID`.

### 5. Add Course Content (Optional)

If you have jurisdiction-specific content:

1. **Units**: Add course units with titles, minutes, and objectives
2. **Content Chunks**: Ingest jurisdiction-specific content using the existing ingestion tools
3. **Questions**: Add jurisdiction-specific questions to the question bank

**Content Structure:**
- Units are organized by `unit_no` (order)
- Content chunks are mapped to units via `unit_chunks` table
- Questions reference the `course_id`

### 6. Configure Question Bank & Blueprints (Optional)

**Question Bank Management:**
- Visit `/admin/questions` to manage jurisdiction-specific questions
- Questions are course-scoped and can be tagged for organization
- Use status workflow: draft → approved → archived
- Import/export questions via CSV or JSON formats

**Exam Blueprints:**
- Visit `/admin/blueprints` to create exam blueprints
- Blueprints are per-course and require approved questions
- Configure rules for skill distribution, difficulty ranges, and tag inclusion/exclusion
- Only one active blueprint per course (others are automatically deactivated)

**Skills and Tags:**
- Skills are course-scoped and should match your jurisdiction's requirements
- Tags help organize questions by topic, source, or difficulty
- Both skills and tags are used in blueprint rule configuration

### 7. Test the Implementation

Verify everything works correctly:

1. **Public Catalog**: Visit `/courses` - your jurisdiction should appear
2. **Course Access**: Visit `/course/[j_code]/[course_code]` - course should be accessible
3. **Tutor**: Test jurisdiction-specific questions via the tutor
4. **Exam System**: Verify exam eligibility and final exam work with new config
5. **Billing**: Test checkout flow with configured pricing
6. **Question Bank**: Test question creation and approval workflow
7. **Blueprints**: Test blueprint creation and activation
8. **Analytics**: Verify item analytics are computed correctly

### 7. Gate Features (Optional)

If you want to restrict certain features:

1. **Content Access**: Use the existing entitlement system
2. **Exam Eligibility**: Leverage the seat-time and entitlement requirements
3. **Certificate Issuance**: Use the existing certificate workflow

## Configuration Examples

### Texas Configuration

```sql
-- Jurisdiction
INSERT INTO public.jurisdictions (code, name) VALUES ('TX', 'Texas');

-- Configuration
INSERT INTO public.jurisdiction_configs (
  jurisdiction_id,
  final_exam_questions,
  final_exam_pass_pct,
  seat_time_required_minutes,
  certificate_prefix,
  disclaimer,
  support_email
) VALUES (
  (SELECT id FROM public.jurisdictions WHERE code = 'TX'),
  25,                    -- 25 questions
  0.75,                  -- 75% pass rate
  180,                   -- 180 minutes required
  'TX',                  -- TX certificate prefix
  'This course meets Texas DPS requirements for driver education.',
  'support@permit-school.com'
);

-- Course
INSERT INTO public.courses (code, title, jurisdiction_id) VALUES (
  'DE-ONLINE-TX',
  'Texas Driver Education Online Course',
  (SELECT id FROM public.jurisdictions WHERE code = 'TX')
);
```

### Florida Configuration

```sql
-- Jurisdiction
INSERT INTO public.jurisdictions (code, name) VALUES ('FL', 'Florida');

-- Configuration
INSERT INTO public.jurisdiction_configs (
  jurisdiction_id,
  final_exam_questions,
  final_exam_pass_pct,
  seat_time_required_minutes,
  certificate_prefix,
  disclaimer,
  support_email
) VALUES (
  (SELECT id FROM public.jurisdictions WHERE code = 'FL'),
  40,                    -- 40 questions
  0.8,                   -- 80% pass rate
  200,                   -- 200 minutes required
  'FL',                  -- FL certificate prefix
  'This course meets Florida DHSMV requirements for driver education.',
  'support@permit-school.com'
);

-- Course
INSERT INTO public.courses (code, title, jurisdiction_id) VALUES (
  'DE-ONLINE-FL',
  'Florida Driver Education Online Course',
  (SELECT id FROM public.jurisdictions WHERE code = 'FL')
);
```

## Validation Checklist

Before going live with a new state:

- [ ] Jurisdiction record created
- [ ] Configuration added with correct values
- [ ] Course(s) created and linked to jurisdiction
- [ ] Pricing configured (if applicable)
- [ ] Content ingested (if applicable)
- [ ] Question bank populated with jurisdiction-specific questions (if applicable)
- [ ] Exam blueprints configured (if applicable)
- [ ] Public catalog shows the jurisdiction
- [ ] Course pages are accessible
- [ ] Tutor responds to jurisdiction-specific queries
- [ ] Exam eligibility works with new requirements
- [ ] Final exam uses correct question count and pass threshold
- [ ] Certificate numbering uses correct prefix
- [ ] Billing checkout works (if pricing configured)
- [ ] Question analytics are computed correctly

## Troubleshooting

### Common Issues

1. **Course not appearing in catalog**: Check that `billing_prices` has active records
2. **Exam eligibility failing**: Verify seat time requirement in jurisdiction config
3. **Certificate numbering wrong**: Check certificate prefix in jurisdiction config
4. **Pricing not working**: Ensure `billing_prices` has active=true records

### Debug Queries

```sql
-- Check jurisdiction configuration
SELECT * FROM public.jurisdiction_configs 
WHERE jurisdiction_id = (SELECT id FROM public.jurisdictions WHERE code = 'TX');

-- Check course pricing
SELECT * FROM public.billing_prices 
WHERE course_id = (SELECT id FROM public.courses WHERE code = 'DE-ONLINE-TX');

-- Check course catalog view
SELECT * FROM public.v_course_catalog WHERE j_code = 'TX';
```

## Next Steps

After adding a new state:

1. **Monitor Usage**: Check admin logs for any issues
2. **Gather Feedback**: Collect user feedback on jurisdiction-specific content
3. **Iterate**: Adjust configuration based on real-world usage
4. **Scale**: Consider adding more courses or jurisdictions

The platform is designed to scale horizontally - you can add as many jurisdictions as needed without code changes.
