import { getRouteClient } from './supabaseRoute';

export interface JurisdictionConfig {
  final_exam_questions: number;
  final_exam_pass_pct: number;
  seat_time_required_minutes: number;
  certificate_prefix: string;
  disclaimer?: string;
  support_email?: string;
  terms_url?: string;
  privacy_url?: string;
}

export async function getJurisdictionConfig(
  jCode: string
): Promise<JurisdictionConfig> {
  try {
    const supabase = getRouteClient();
    // Get config from database by joining with jurisdictions
    const { data: config, error } = await supabase
      .from('jurisdiction_configs')
      .select(`
        final_exam_questions,
        final_exam_pass_pct,
        seat_time_required_minutes,
        certificate_prefix,
        disclaimer,
        support_email,
        terms_url,
        privacy_url
      `)
      .eq('jurisdictions.code', jCode)
      .single();

    if (error || !config) {
      // Fallback to environment variables
      return {
        final_exam_questions: parseInt(process.env.FINAL_EXAM_NUM_QUESTIONS || '30'),
        final_exam_pass_pct: parseFloat(process.env.FINAL_EXAM_PASS_PCT || '0.8'),
        seat_time_required_minutes: parseInt(process.env.FINAL_EXAM_MINUTES_REQUIRED || '150'),
        certificate_prefix: jCode,
      };
    }

    return config;
  } catch (error) {
    console.error('Error fetching jurisdiction config:', error);
    // Fallback to environment variables
    return {
      final_exam_questions: parseInt(process.env.FINAL_EXAM_NUM_QUESTIONS || '30'),
      final_exam_pass_pct: parseFloat(process.env.FINAL_EXAM_PASS_PCT || '0.8'),
      seat_time_required_minutes: parseInt(process.env.FINAL_EXAM_MINUTES_REQUIRED || '150'),
      certificate_prefix: jCode,
    };
  }
}
