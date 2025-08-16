# DMV Reporting & Regulatory Compliance

This document describes the regulatory reporting system for DMV submission, designed to produce tamper-evident ZIP packages containing CSVs, PDFs, and signed manifests.

## Overview

The regulatory reporting system generates monthly (and on-demand) compliance packages for submission to state DMVs. Each package contains:

- **CSV Data Files**: Student roster, exam attempts, certificates, and seat time records
- **Cover Sheet PDF**: Summary report with counts and metadata
- **Signed Manifest**: JSON file with artifact list and HMAC signature
- **ZIP Package**: All files bundled with tamper-evident structure

## File Formats

### CSV Files

All CSV files use UTF-8 encoding with comma delimiters and proper escaping for quotes and commas.

#### roster.csv

Student enrollment data for the reporting period.

| Column          | Header                | Description                 |
| --------------- | --------------------- | --------------------------- |
| user_id         | User ID               | Unique student identifier   |
| full_name       | Full Name             | Student's full name         |
| date_of_birth   | Date of Birth         | Student's date of birth     |
| address_city    | City                  | Student's city              |
| address_state   | State                 | Student's state             |
| address_zip     | ZIP Code              | Student's ZIP code          |
| course_id       | Course ID             | Internal course identifier  |
| course_code     | Course Code           | Human-readable course code  |
| course_title    | Course Title          | Course display name         |
| j_code          | Jurisdiction          | 2-letter jurisdiction code  |
| first_enroll_at | First Enrollment Date | When student first enrolled |

#### exams.csv

Final exam attempt data for the reporting period.

| Column       | Header       | Description                    |
| ------------ | ------------ | ------------------------------ |
| user_id      | User ID      | Unique student identifier      |
| attempt_id   | Attempt ID   | Unique exam attempt identifier |
| started_at   | Started At   | When exam was started          |
| completed_at | Completed At | When exam was completed        |
| score        | Score        | Exam score (0.0-1.0)           |
| passed       | Passed       | Boolean pass/fail result       |
| course_id    | Course ID    | Internal course identifier     |
| course_code  | Course Code  | Human-readable course code     |
| j_code       | Jurisdiction | 2-letter jurisdiction code     |

#### certs.csv

Certificate issuance data for the reporting period.

| Column      | Header             | Description                 |
| ----------- | ------------------ | --------------------------- |
| number      | Certificate Number | Official certificate number |
| issued_at   | Issued At          | When certificate was issued |
| student_id  | Student ID         | Unique student identifier   |
| course_id   | Course ID          | Internal course identifier  |
| course_code | Course Code        | Human-readable course code  |
| j_code      | Jurisdiction       | 2-letter jurisdiction code  |

#### seat_time.csv

Seat time tracking data aggregated by student and course.

| Column        | Header        | Description                |
| ------------- | ------------- | -------------------------- |
| user_id       | User ID       | Unique student identifier  |
| course_id     | Course ID     | Internal course identifier |
| course_code   | Course Code   | Human-readable course code |
| j_code        | Jurisdiction  | 2-letter jurisdiction code |
| total_minutes | Total Minutes | Total seat time in minutes |

### Cover Sheet PDF

The cover sheet contains:

- Report title and jurisdiction information
- Course details and reporting period
- Summary counts (students, exams, certificates, seat time records)
- Generation timestamp
- Professional formatting suitable for official submission

### Manifest Structure

The `manifest.json` file contains metadata about the report package:

```json
{
  "run_id": "uuid-of-the-run",
  "j_code": "CA",
  "course_id": "course-uuid",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "generated_at": "2024-02-01T10:00:00Z",
  "summary": {
    "roster": 150,
    "exams": 142,
    "certs": 138,
    "seatTime": 150
  },
  "artifacts": [
    {
      "name": "roster.csv",
      "sha256": "abc123...",
      "bytes": 12345
    },
    {
      "name": "exams.csv",
      "sha256": "def456...",
      "bytes": 6789
    }
  ],
  "signature": "hmac-signature-here"
}
```

## Signing Method

The manifest is signed using HMAC-SHA256 with a secret key stored in `REGULATORY_SIGNING_SECRET`. The signature process:

1. **Payload Preparation**: JSON object with all fields except signature, sorted by key
2. **HMAC Generation**: SHA256 hash of payload + secret key
3. **Signature Addition**: HMAC added to manifest as `signature` field

### Verification

To verify a manifest signature:

