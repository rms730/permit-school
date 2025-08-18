---
title: "DMV Reporting & Compliance"
owner: "Operations"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/RUNBOOKS.md>
  - </docs/FULFILLMENT_CA.md>
---

# DMV Reporting & Compliance

**Purpose & Outcome**  
Complete operational guide for DMV reporting, regulatory compliance, and certificate submission procedures. This ensures timely, accurate, and compliant reporting to regulatory bodies while maintaining data integrity and audit trails.

## Prerequisites

- ✅ Admin access to compliance dashboard
- ✅ DMV reporting credentials
- ✅ Certificate generation system access
- ✅ Audit log access

## Regulatory Framework

### California DMV Requirements

**Certificate Requirements**:

- Unique certificate number format: `CA-YYYY-XXXXXX`
- Student information: Name, DOB, completion date
- Course information: Course ID, completion time
- Instructor information: Digital signature
- Tamper-evident features: QR code, digital signature

**Reporting Requirements**:

- Monthly submission deadline: 15th of following month
- File format: CSV with specific schema
- Submission method: Secure FTP or web portal
- Verification: Confirmation receipt required

### Texas DPS Requirements

**Certificate Requirements**:

- Unique certificate number format: `TX-YYYY-XXXXXX`
- Student information: Name, DOB, completion date
- Course information: Course ID, completion time
- Additional requirements: Parent/guardian signature for minors

**Reporting Requirements**:

- Monthly submission deadline: 20th of following month
- File format: XML with specific schema
- Submission method: Secure web portal
- Verification: Email confirmation required

## Certificate Generation

### Certificate Number Generation

**Database Function**:

```sql
-- Certificate number generation
SELECT make_certificate_number('CA', '2025');
-- Returns: CA-2025-000001

-- Verify uniqueness
SELECT COUNT(*) FROM certificates
WHERE certificate_number = 'CA-2025-000001';
```

**Certificate Creation Process**:

```bash
# 1. Generate certificate number
# Database function: make_certificate_number(jurisdiction, year)

# 2. Create certificate record
INSERT INTO certificates (
  certificate_number,
  user_id,
  course_id,
  jurisdiction,
  completion_date,
  status
) VALUES (
  'CA-2025-000001',
  'user-uuid',
  'course-uuid',
  'CA',
  NOW(),
  'issued'
);

# 3. Generate PDF certificate
# API endpoint: /api/certificates/[number]
```

### PDF Certificate Generation

**Certificate Content**:

```typescript
interface CertificateData {
  certificateNumber: string;
  studentName: string;
  studentDOB: string;
  completionDate: string;
  courseName: string;
  jurisdiction: string;
  instructorSignature: string;
  qrCode: string;
  digitalSignature: string;
}
```

**PDF Generation Process**:

```bash
# 1. Fetch certificate data
SELECT * FROM certificates WHERE certificate_number = 'CA-2025-000001';

# 2. Generate QR code
# Contains: certificate number, verification URL

# 3. Create digital signature
# HMAC-SHA256 of certificate data

# 4. Generate PDF
# Using pdf-lib with certificate template

# 5. Store in Supabase Storage
# Bucket: certificates
# Path: /{jurisdiction}/{year}/{certificate_number}.pdf
```

## Reporting Workflow

### Monthly Reporting Process

**Pre-Reporting Checklist**:

```bash
# 1. Verify certificate data
SELECT
  COUNT(*) as total_certificates,
  COUNT(CASE WHEN status = 'issued' THEN 1 END) as issued,
  COUNT(CASE WHEN status = 'voided' THEN 1 END) as voided
FROM certificates
WHERE created_at >= date_trunc('month', now() - interval '1 month')
  AND created_at < date_trunc('month', now());

# 2. Check for missing data
SELECT * FROM certificates
WHERE completion_date IS NULL
  OR student_name IS NULL
  OR course_id IS NULL;

# 3. Verify audit trail
SELECT COUNT(*) FROM audit_logs
WHERE table_name = 'certificates'
  AND created_at >= date_trunc('month', now() - interval '1 month');
```

**Report Generation**:

