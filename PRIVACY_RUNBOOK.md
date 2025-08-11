# Privacy Runbook

This document provides operational procedures for handling Data Subject Access Rights (DSAR) requests and privacy-related operations in the Permit School platform.

## DSAR Procedures

### Data Export Requests

### Notifications Privacy

The notification system is designed to be privacy-preserving and compliant with data protection regulations:

#### Data Minimization
- **Notifications contain only minimal context**: course IDs, milestone numbers, completion status
- **No sensitive PII**: No raw answers, personal details, or sensitive information
- **Contextual data**: Only what's necessary to understand the notification

#### Notification Types & Data
- **Seat time milestones**: `{ course_id, minutes }` - Only course and milestone threshold
- **Quiz completions**: `{ course_id, unit_id }` - Course and unit context only
- **Final exam results**: `{ course_id, score }` - Course and pass/fail status
- **Certificate issuance**: `{ course_id, certificate_number }` - Course and certificate number
- **Guardian consent**: `{ course_id, guardian_name }` - Course and guardian name (already consented)
- **Weekly digest**: `{ students, courses, week_ending }` - Aggregated progress summary

#### Guardian Access Control
- **Linked guardians only**: Notifications only sent to guardians with active links
- **Student context**: Guardian notifications include `student_id` for context
- **Read-only access**: Guardians can only view notifications, not modify data
- **RLS enforcement**: All access controlled via existing Row Level Security policies

#### Data Retention
- **Notifications retained**: Indefinitely for audit and user experience
- **Read status**: Tracked for user experience (read/unread badges)
- **No sensitive data**: No raw answers or PII beyond existing policy

#### Compliance Notes
- **GDPR Article 25**: Privacy by design - minimal data collection
- **COPPA**: Guardian notifications for minors include only consented information
- **FERPA**: Educational records remain protected by existing access controls
- **Audit trail**: All notifications logged for compliance verification
#### Manual Export Execution
If the automated export system fails, follow these steps:

1. **Identify the Request**
   ```sql
   SELECT * FROM data_exports 
   WHERE status = 'error' OR status = 'pending' 
   ORDER BY created_at DESC;
   ```

2. **Gather User Data**
   ```sql
   -- Get user profile
   SELECT * FROM student_profiles WHERE user_id = 'USER_UUID';
   
   -- Get enrollments
   SELECT e.*, c.code as course_code, c.name as course_name, j.code as jurisdiction_code
   FROM enrollments e
   JOIN courses c ON e.course_id = c.id
   JOIN jurisdictions j ON c.jurisdiction_id = j.id
   WHERE e.user_id = 'USER_UUID';
   
   -- Get seat time
   SELECT * FROM seat_time WHERE user_id = 'USER_UUID';
   
   -- Get attempts (metadata only)
   SELECT id, unit_id, score, completed_at, status 
   FROM attempts WHERE user_id = 'USER_UUID';
   
   -- Get certificates
   SELECT id, certificate_number, status, issued_at, course_id 
   FROM certificates WHERE user_id = 'USER_UUID';
   ```

3. **Generate Certificate URLs**
   ```sql
   -- For each certificate, generate a signed URL
   -- This should be done programmatically using the storage API
   ```

4. **Create Export Bundle**
   - Compile all data into a JSON file
   - Include certificate download URLs
   - Create a ZIP file with the JSON and README
   - Upload to the `exports` storage bucket

5. **Update Export Record**
   ```sql
   UPDATE data_exports 
   SET status = 'ready', 
       bundle_path = 'export_USER_UUID_TIMESTAMP.zip',
       updated_at = now()
   WHERE id = EXPORT_ID;
   ```

#### Export Cleanup
Exports expire after 7 days. Clean up expired exports:

```sql
-- Find expired exports
SELECT * FROM data_exports 
WHERE expires_at < now() AND status = 'ready';

-- Delete from storage (programmatic)
-- Delete from database
DELETE FROM data_exports 
WHERE expires_at < now() AND status = 'ready';
```

### Account Deletion Requests

#### Manual Deletion Execution
If the automated deletion system fails:

1. **Verify Confirmation**
   ```sql
   SELECT * FROM deletion_requests 
   WHERE status = 'confirmed' 
   AND confirmed_at < now() - INTERVAL '7 days';
   ```

2. **Execute Deletion**
   ```sql
   -- Use the database function
   SELECT execute_user_deletion('USER_UUID');
   ```

3. **Manual Auth User Deletion**
   ```sql
   -- This must be done via Supabase Admin API
   -- Use the admin client to delete the auth user
   ```

4. **Update Deletion Record**
   ```sql
   UPDATE deletion_requests 
   SET status = 'executed', 
       executed_at = now()
   WHERE id = DELETION_ID;
   ```

#### Deletion Verification
After deletion, verify the user's data has been removed:

