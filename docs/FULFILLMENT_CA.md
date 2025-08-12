# California Certificate Fulfillment (DL 400C)

## Overview

The California Certificate Fulfillment system manages the secure printing and mailing of DMV-required certificates (DL 400C) through authorized vendors. This system maintains a secure inventory of pre-numbered certificate stock, allocates serials safely, and tracks the entire fulfillment lifecycle.

## System Architecture

### Database Schema

- **`cert_stock`**: Secure inventory of DMV pre-numbered certificate serials
- **`fulfillment_batches`**: Export batches with status tracking
- **`fulfillment_items`**: Individual certificates within batches
- **Views**: `v_fulfillment_pending`, `v_fulfillment_inventory`

### Key Features

- **Secure Serial Allocation**: Race-safe allocation using `FOR UPDATE SKIP LOCKED`
- **Batch Management**: Group certificates for efficient vendor processing
- **Reconciliation**: Process vendor returns and handle exceptions
- **Inventory Tracking**: Real-time stock levels with low-stock alerts
- **Audit Trail**: Complete history of all certificate movements

## CSV Export Specification

### File Format
- **Filename**: `certificates.csv`
- **Encoding**: UTF-8
- **Line Endings**: CRLF (`\r\n`)
- **Delimiter**: Comma (`,`)

### Required Columns

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `issue_batch_id` | UUID | Unique batch identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `certificate_serial` | TEXT | DMV pre-numbered serial | `CA123456789` |
| `student_full_name` | TEXT | Student's full legal name | `John Michael Smith` |
| `first_name` | TEXT | Student's first name | `John` |
| `middle_name` | TEXT | Student's middle name | `Michael` |
| `last_name` | TEXT | Student's last name | `Smith` |
| `dob` | DATE | Date of birth (YYYY-MM-DD) | `1990-05-15` |
| `completion_date` | DATE | Course completion date | `2024-01-15` |
| `course_code` | TEXT | Course identifier | `CA-DL-001` |
| `course_title` | TEXT | Course title | `California Driver Education` |
| `jurisdiction_code` | TEXT | State code | `CA` |
| `school_name` | TEXT | School name | `Permit School` |
| `school_license_number` | TEXT | School license | `12345` |
| `school_address_line1` | TEXT | School address | `123 Main Street` |
| `school_address_line2` | TEXT | School address line 2 | `Suite 100` |
| `school_city` | TEXT | School city | `Los Angeles` |
| `school_state` | TEXT | School state | `CA` |
| `school_postal_code` | TEXT | School ZIP code | `90210` |
| `school_phone` | TEXT | School phone | `(555) 123-4567` |
| `signatory_printed_name` | TEXT | Authorized signer | `Jane Doe` |
| `signatory_title` | TEXT | Signer's title | `Director` |
| `wet_signature_required` | TEXT | Signature requirement | `Y` |
| `mail_to_name` | TEXT | Mailing name | `John Michael Smith` |
| `mail_to_line1` | TEXT | Mailing address | `456 Oak Avenue` |
| `mail_to_line2` | TEXT | Mailing address line 2 | `Apt 2B` |
| `mail_to_city` | TEXT | Mailing city | `San Francisco` |
| `mail_to_state` | TEXT | Mailing state | `CA` |
| `mail_to_postal_code` | TEXT | Mailing ZIP code | `94102` |
| `qr_verify_url` | URL | Certificate verification URL | `https://permit-school.com/verify/123` |
| `barcode_value` | TEXT | Barcode data | `CA123456789` |
| `language` | TEXT | Certificate language | `EN` |

### CSV Example

```csv
issue_batch_id,certificate_serial,student_full_name,first_name,middle_name,last_name,dob,completion_date,course_code,course_title,jurisdiction_code,school_name,school_license_number,school_address_line1,school_address_line2,school_city,school_state,school_postal_code,school_phone,signatory_printed_name,signatory_title,wet_signature_required,mail_to_name,mail_to_line1,mail_to_line2,mail_to_city,mail_to_state,mail_to_postal_code,qr_verify_url,barcode_value,language
550e8400-e29b-41d4-a716-446655440000,CA123456789,John Michael Smith,John,Michael,Smith,1990-05-15,2024-01-15,CA-DL-001,California Driver Education,CA,Permit School,12345,123 Main Street,Suite 100,Los Angeles,CA,90210,(555) 123-4567,Jane Doe,Director,Y,John Michael Smith,456 Oak Avenue,Apt 2B,San Francisco,CA,94102,https://permit-school.com/verify/123,CA123456789,EN
```

## Manifest File Specification