```bash
# 1. Generate CSV report
# Admin Dashboard → Compliance → Generate Report

# 2. Verify report integrity
# Check file hash and manifest signature

# 3. Create submission manifest
{
  "submission_id": "CA-2025-01-001",
  "submission_date": "2025-02-15T10:00:00Z",
  "jurisdiction": "CA",
  "report_period": "2025-01",
  "certificate_count": 150,
  "file_hash": "sha256:abc123...",
  "manifest_signature": "hmac:def456..."
}
```

### Report Submission

**California DMV Submission**:

```bash
# 1. Prepare submission package
# - CSV report file
# - Submission manifest
# - Cover letter (if required)

# 2. Upload via secure FTP
ftp dmv.ca.gov
# Username: your-dmv-username
# Password: your-dmv-password

# 3. Verify upload
# Check file transfer logs
# Verify file integrity

# 4. Record submission
INSERT INTO dmv_submissions (
  submission_id,
  jurisdiction,
  report_period,
  file_path,
  submission_date,
  status
) VALUES (
  'CA-2025-01-001',
  'CA',
  '2025-01',
  '/reports/CA-2025-01-001.csv',
  NOW(),
  'submitted'
);
```

**Texas DPS Submission**:

```bash
# 1. Prepare XML report
# Convert CSV to required XML format

# 2. Upload via web portal
# https://dps.texas.gov/driver-education-portal

# 3. Verify submission
# Check email confirmation
# Record submission ID

# 4. Record submission
INSERT INTO dmv_submissions (
  submission_id,
  jurisdiction,
  report_period,
  file_path,
  submission_date,
  status
) VALUES (
  'TX-2025-01-001',
  'TX',
  '2025-01',
  '/reports/TX-2025-01-001.xml',
  NOW(),
  'submitted'
);
```

## Compliance Monitoring

### Certificate Audit

**Daily Certificate Audit**:

```bash
# 1. Check new certificates
SELECT
  certificate_number,
  student_name,
  completion_date,
  status
FROM certificates
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;

# 2. Verify certificate numbers
SELECT certificate_number, COUNT(*)
FROM certificates
GROUP BY certificate_number
HAVING COUNT(*) > 1;

# 3. Check for anomalies
SELECT * FROM certificates
WHERE completion_date > NOW()
  OR completion_date < '2020-01-01';
```

**Weekly Compliance Check**:

```bash
# 1. Review voided certificates
SELECT
  certificate_number,
  voided_at,
  voided_reason
FROM certificates
WHERE status = 'voided'
  AND voided_at >= NOW() - INTERVAL '7 days';

# 2. Check submission status
SELECT
  submission_id,
  jurisdiction,
  report_period,
  status,
  submission_date
FROM dmv_submissions
WHERE submission_date >= NOW() - INTERVAL '7 days';

# 3. Verify audit trail integrity
SELECT COUNT(*) FROM audit_logs
WHERE NOT verify_audit_signature(id);
```

### Data Integrity Verification

**Certificate Data Validation**:

```sql
-- Check for required fields
SELECT certificate_number, student_name, completion_date
FROM certificates
WHERE student_name IS NULL
  OR completion_date IS NULL
  OR course_id IS NULL;

-- Verify certificate number format
SELECT certificate_number
FROM certificates
WHERE certificate_number !~ '^[A-Z]{2}-\d{4}-\d{6}$';

-- Check for duplicate submissions
SELECT certificate_number, COUNT(*)
FROM certificates
GROUP BY certificate_number
HAVING COUNT(*) > 1;
```

**Audit Trail Verification**:

```sql
-- Verify audit log signatures
SELECT id, created_at, table_name, action
FROM audit_logs
WHERE NOT verify_audit_signature(id);

-- Check for missing audit records
SELECT c.certificate_number, c.created_at
FROM certificates c
LEFT JOIN audit_logs al ON al.record_id = c.id
  AND al.table_name = 'certificates'
WHERE al.id IS NULL;
```

## Error Handling

### Common Issues

**Certificate Generation Failures**:

