import { NextRequest, NextResponse } from 'next/server';

import { sendEmail } from '@/lib/email';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

    // Check if user already has a pending deletion request
    const { data: existingRequest } = await supabase
      .from('deletion_requests')
      .select('id, status, requested_at')
      .eq('user_id', user.id)
      .in('status', ['pending', 'confirmed'])
      .single();

    if (existingRequest) {
      return NextResponse.json({ 
        error: "Deletion request already exists",
        request_id: existingRequest.id,
        status: existingRequest.status,
        requested_at: existingRequest.requested_at
      }, { status: 409 });
    }

    // Generate confirmation token
    const { data: tokenData, error: tokenError } = await supabase.rpc('generate_deletion_token');
    if (tokenError) {
      console.error('Token generation error:', tokenError);
      return NextResponse.json({ error: "Failed to generate confirmation token" }, { status: 500 });
    }

    // Create deletion request
    const { data: deletionRequest, error } = await supabase
      .from('deletion_requests')
      .insert({
        user_id: user.id,
        status: 'pending',
        reason: reason || null,
        confirmation_token: tokenData
      })
      .select()
      .single();

    if (error) {
      console.error('Deletion request creation error:', error);
      return NextResponse.json({ error: "Failed to create deletion request" }, { status: 500 });
    }

    // Send confirmation email
    try {
      const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/account/delete/confirm?token=${tokenData}`;
      
      await sendEmail({
        to: user.email!,
        subject: 'Confirm Account Deletion Request',
        template: 'deletion-confirmation',
        data: {
          confirmation_url: confirmationUrl,
          expires_at: deletionRequest.token_expires_at,
          reason: reason || 'No reason provided'
        }
      });
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
      // Don't fail the request, but log the error
    }

    return NextResponse.json({ 
      message: "Deletion request created. Please check your email to confirm.",
      request_id: deletionRequest.id,
      status: deletionRequest.status
    });
  } catch (error) {
    console.error("Delete request POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the latest deletion request for the user
    const { data: deletionRequest, error } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Deletion request retrieval error:', error);
      return NextResponse.json({ error: "Failed to retrieve deletion request status" }, { status: 500 });
    }

    if (!deletionRequest) {
      return NextResponse.json({ 
        message: "No deletion requests found",
        status: null 
      });
    }

    return NextResponse.json({
      request_id: deletionRequest.id,
      status: deletionRequest.status,
      requested_at: deletionRequest.requested_at,
      confirmed_at: deletionRequest.confirmed_at,
      executed_at: deletionRequest.executed_at,
      reason: deletionRequest.reason
    });
  } catch (error) {
    console.error("Delete request GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
