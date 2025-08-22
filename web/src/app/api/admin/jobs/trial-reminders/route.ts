import { NextRequest, NextResponse } from 'next/server';

import { sendTrialReminderEmail } from '@/lib/email';
import { notifyStudent } from '@/lib/notify';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // Environment guard - return 404 if not enabled
    if (process.env.TRIAL_REMINDERS_ENABLED !== 'true') {
      return new NextResponse('Not Found', { status: 404 });
    }

    // HMAC validation (reuse existing pattern)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_JOB_TOKEN;
    
    if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'trial_reminders_job',
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent')
    }));

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));
    const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));

    // Get trialing subscriptions ending in 3 days
    const { data: threeDayTrials, error: threeDayError } = await supabase
      .from('subscriptions')
      .select(`
        user_id,
        current_period_end
      `)
      .eq('status', 'trialing')
      .gte('current_period_end', threeDaysFromNow.toISOString())
      .lt('current_period_end', new Date(threeDaysFromNow.getTime() + (24 * 60 * 60 * 1000)).toISOString());

    if (threeDayError) {
      console.error('Error fetching 3-day trial reminders:', threeDayError);
      return NextResponse.json({ 
        error: 'Failed to fetch 3-day trial reminders',
        details: threeDayError 
      }, { status: 500 });
    }

    // Get trialing subscriptions ending in 1 day
    const { data: oneDayTrials, error: oneDayError } = await supabase
      .from('subscriptions')
      .select(`
        user_id,
        current_period_end
      `)
      .eq('status', 'trialing')
      .gte('current_period_end', oneDayFromNow.toISOString())
      .lt('current_period_end', new Date(oneDayFromNow.getTime() + (24 * 60 * 60 * 1000)).toISOString());

    if (oneDayError) {
      console.error('Error fetching 1-day trial reminders:', oneDayError);
      return NextResponse.json({ 
        error: 'Failed to fetch 1-day trial reminders',
        details: oneDayError 
      }, { status: 500 });
    }

    const allTrials = [
      ...(threeDayTrials || []).map(trial => ({ ...trial, daysLeft: 3 as const })),
      ...(oneDayTrials || []).map(trial => ({ ...trial, daysLeft: 1 as const }))
    ];

    if (allTrials.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No trial reminders needed',
        processed: 0
      });
    }

    let processedCount = 0;
    const results: any[] = [];

    // Process each trial
    for (const trial of allTrials) {
      try {
        console.info(`Processing trial reminder for user ${trial.user_id} (${trial.daysLeft} days left)`);

        // Get user details
        const { data: user } = await supabase.auth.admin.getUserById(trial.user_id);
        if (!user?.user?.email) {
          console.warn(`No email found for user ${trial.user_id}`);
          continue;
        }

        // Check if we already sent a reminder for this user and days left
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', trial.user_id)
          .eq('type', 'trial_ending')
          .eq('data->>days_left', trial.daysLeft.toString())
          .gte('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString()) // Within last 24 hours
          .single();

        if (existingNotification) {
          console.info(`Trial reminder already sent for user ${trial.user_id} (${trial.daysLeft} days)`);
          continue;
        }

        // Send email
        try {
          await sendTrialReminderEmail({
            to: user.user.email,
            name: user.user.user_metadata?.full_name,
            daysLeft: trial.daysLeft,
          });
        } catch (emailError) {
          console.error(`Failed to send trial reminder email to ${user.user.email}:`, emailError);
          // Continue processing other users
        }

        // Create notification
        try {
          await notifyStudent(trial.user_id, 'trial_ending', {
            days_left: trial.daysLeft,
            trial_end_date: trial.current_period_end,
          });
        } catch (notificationError) {
          console.error(`Failed to create trial reminder notification for user ${trial.user_id}:`, notificationError);
        }

        results.push({
          user_id: trial.user_id,
          days_left: trial.daysLeft,
          email_sent: true,
          notification_created: true,
        });

        processedCount++;
      } catch (error) {
        console.error(`Error processing trial reminder for user ${trial.user_id}:`, error);
        results.push({
          user_id: trial.user_id,
          days_left: trial.daysLeft,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue with other users
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      total_trials: allTrials.length,
      three_day_trials: threeDayTrials?.length || 0,
      one_day_trials: oneDayTrials?.length || 0,
      results,
      message: 'Trial reminders job completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trial reminders job error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during trial reminders job' 
    }, { status: 500 });
  }
}
