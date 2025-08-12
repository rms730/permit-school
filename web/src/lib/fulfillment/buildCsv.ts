export interface CertificateData {
  issue_batch_id: string;
  certificate_serial: string;
  student_full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  completion_date: string;
  course_code: string;
  course_title: string;
  jurisdiction_code: string;
  school_name: string;
  school_license_number: string;
  school_address_line1: string;
  school_address_line2: string;
  school_city: string;
  school_state: string;
  school_postal_code: string;
  school_phone: string;
  signatory_printed_name: string;
  signatory_title: string;
  wet_signature_required: string;
  mail_to_name: string;
  mail_to_line1: string;
  mail_to_line2: string;
  mail_to_city: string;
  mail_to_state: string;
  mail_to_postal_code: string;
  qr_verify_url: string;
  barcode_value: string;
  language: string;
}

/**
 * Build CSV content for certificate fulfillment
 * Columns must match exact specification with UTF-8 encoding and CRLF line endings
 */
export function buildCsv(certificates: CertificateData[]): string {
  const headers = [
    'issue_batch_id',
    'certificate_serial',
    'student_full_name',
    'first_name',
    'middle_name',
    'last_name',
    'dob',
    'completion_date',
    'course_code',
    'course_title',
    'jurisdiction_code',
    'school_name',
    'school_license_number',
    'school_address_line1',
    'school_address_line2',
    'school_city',
    'school_state',
    'school_postal_code',
    'school_phone',
    'signatory_printed_name',
    'signatory_title',
    'wet_signature_required',
    'mail_to_name',
    'mail_to_line1',
    'mail_to_line2',
    'mail_to_city',
    'mail_to_state',
    'mail_to_postal_code',
    'qr_verify_url',
    'barcode_value',
    'language'
  ];

  const csvRows = [headers.join(',')];

  for (const cert of certificates) {
    const row = headers.map(header => {
      const value = cert[header as keyof CertificateData] || '';
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = String(value).replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
        return `"${escaped}"`;
      }
      return escaped;
    });
    csvRows.push(row.join(','));
  }

  // Use CRLF line endings as specified
  return csvRows.join('\r\n');
}

/**
 * Generate QR verification URL for a certificate
 */
export function generateQrUrl(certificateId: string, baseUrl: string): string {
  return `${baseUrl}/verify/${certificateId}`;
}

/**
 * Generate barcode value (typically the certificate serial)
 */
export function generateBarcodeValue(serial: string): string {
  return serial;
}
