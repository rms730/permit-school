import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SerialAllocationResult {
  success: boolean;
  serial?: string;
  error?: string;
}

/**
 * Allocate a certificate serial with retry/backoff for contention
 */
export async function allocateSerial(
  jCode: string,
  maxRetries: number = 3,
  baseDelay: number = 100
): Promise<SerialAllocationResult> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.rpc('allocate_cert_serial', {
        p_j_code: jCode
      });

      if (error) {
        if (error.message.includes('Out of certificate stock')) {
          return {
            success: false,
            error: `Out of certificate stock for ${jCode}`
          };
        }
        throw error;
      }

      return {
        success: true,
        serial: data
      };
    } catch (err) {
      const error = err as Error;
      
      // If it's the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        return {
          success: false,
          error: `Failed to allocate serial after ${maxRetries} attempts: ${error.message}`
        };
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: 'Unexpected error in serial allocation'
  };
}
