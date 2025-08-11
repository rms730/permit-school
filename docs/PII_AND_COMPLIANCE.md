# PII and Compliance Guide

This document outlines how the permit-school platform handles Personally Identifiable Information (PII), implements security measures, and maintains compliance with privacy regulations.

## PII Storage Locations

### Primary PII Storage: `student_profiles` Table

All student PII is stored in the `student_profiles` table with the following fields:

- **Names**: `first_name`, `last_name`, `middle_name`
- **Date of Birth**: `dob` (for age verification and guardian requirements)
- **Contact**: `phone`
- **Address**: `address_line1`, `address_line2`, `city`, `state`, `postal_code`
- **Guardian Info**: `guardian_name`, `guardian_email`, `guardian_phone` (for minors)
- **Consent Timestamps**: `terms_accepted_at`, `privacy_accepted_at`

### Consent Audit Trail: `consents` Table

E-signature events are recorded with context:

- **Student ID**: Links to the student
- **Consent Type**: `terms`, `privacy`, or `guardian`
- **Timestamp**: `signed_at`
- **Context**: `ip`, `user_agent`, `payload` (JSON for additional data)

### Enrollment Data: `enrollments` Table

Course enrollment information (minimal PII):

- **Student ID**: Links to auth.users
- **Course ID**: Links to courses
- **Status**: `active`, `canceled`, `completed`
- **Timestamps**: `started_at`, `completed_at`

## Row-Level Security (RLS) Policies

### student_profiles Table

```sql
-- Users can only access their own profile
CREATE POLICY student_profiles_select_own
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY student_profiles_upsert_own
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY student_profiles_update_own
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can read all profiles for compliance
CREATE POLICY student_profiles_admin_read
  ON public.student_profiles FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

### consents Table

```sql
-- Users can only access their own consents
CREATE POLICY consents_select_own
  ON public.consents FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY consents_insert_own
  ON public.consents FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Admins can read all consents for audit
CREATE POLICY consents_admin_read
  ON public.consents FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

### enrollments Table

```sql
-- Users can only access their own enrollments
CREATE POLICY enrollments_select_own
  ON public.enrollments FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY enrollments_upsert_own
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY enrollments_update_own
  ON public.enrollments FOR UPDATE
  USING (auth.uid() = student_id);

-- Admins have full access for management
CREATE POLICY enrollments_admin_all
  ON public.enrollments FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

## Logging Do's and Don'ts

### ✅ DO Log

- **User actions**: Login, logout, course enrollment, exam attempts
- **System events**: Certificate issuance, subscription changes, billing events
- **Error conditions**: API failures, validation errors, security violations
- **Performance metrics**: Response times, database query performance
- **Audit events**: Admin actions, data exports, configuration changes

### ❌ DON'T Log

- **PII fields**: Names, addresses, phone numbers, DOB, guardian information
- **Sensitive data**: Passwords, API keys, session tokens
- **Personal content**: Student answers, private messages, file contents
- **Financial data**: Credit card numbers, bank account details

### PII Scrubbing in Sentry

The platform automatically scrubs PII from error reports:

```typescript
// web/sentry.server.config.ts
export const sentryOptions = {
  beforeSend(event) {
    const redact = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      const pii = [
        'first_name', 'last_name', 'middle_name', 'dob', 'phone',
        'address_line1', 'address_line2', 'city', 'state', 'postal_code',
        'guardian_name', 'guardian_email', 'guardian_phone'
      ];
      for (const k of pii) if (k in obj) obj[k] = '[redacted]';
      Object.values(obj).forEach(redact);
    };
    redact(event.extra);
    redact(event.request);
    return event;
  },
};
```

## Minor/Guardian Handling

### Age Detection

The platform automatically calculates age from the date of birth:

```typescript
const dob = new Date(profile.dob);
const today = new Date();
const age = today.getFullYear() - dob.getFullYear();
const monthDiff = today.getMonth() - dob.getMonth();
const isMinor = age < 18 || (age === 18 && monthDiff < 0) || 
                (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate());
```

### Guardian Requirements

For students under 18:

1. **Required Information**: Guardian name, email, and phone
2. **Consent Recording**: Guardian consent is recorded with IP and user agent
3. **Annual Renewal**: Guardian consent expires after 1 year
4. **Exam Blocking**: Students cannot take exams without valid guardian consent
5. **Certificate Blocking**: Certificates cannot be issued without guardian consent

### Guardian Consent Validation

```sql
-- Check for recent guardian consent (within last year)
SELECT signed_at 
FROM consents 
WHERE student_id = $1 
  AND consent_type = 'guardian' 
  AND signed_at >= NOW() - INTERVAL '1 year'