```bash
# 1. Check PDF generation service
# Verify pdf-lib and qrcode dependencies

# 2. Check storage bucket access
# Supabase Dashboard → Storage → certificates bucket

# 3. Verify certificate template
# Check certificate template file exists

# 4. Manual certificate generation
# Use admin interface to generate certificates manually
```

**Report Generation Failures**:

```bash
# 1. Check data completeness
SELECT COUNT(*) FROM certificates
WHERE completion_date IS NULL
  OR student_name IS NULL;

# 2. Verify file permissions
# Check write permissions for report directory

# 3. Check disk space
# Verify sufficient storage for report files

# 4. Manual report generation
# Use admin interface to generate reports manually
```

**Submission Failures**:

```bash
# 1. Check network connectivity
ping dmv.ca.gov
ping dps.texas.gov

# 2. Verify credentials
# Check DMV/DPS login credentials

# 3. Check file format
# Verify CSV/XML format compliance

# 4. Retry submission
# Use admin interface to retry submission
```

### Emergency Procedures

**Certificate System Failure**:

```bash
# 1. Pause certificate generation
# Disable automatic certificate generation

# 2. Generate certificates manually
# Use admin interface for manual generation

# 3. Verify certificate integrity
# Check all generated certificates

# 4. Resume automatic generation
# Re-enable automatic certificate generation
```

**Reporting System Failure**:

```bash
# 1. Generate reports manually
# Use admin interface for manual report generation

# 2. Submit reports manually
# Use FTP client or web browser for manual submission

# 3. Record manual submissions
# Update dmv_submissions table manually

# 4. Verify submission success
# Check for confirmation emails or receipts
```

## Security & Privacy

### Data Protection

**PII Handling**:

```bash
# 1. Minimize PII in logs
# Log only certificate numbers, not student names

# 2. Encrypt sensitive data
# All certificate data encrypted at rest

# 3. Secure transmission
# Use HTTPS for all data transmission

# 4. Access controls
# RLS policies on all certificate tables
```

**Audit Trail Security**:

```bash
# 1. Immutable audit logs
# Audit logs cannot be modified or deleted

# 2. Digital signatures
# All audit log entries digitally signed

# 3. Tamper detection
# Regular verification of audit log integrity

# 4. Backup audit logs
# Regular backup of audit log data
```

### Compliance Requirements

**Data Retention**:

- Certificates: Retain for 7 years
- Audit logs: Retain for 7 years
- Submission records: Retain for 7 years
- Reports: Retain for 7 years

**Access Controls**:

- Certificate generation: Admin only
- Report generation: Admin only
- Report submission: Admin only
- Certificate viewing: Owner and admin

**Audit Requirements**:

- All certificate operations logged
- All report operations logged
- All submission operations logged
- Regular compliance audits

## Monitoring & Alerting

### Key Metrics

**Certificate Metrics**:

- Daily certificate generation count
- Certificate generation success rate
- Certificate void rate
- Average certificate generation time

**Reporting Metrics**:

- Monthly report generation count
- Report submission success rate
- Report processing time
- Submission confirmation rate

**Compliance Metrics**:

- Audit trail integrity rate
- Data completeness rate
- Submission timeliness
- Error rate

### Alert Thresholds

**Critical Alerts**:

- Certificate generation failure rate > 5%
- Report submission failure
- Audit trail corruption
- Data integrity violation

**Warning Alerts**:

- Certificate generation delay > 1 hour
- Report generation delay > 24 hours
- High certificate void rate
- Submission approaching deadline

**Info Alerts**:

- Certificate generation completed
- Report submission successful
- Compliance check completed
- Audit trail verification passed

## References

- [California DMV Driver Education](https://www.dmv.ca.gov/portal/driver-education-and-safety/educational-materials/driver-education/)
- [Texas DPS Driver Education](https://www.dps.texas.gov/driverlicense/drivereducation.htm)
- [Operational Runbooks](docs/RUNBOOKS.md)
- [Certificate Fulfillment](docs/FULFILLMENT_CA.md)

---

**Last updated**: 2025-01-27  
**Next review**: 2025-02-27