### File Format
- **Filename**: `manifest.json`
- **Encoding**: UTF-8
- **Content-Type**: `application/json`

### Structure

```json
{
  "batchId": "550e8400-e29b-41d4-a716-446655440000",
  "j_code": "CA",
  "counts": {
    "queued": 0,
    "exported": 150,
    "mailed": 0,
    "void": 0,
    "reprint": 0
  },
  "csv": {
    "filename": "certificates.csv",
    "sha256": "a1b2c3d4e5f6..."
  },
  "createdAt": "2024-01-15T10:30:00Z",
  "hmac": "hmac_signature_here"
}
```

### HMAC Signing

The manifest is signed using HMAC-SHA256 to ensure integrity:

1. **Secret**: `FULFILLMENT_HMAC_SECRET` environment variable
2. **Algorithm**: HMAC-SHA256
3. **Data**: JSON stringified manifest (excluding hmac field)
4. **Output**: Hex-encoded signature

## Reconciliation Files

### mailed.csv

Returned by the printer daily with mailing confirmation:

```csv
certificate_serial,mailed_at,tracking
CA123456789,2024-01-16T14:30:00Z,USPS123456789
CA123456790,2024-01-16T14:30:00Z,USPS123456790
```

### exceptions.csv

Returned by the printer for misprints, voids, or reprints:

```csv
certificate_serial,reason
CA123456791,misprint_smeared_ink
CA123456792,stock_damaged
```

## Operational Procedures

### Daily Export Process

1. **Check Inventory**: Verify sufficient stock available
2. **Run Export**: Execute export for pending certificates
3. **Download ZIP**: Retrieve vendor bundle
4. **Send to Vendor**: Upload to printer's SFTP or email
5. **Track Status**: Monitor batch status in admin UI

### Reconciliation Process

1. **Receive Files**: Get mailed.csv and exceptions.csv from vendor
2. **Upload Files**: Use admin UI reconciliation feature
3. **Process Updates**: System updates certificate statuses
4. **Handle Exceptions**: Reprints automatically queued
5. **Verify Completion**: Confirm all certificates processed

### Low Stock Management

1. **Monitor Alerts**: System warns when stock < 200
2. **Request Stock**: Contact DMV for new serial ranges
3. **Upload Serials**: Use inventory management UI
4. **Verify Upload**: Confirm serials added correctly
5. **Test Allocation**: Run test export to verify

### Exception Handling

#### Misprints
- Mark original as void
- Queue for reprint with new serial
- Include in next export batch

#### Damaged Stock
- Mark serial as void
- Document reason in database
- Request replacement from DMV

#### Missing Mailings
- Track via USPS tracking numbers
- Follow up with vendor after 7 days
- Escalate if not resolved within 14 days

## Security Considerations

### Access Control
- Admin-only access to fulfillment features
- Row-level security on all tables
- Audit logging of all operations

### Data Protection
- PII encrypted in transit and at rest
- Signed URLs for secure file access
- HMAC verification of all manifests

### Inventory Security
- Serial allocation is atomic and race-safe
- No duplicate serials possible
- Complete audit trail of all movements

## Troubleshooting

### Common Issues

#### "Out of certificate stock"
- Check inventory levels
- Request new stock from DMV
- Verify serial upload completed

#### "Export failed"
- Check database connectivity
- Verify pending certificates exist
- Review error logs for details

#### "Reconciliation errors"
- Validate CSV format
- Check serial numbers exist
- Verify batch status is "exported"

#### "Low stock warning"
- Monitor inventory dashboard
- Plan for stock replenishment
- Consider reducing export frequency

### Support Contacts

- **Technical Issues**: Development team
- **DMV Coordination**: Compliance team
- **Vendor Issues**: Operations team
- **Emergency**: On-call administrator

## Configuration

### Environment Variables

```bash
# Enable fulfillment system
FULFILLMENT_ON=true

# HMAC signing secret
FULFILLMENT_HMAC_SECRET=your_secret_here

# Storage bucket name
FULFILLMENT_BUCKET=dmv_fulfillment

# Low stock threshold
FULFILLMENT_LOW_STOCK_THRESHOLD=200

# Daily cutoff timezone
DAILY_CUTOFF_TZ=America/Los_Angeles
```

### Database Configuration

Ensure these tables exist and RLS is enabled:
- `cert_stock`
- `fulfillment_batches`
- `fulfillment_items`
- `v_fulfillment_pending`
- `v_fulfillment_inventory`

## Compliance Notes

- All certificate data must be accurate and complete
- Serial numbers must match DMV records exactly
- Mailing addresses must be current and valid
- All operations are logged for audit purposes
- Vendor contracts must include data security requirements
