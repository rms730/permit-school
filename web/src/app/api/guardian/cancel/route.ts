import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function post(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ code: 'unauthorized', message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { request_id } = body;

    if (!request_id) {
      return NextResponse.json({ code: 'validation_error', message: 'Request ID is required' }, { status: 400 });
    }

    // Get the request and verify ownership
    const { data: guardianRequest, error: fetchError } = await supabase
      .from('guardian_requests')
      .select('*')
      .eq('id', request_id)
      .eq('student_id', user.id)
      .single();

    if (fetchError || !guardianRequest) {
      return NextResponse.json({ code: 'not_found', message: 'Request not found' }, { status: 404 });
    }

    // Only allow canceling pending requests
    if (guardianRequest.status !== 'pending') {
      return NextResponse.json({ code: 'invalid_status', message: 'Only pending requests can be canceled' }, { status: 400 });
    }

    // Cancel the request
    const { error: updateError } = await supabase
      .from('guardian_requests')
      .update({ status: 'canceled' })
      .eq('id', request_id)
      .eq('student_id', user.id);

    if (updateError) {
      console.error('Error canceling guardian request:', updateError);
      return NextResponse.json({ code: 'database_error', message: 'Failed to cancel request' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Guardian cancel error:', error);
    return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 });
  }
}
