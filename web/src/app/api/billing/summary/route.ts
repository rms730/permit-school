import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get billing summary from the view
    const { data: summary, error: summaryError } = await supabase
      .from('v_billing_summary_my')
      .select('*')
      .single();

    if (summaryError) {
      if (summaryError.code === 'PGRST116') {
        // No subscription found
        return NextResponse.json({
          subscription_status: null,
          current_period_end: null,
          cancel_at_period_end: false,
          latest_invoice_status: null,
          latest_invoice_amount: null,
          latest_invoice_date: null,
          dunning_state: 'none',
          next_action_at: null,
          fail_count: 0
        });
      }
      
      console.error('Error fetching billing summary:', summaryError);
      return NextResponse.json({ error: 'Failed to fetch billing summary' }, { status: 500 });
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Billing summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
