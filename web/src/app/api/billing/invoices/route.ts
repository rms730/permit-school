import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's invoices from local database
    const { data: invoices, error: invoicesError } = await supabase
      .from('billing_invoices')
      .select(`
        id,
        stripe_invoice_id,
        status,
        amount_due_cents,
        amount_paid_cents,
        currency,
        hosted_invoice_url,
        pdf_url,
        created_at,
        period_start,
        period_end
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError);
      return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }

    // If no invoices in local database, try to fetch from Stripe
    if (!invoices || invoices.length === 0) {
      try {
        // Get customer's stripe_customer_id
        const { data: customer, error: customerError } = await supabase
          .from('billing_customers')
          .select('stripe_customer_id')
          .eq('user_id', user.id)
          .single();

        if (customerError || !customer) {
          return NextResponse.json({ invoices: [] });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: '2025-07-30.basil',
        });

        // Fetch invoices from Stripe
        const stripeInvoices = await stripe.invoices.list({
          customer: customer.stripe_customer_id,
          limit: 50,
        });

        // Convert to our format
        const formattedInvoices = stripeInvoices.data.map(invoice => ({
          id: null, // No local ID
          stripe_invoice_id: invoice.id,
          status: invoice.status,
          amount_due_cents: invoice.amount_due,
          amount_paid_cents: invoice.amount_paid,
          currency: invoice.currency,
          hosted_invoice_url: invoice.hosted_invoice_url,
          pdf_url: invoice.invoice_pdf,
          created_at: new Date(invoice.created * 1000).toISOString(),
          period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
          period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
        }));

        return NextResponse.json({ invoices: formattedInvoices });
      } catch (stripeError) {
        console.error('Error fetching invoices from Stripe:', stripeError);
        return NextResponse.json({ invoices: [] });
      }
    }

    return NextResponse.json({ invoices: invoices || [] });
  } catch (error) {
    console.error('Billing invoices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
