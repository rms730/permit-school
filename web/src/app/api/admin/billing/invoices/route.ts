import { NextRequest, NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get recent invoices (last 30 days) with user information
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: invoices, error: invoicesError } = await supabase
      .from('billing_invoices')
      .select(`
        id,
        user_id,
        stripe_invoice_id,
        status,
        amount_due_cents,
        amount_paid_cents,
        currency,
        hosted_invoice_url,
        pdf_url,
        created_at,
        period_start,
        period_end,
        profiles!inner(
          email,
          full_name
        )
      `)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    // Format the data
    const formattedInvoices = (invoices || []).map(invoice => ({
      id: invoice.id,
      user_id: invoice.user_id,
      email: invoice.profiles[0]?.email || 'Unknown',
      full_name: invoice.profiles[0]?.full_name || 'Unknown',
      stripe_invoice_id: invoice.stripe_invoice_id,
      status: invoice.status,
      amount_due_cents: invoice.amount_due_cents,
      amount_paid_cents: invoice.amount_paid_cents,
      currency: invoice.currency,
      hosted_invoice_url: invoice.hosted_invoice_url,
      pdf_url: invoice.pdf_url,
      created_at: invoice.created_at,
      period_start: invoice.period_start,
      period_end: invoice.period_end,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      total: formattedInvoices.length,
    });
  } catch (error) {
    console.error('Admin invoices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
