import { getRouteClient } from './supabaseRoute';

export interface JurisdictionConfig {
  final_exam_questions: number;
  final_exam_pass_pct: number;
  seat_time_required_minutes: number;
  certificate_prefix: string;
  certificate_issuer_name?: string;
  certificate_issuer_license?: string;
  disclaimer?: string;
  support_email?: string;
  support_phone?: string;
  terms_url?: string;
  privacy_url?: string;
  regulatory_signing_secret?: string;
  fulfillment_low_stock_threshold?: number;
}

export async function getJurisdictionConfig(
  jCode: string
): Promise<JurisdictionConfig> {
  try {
    const supabase = await getRouteClient();
    // Get config from database by joining with jurisdictions
    const { data: config, error } = await supabase
      .from('jurisdiction_configs')
      .select(`
        final_exam_questions,
        final_exam_pass_pct,
        seat_time_required_minutes,
        certificate_prefix,
        certificate_issuer_name,
        certificate_issuer_license,
        disclaimer,
        support_email,
        support_phone,
        terms_url,
        privacy_url,
        regulatory_signing_secret,
        fulfillment_low_stock_threshold
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