ORDER BY signed_at DESC 
LIMIT 1;
```

## Compliance Requirements

### Data Retention

- **Student Profiles**: Retained for 7 years after last activity (regulatory requirement)
- **Consent Records**: Retained indefinitely for audit purposes
- **Enrollment Data**: Retained for 7 years after course completion
- **Certificate Records**: Retained indefinitely for verification

### Data Export Rights

Students can request their data export through:

1. **Profile Data**: All profile fields (names, address, etc.)
2. **Consent History**: All consent events with timestamps
3. **Enrollment History**: Course enrollments and completion status
4. **Progress Data**: Seat time, quiz scores, exam attempts
5. **Certificate Data**: Certificate numbers and issue dates

### Data Deletion Rights

Students can request data deletion with the following considerations:

- **Active Enrollments**: Cannot delete while actively enrolled
- **Certificate Records**: Cannot delete issued certificates (regulatory requirement)
- **Audit Trail**: Consent records may be retained for compliance
- **Anonymization**: Instead of deletion, data may be anonymized

### Privacy Policy Requirements

The platform's privacy policy must include:

1. **Data Collection**: What PII is collected and why
2. **Data Usage**: How PII is used for course delivery and compliance
3. **Data Sharing**: No PII is shared with third parties except as required by law
4. **Data Security**: RLS policies, encryption, access controls
5. **User Rights**: Access, correction, deletion, and portability rights
6. **Contact Information**: How to exercise privacy rights

## Security Best Practices

### API Security

- **Authentication**: All API endpoints require valid JWT tokens
- **Authorization**: RLS policies enforce data access controls
- **Input Validation**: All user inputs are validated and sanitized
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **HTTPS Only**: All communications use TLS encryption

### Database Security

- **Connection Encryption**: All database connections use SSL/TLS
- **Query Logging**: Database queries are logged for security monitoring
- **Backup Encryption**: All backups are encrypted at rest
- **Access Logging**: Database access is logged for audit purposes

### Application Security

- **Dependency Scanning**: Regular security scans of npm dependencies
- **Code Review**: All code changes require security review
- **Environment Isolation**: Development, staging, and production environments are isolated
- **Secret Management**: All secrets are stored in environment variables, never in code

## Monitoring and Alerting

### Security Monitoring

- **Failed Login Attempts**: Alert on multiple failed authentication attempts
- **Unusual Access Patterns**: Monitor for unusual data access patterns
- **Admin Actions**: Log and alert on all admin actions
- **Data Export Requests**: Monitor and log data export activities

### Compliance Monitoring

- **Consent Expiration**: Alert when guardian consents are approaching expiration
- **Profile Completeness**: Monitor for incomplete profiles that may affect compliance
- **Certificate Issuance**: Log all certificate issuance for audit purposes
- **Data Retention**: Monitor for data approaching retention limits

## Incident Response

### Data Breach Response

1. **Immediate Response**: Isolate affected systems and assess scope
2. **Notification**: Notify affected users within 72 hours
3. **Investigation**: Conduct thorough investigation of breach cause
4. **Remediation**: Implement fixes to prevent future breaches
5. **Documentation**: Document incident and response for compliance

### Privacy Violation Response

1. **Assessment**: Determine nature and scope of privacy violation
2. **Correction**: Correct any incorrect or incomplete data
3. **Notification**: Notify affected users of correction
4. **Prevention**: Implement measures to prevent future violations
5. **Documentation**: Document violation and response actions

## Regulatory Compliance

### FERPA (Family Educational Rights and Privacy Act)

- **Student Records**: All student data is treated as educational records
- **Parent Rights**: Parents of minor students have access rights
- **Directory Information**: No directory information is published
- **Third-Party Disclosure**: No PII disclosed to third parties without consent

### COPPA (Children's Online Privacy Protection Act)

- **Age Verification**: Platform verifies age before collecting PII
- **Parental Consent**: Guardian consent required for students under 13
- **Data Minimization**: Only necessary PII is collected
- **Parental Rights**: Parents can review and delete child's data

### State-Specific Requirements

- **California**: CCPA compliance for California residents
- **Texas**: Texas privacy laws when Texas courses are added
- **Other States**: Additional state requirements as platform expands

## Audit and Reporting

### Compliance Reports

The platform generates compliance reports for:

- **Student Progress**: Seat time, quiz scores, exam results
- **Certificate Issuance**: Certificate numbers and issue dates
- **Consent Records**: All consent events with timestamps
- **Admin Actions**: All administrative actions for audit

### Data Access Logs

All data access is logged for audit purposes:

- **User Access**: When users access their own data
- **Admin Access**: When admins access student data
- **API Access**: All API calls with user context
- **Export Activities**: All data export requests

### Regular Audits

The platform undergoes regular security and compliance audits:

- **Annual Security Audit**: Comprehensive security assessment
- **Privacy Impact Assessment**: Regular PIA updates
- **Penetration Testing**: Regular security testing
- **Compliance Review**: Annual compliance verification
