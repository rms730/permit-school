import { NextRequest, NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Confirmation token is required" }, { status: 400 });
    }

    const supabase = await getRouteClient();

    // Find the deletion request with this token
    const { data: deletionRequest, error: findError } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('confirmation_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !deletionRequest) {
      return NextResponse.json({ error: "Invalid or expired confirmation token" }, { status: 400 });
    }

    // Check if token has expired
    if (new Date() > new Date(deletionRequest.token_expires_at)) {
      return NextResponse.json({ error: "Confirmation token has expired" }, { status: 400 });
    }

    // Update the deletion request to confirmed status
    const { data: updatedRequest, error: updateError } = await supabase
      .from('deletion_requests')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', deletionRequest.id)
      .select()
      .single();

    if (updateError) {
      console.error('Deletion request update error:', updateError);
      return NextResponse.json({ error: "Failed to confirm deletion request" }, { status: 500 });
    }

    // The actual deletion will be handled by a background worker
    // after the grace period (typically 7 days)

    return NextResponse.json({ 
      message: "Account deletion confirmed. Your account will be permanently deleted after the grace period.",
      request_id: updatedRequest.id,
      status: updatedRequest.status,
      confirmed_at: updatedRequest.confirmed_at
    });
  } catch (error) {
    console.error("Delete confirmation POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
