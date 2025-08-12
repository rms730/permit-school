import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface PendingCertificate {
  certificate_id: string;
  j_code: string;
  course_id: string;
  full_name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  dob: string;
  completion_date: string;
  course_code: string;
  course_title: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
}

/**
 * Fetch pending certificates for fulfillment
 */
export async function fetchPending(
  jCode: string,
  courseId?: string
): Promise<PendingCertificate[]> {
  let query = supabase
    .from('v_fulfillment_pending')
    .select('*')
    .eq('j_code', jCode);

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch pending certificates: ${error.message}`);
  }

  return data || [];
}

/**
 * Get count of pending certificates
 */
export async function getPendingCount(
  jCode: string,
  courseId?: string
): Promise<number> {
  let query = supabase
    .from('v_fulfillment_pending')
    .select('certificate_id', { count: 'exact', head: true })
    .eq('j_code', jCode);

  if (courseId) {
    query = query.eq('course_id', courseId);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(`Failed to get pending count: ${error.message}`);
  }

  return count || 0;
}
