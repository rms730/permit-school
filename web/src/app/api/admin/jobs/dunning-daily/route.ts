import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { sendPaymentFailedEmail } from '@/lib/email';
import { notifyStudent } from '@/lib/notify';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Environment guard - return 404 if not enabled
    if (process.env.DUNNING_DAILY_ENABLED !== 'true') {
      return new NextResponse('Not Found', { status: 404 });
    }

    // HMAC validation (reuse existing pattern)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_JOB_TOKEN;
    
    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-07-30.basil',
    });
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'dunning_daily_job',
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent')
    }));

    // Get users with next_action_at <= now()
    const { data: dunningUsers, error: dunningError } = await supabase
      .from('billing_dunning')
      .select(`
        user_id,
        state,
        fail_count,
        last_failed_at,
        next_action_at
      `)
      .lte('next_action_at', new Date().toISOString())
      .not('state', 'eq', 'canceled');

    if (dunningError) {
      console.error('Error fetching dunning users:', dunningError);
      return NextResponse.json({ 
        error: 'Failed to fetch dunning users',
        details: dunningError 
      }, { status: 500 });
    }

    if (!dunningUsers || dunningUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No dunning actions required',
        processed: 0
      });
    }

    let processedCount = 0;
    const results: any[] = [];

    // Process each user
    for (const dunningUser of dunningUsers) {
      try {
        console.info(`Processing dunning for user ${dunningUser.user_id} (state: ${dunningUser.state})`);

        // Get user details
        const { data: user } = await supabase.auth.admin.getUserById(dunningUser.user_id);
        if (!user?.user?.email) {
          console.warn(`No email found for user ${dunningUser.user_id}`);
          continue;
        }

        // Get subscription details
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('stripe_subscription_id, current_period_end')
          .eq('user_id', dunningUser.user_id)
          .single();

        if (!subscription) {
          console.warn(`No subscription found for user ${dunningUser.user_id}`);
          continue;
        }

        let newState: 'email_2' | 'email_3' | 'canceled' = 'email_2';
        let nextActionAt: Date | null = null;
        let emailStep: 2 | 3 = 2;
        let shouldCancel = false;

        // Determine next action based on current state
        if (dunningUser.state === 'email_1') {
          newState = 'email_2';
          emailStep = 2;
          nextActionAt = new Date(Date.now() + (parseInt(process.env.DUNNING_EMAIL_DAY_3 || '7') * 24 * 60 * 60 * 1000));
        } else if (dunningUser.state === 'email_2') {
          newState = 'email_3';
          emailStep = 3;
          nextActionAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
        } else if (dunningUser.state === 'email_3') {
          newState = 'canceled';
          shouldCancel = true;
          nextActionAt = null;
        }

        // Send email
        try {
          await sendPaymentFailedEmail({
            to: user.user.email,
            name: user.user.user_metadata?.full_name,
            amount: '$0.00', // We could get this from latest invoice if needed
            step: emailStep,
          });
        } catch (emailError) {
          console.error(`Failed to send dunning email to ${user.user.email}:`, emailError);
          // Continue processing other users
        }

        // Create notification
        try {
          await notifyStudent(dunningUser.user_id, 'payment_failed', {
            step: emailStep,
          });
        } catch (notificationError) {
          console.error(`Failed to create dunning notification for user ${dunningUser.user_id}:`, notificationError);
        }

        // Cancel subscription if needed
        if (shouldCancel) {
          try {
            await stripe.subscriptions.update(subscription.stripe_subscription_id, {
              cancel_at_period_end: true,
            });

            // Update local subscription
            await supabase
              .from('subscriptions')
              .update({
                cancel_at_period_end: true,
              })
              .eq('user_id', dunningUser.user_id);

            // Revoke entitlement
            await supabase
              .from('entitlements')
              .update({
                active: false,
                updated_at: new Date(),
              })
              .eq('user_id', dunningUser.user_id)
              .eq('j_code', 'CA');

            console.info(`Canceled subscription for user ${dunningUser.user_id}`);
          } catch (cancelError) {
            console.error(`Failed to cancel subscription for user ${dunningUser.user_id}:`, cancelError);
          }
        }

        // Update dunning state
        await supabase
          .from('billing_dunning')
          .update({
            state: newState,
            last_notified_at: new Date(),
            next_action_at: nextActionAt,
          })
          .eq('user_id', dunningUser.user_id);

        results.push({
          user_id: dunningUser.user_id,
          previous_state: dunningUser.state,
          new_state: newState,
          email_sent: true,
          subscription_canceled: shouldCancel,
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing dunning for user ${dunningUser.user_id}:`, error);
        results.push({
          user_id: dunningUser.user_id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue with other users
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total_users: dunningUsers.length,
      results,
      message: 'Daily dunning job completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Daily dunning job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during daily dunning job' 
    }, { status: 500 });
  }
}