```javascript
const payload = JSON.stringify(manifest, Object.keys(manifest).sort());
const expectedSignature = createHash("sha256")
  .update(payload + secretKey)
  .digest("hex");
const isValid = manifest.signature === expectedSignature;
```

## Running Reports

### On-Demand Generation

1. **Access Admin UI**: Navigate to `/admin/compliance`
2. **Select Parameters**:
   - Jurisdiction (default: CA)
   - Course
   - Period start and end dates (max 45 days)
3. **Dry Run**: Click "Dry Run" to preview counts
4. **Generate**: Click "Generate & Download" to create full package

### Monthly Automated Job

The system includes an automated monthly job that:

1. **Triggers**: Called via HMAC-protected endpoint
2. **Scope**: Processes all active CA courses
3. **Period**: Last full calendar month
4. **Output**: Generates packages for each course

**Job Endpoint**: `POST /api/admin/jobs/regulatory-monthly`

**Authentication**: Bearer token in `ADMIN_JOB_TOKEN` environment variable

**Enable**: Set `REGULATORY_MONTHLY_ENABLED=true`

## Storage & Security

### Storage Structure

Files are stored in the private `dmv_reports` bucket under:

```
/{j_code}/{YYYY-MM}/{run_id}/
├── roster.csv
├── exams.csv
├── certs.csv
├── seat_time.csv
├── cover.pdf
└── manifest.json
```

### Access Control

- **RLS Enabled**: All regulatory tables require admin role
- **Private Bucket**: Storage bucket is not publicly accessible
- **Admin Only**: All APIs require admin authentication
- **Rate Limited**: API endpoints include rate limiting

### Privacy Considerations

- **Content Minimization**: Only necessary data included
- **Address Data**: Limited to city, state, ZIP (no street addresses)
- **Secure Storage**: All packages stored in private bucket
- **Admin Access**: Only administrators can access reports

## Operational Runbook

### Monitoring

1. **Check Run Status**: Monitor `regulatory_runs` table for failed runs
2. **Artifact Verification**: Ensure all expected files are present
3. **Signature Validation**: Verify manifest signatures are valid
4. **Storage Monitoring**: Check bucket usage and cleanup

### Troubleshooting

#### Failed Runs

1. **Check Logs**: Review application logs for error details
2. **Verify Data**: Ensure source data exists for the period
3. **Storage Issues**: Check bucket permissions and space
4. **Re-run**: Delete failed run and regenerate

#### Missing Artifacts

1. **Verify Upload**: Check storage bucket for files
2. **Database Sync**: Ensure `regulatory_artifacts` records exist
3. **Permissions**: Verify admin access to storage
4. **Re-generate**: If artifacts missing, regenerate the run

#### Signature Verification

1. **Check Secret**: Verify `REGULATORY_SIGNING_SECRET` is set
2. **Payload Format**: Ensure JSON sorting matches signature process
3. **Hash Algorithm**: Confirm SHA256 is used consistently
4. **Re-sign**: If needed, regenerate signature with correct secret

### Maintenance

#### Data Retention

- **Runs**: Keep for 7 years (regulatory requirement)
- **Artifacts**: Keep for 7 years
- **Storage**: Implement lifecycle policies for old files

#### Cleanup

- **Failed Runs**: Archive after 30 days
- **Old Artifacts**: Move to cold storage after 1 year
- **Logs**: Rotate application logs regularly

### Backup & Recovery

1. **Database**: Regular backups of regulatory tables
2. **Storage**: Replicate bucket to secondary region
3. **Secrets**: Secure backup of signing keys
4. **Documentation**: Maintain runbook and procedures

## Compliance Notes

### California DMV Requirements

- **File Format**: CSV with specific column requirements
- **Data Accuracy**: All counts must match source data
- **Audit Trail**: Complete record of report generation
- **Retention**: 7-year retention period for all records

### Multi-State Ready

The system is designed to support multiple jurisdictions:

- **Jurisdiction Config**: Database-backed configuration per state
- **Course Mapping**: Courses linked to specific jurisdictions
- **Format Flexibility**: Schema supports different state requirements
- **Scalable Storage**: Namespaced storage paths by jurisdiction

### Audit & Verification

- **Run Tracking**: Complete audit trail of all report generation
- **Artifact Integrity**: SHA256 hashes for all files
- **Signature Verification**: HMAC signatures for tamper detection
- **Access Logging**: All admin actions logged and auditable
