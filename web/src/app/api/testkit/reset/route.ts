import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  // Environment guard - return 404 if testkit is not enabled
  if (process.env.TESTKIT_ON !== 'true') {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Token validation
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.TESTKIT_TOKEN;
  
  if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    
    // Log the operation
    console.info(JSON.stringify({
      operation: 'testkit_reset',
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent')
    }));

    // Reset test data - only tables we create in tests
    // This is a logical reset that clears test data without affecting production
    const { error: seatTimeError } = await supabase
      .from('seat_time_events')
      .delete()
      .gt('id', 0); // Delete all rows (bigserial starts at 1)

    const { error: attemptsError } = await supabase
      .from('attempts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: attemptItemsError } = await supabase
      .from('attempt_items')
      .delete()
      .neq('attempt_id', '00000000-0000-0000-0000-000000000000');

    const { error: enrollmentsError } = await supabase
      .from('enrollments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: guardianRequestsError } = await supabase
      .from('guardian_requests')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: consentsError } = await supabase
      .from('consents')
      .delete()
      .gt('id', 0); // Delete all rows (bigserial starts at 1)

    const { error: certificatesError } = await supabase
      .from('certificates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    // Note: We don't delete user profiles or auth users as they may be referenced elsewhere
    // Test users should be cleaned up separately if needed

    if (seatTimeError || attemptsError || attemptItemsError || enrollmentsError || 
        guardianRequestsError || consentsError || certificatesError) {
      console.error('Testkit reset errors:', {
        seatTimeError,
        attemptsError,
        attemptItemsError,
        enrollmentsError,
        guardianRequestsError,
        consentsError,
        certificatesError
      });
      return NextResponse.json({ 
        error: 'Failed to reset test data',
        details: { seatTimeError, attemptsError, attemptItemsError, enrollmentsError, 
                  guardianRequestsError, consentsError, certificatesError }
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test data reset successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Testkit reset error:', error);
    return NextResponse.json({ 
      error: 'Internal server error during reset' 
    }, { status: 500 });
  }
}
