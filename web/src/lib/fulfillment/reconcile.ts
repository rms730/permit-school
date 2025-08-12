import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MailedRecord {
  certificate_serial: string;
  mailed_at: string;
  tracking: string;
}

export interface ExceptionRecord {
  certificate_serial: string;
  reason: string;
}

export interface ReconciliationResult {
  success: boolean;
  mailedCount: number;
  exceptionCount: number;
  errors: string[];
}

/**
 * Parse mailed.csv content
 */
export function parseMailedCsv(csvContent: string): MailedRecord[] {
  const lines = csvContent.trim().split('\n');
  const records: MailedRecord[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [serial, mailedAt, tracking] = line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
    
    if (serial && mailedAt) {
      records.push({
        certificate_serial: serial,
        mailed_at: mailedAt,
        tracking: tracking || ''
      });
    }
  }

  return records;
}

/**
 * Parse exceptions.csv content
 */
export function parseExceptionsCsv(csvContent: string): ExceptionRecord[] {
  const lines = csvContent.trim().split('\n');
  const records: ExceptionRecord[] = [];

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [serial, reason] = line.split(',').map(field => field.trim().replace(/^"|"$/g, ''));
    
    if (serial && reason) {
      records.push({
        certificate_serial: serial,
        reason: reason
      });
    }
  }

  return records;
}

/**
 * Process reconciliation files
 */
export async function processReconciliation(
  batchId: string,
  mailedCsv?: string,
  exceptionsCsv?: string
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    success: true,
    mailedCount: 0,
    exceptionCount: 0,
    errors: []
  };

  try {
    // Process mailed records
    if (mailedCsv) {
      const mailedRecords = parseMailedCsv(mailedCsv);
      
      for (const record of mailedRecords) {
        try {
          const { error } = await supabase.rpc('mark_item_mailed', {
            p_batch: batchId,
            p_certificate: record.certificate_serial, // This should be certificate_id, not serial
            p_tracking: record.tracking,
            p_mailed_at: record.mailed_at
          });

          if (error) {
            result.errors.push(`Failed to mark ${record.certificate_serial} as mailed: ${error.message}`);
          } else {
            result.mailedCount++;
          }
        } catch (err) {
          result.errors.push(`Error processing mailed record for ${record.certificate_serial}: ${err}`);
        }
      }
    }

    // Process exception records
    if (exceptionsCsv) {
      const exceptionRecords = parseExceptionsCsv(exceptionsCsv);
      
      for (const record of exceptionRecords) {
        try {
          const { error } = await supabase.rpc('void_item_and_queue_reprint', {
            p_batch: batchId,
            p_certificate: record.certificate_serial, // This should be certificate_id, not serial
            p_reason: record.reason
          });

          if (error) {
            result.errors.push(`Failed to void ${record.certificate_serial}: ${error.message}`);
          } else {
            result.exceptionCount++;
          }
        } catch (err) {
          result.errors.push(`Error processing exception record for ${record.certificate_serial}: ${err}`);
        }
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }

    return result;
  } catch (err) {
    return {
      success: false,
      mailedCount: 0,
      exceptionCount: 0,
      errors: [`Reconciliation failed: ${err}`]
    };
  }
}