```sql
-- Check that user data is gone
SELECT COUNT(*) FROM student_profiles WHERE user_id = 'USER_UUID';
SELECT COUNT(*) FROM enrollments WHERE user_id = 'USER_UUID';
SELECT COUNT(*) FROM seat_time WHERE user_id = 'USER_UUID';
SELECT COUNT(*) FROM attempts WHERE user_id = 'USER_UUID';

-- Verify certificates are voided, not deleted
SELECT certificate_number, status FROM certificates WHERE user_id = 'USER_UUID';
-- Should show status = 'void'
```

## What We Delete vs Retain

### Deleted Data
- Personal profile information (name, address, phone, etc.)
- Course enrollments and progress
- Quiz attempts and scores
- Seat time records
- Account settings and preferences
- Data export requests
- Deletion request records

### Retained Data
- **Certificate numbers**: Retained for compliance and verification purposes
- **Audit logs**: All deletion activities are logged for compliance
- **Billing records**: May be retained for tax/accounting purposes (consult legal)

### Certificate Handling
- Certificate numbers are **never deleted**
- Certificate PDFs are **deleted** from storage
- Certificate records are marked as `void` status
- This preserves the certificate number for compliance while removing personal data

## Audit Key Management

### Current Audit Key
The audit key is stored in the database GUC setting `app.audit_key`. To check the current key:

```sql
SELECT current_setting('app.audit_key', true);
```

### Rotating the Audit Key

**WARNING**: Rotating the audit key will invalidate all existing audit signatures. This should only be done in emergency situations.

1. **Generate New Key**
   ```bash
   # Generate a new 32-byte key
   openssl rand -hex 32
   ```

2. **Update Database**
   ```sql
   -- Set the new key
   SELECT set_config('app.audit_key', 'NEW_KEY_HERE', true);
   ```

3. **Verify Update**
   ```sql
   SELECT current_setting('app.audit_key', true);
   ```

4. **Test Signature Generation**
   ```sql
   -- Test that new signatures work
   SELECT log_audit('TEST', 'test_table', 'test_id', '{}'::jsonb, '{}'::jsonb);
   ```

### Emergency Key Rotation
If the audit key is compromised:

1. **Immediate Actions**
   - Generate new key immediately
   - Update database setting
   - Document the incident

2. **Verification**
   - Verify new signatures are being generated
   - Check that old signatures are marked as invalid
   - Monitor for any issues

3. **Documentation**
   - Record the incident in the incident log
   - Update this runbook with lessons learned
   - Review access controls

## Compliance Monitoring

### Regular Checks
Perform these checks monthly:

1. **Export Request Monitoring**
   ```sql
   -- Check for stuck exports
   SELECT COUNT(*) FROM data_exports 
   WHERE status = 'pending' AND created_at < now() - INTERVAL '1 hour';
   ```

2. **Deletion Request Monitoring**
   ```sql
   -- Check for stuck deletions
   SELECT COUNT(*) FROM deletion_requests 
   WHERE status = 'confirmed' AND confirmed_at < now() - INTERVAL '8 days';
   ```

3. **Audit Log Verification**
   ```sql
   -- Check for invalid signatures
   SELECT COUNT(*) FROM audit_logs 
   WHERE NOT verify_audit_signature(id);
   ```

### Incident Response
If DSAR processing fails:

1. **Immediate Response**
   - Acknowledge the request within 24 hours
   - Provide estimated timeline for resolution
   - Escalate to technical team

2. **Investigation**
   - Check system logs for errors
   - Verify database connectivity
   - Test background worker processes

3. **Resolution**
   - Execute manual procedures if needed
   - Update affected records
   - Notify user of completion

4. **Documentation**
   - Record incident details
   - Update procedures if needed
   - Review for systemic issues

## Contact Information

### Privacy Officer
- Email: privacy@permitschool.com
- Phone: [REDACTED]
- Response time: 24 hours

### Technical Escalation
- Email: tech-support@permitschool.com
- Phone: [REDACTED]
- Response time: 4 hours for critical issues

### Legal Team
- Email: legal@permitschool.com
- Phone: [REDACTED]
- Response time: 48 hours

## Regulatory Compliance

### CCPA/CPRA Compliance
- Right to Know: Implemented via data export
- Right to Delete: Implemented via account deletion
- Right to Opt-Out: Not applicable (no data sales)
- Response time: 45 days (with 45-day extension if needed)

### GDPR Compliance
- Right of Access: Implemented via data export
- Right to Erasure: Implemented via account deletion
- Right to Portability: Implemented via data export
- Response time: 30 days (with 30-day extension if needed)

### Record Keeping
- All DSAR requests are logged in audit_logs
- Deletion requests are tracked in deletion_requests table
- Export requests are tracked in data_exports table
- Retention: 3 years for compliance records
