import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    // Verify admin access (this endpoint should be called by background workers)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const expectedToken = process.env.BACKGROUND_WORKER_TOKEN;
    
    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json({ error: "Invalid worker token" }, { status: 403 });
    }

    // Get confirmed deletion requests that have passed the grace period (7 days)
    const gracePeriodDays = 7;
    const gracePeriodDate = new Date();
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    const { data: confirmedDeletions, error: fetchError } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('status', 'confirmed')
      .lt('confirmed_at', gracePeriodDate.toISOString())
      .order('confirmed_at', { ascending: true })
      .limit(10); // Process in batches

    if (fetchError) {
      console.error('Failed to fetch confirmed deletions:', fetchError);
      return NextResponse.json({ error: "Failed to fetch confirmed deletions" }, { status: 500 });
    }

    if (!confirmedDeletions || confirmedDeletions.length === 0) {
      return NextResponse.json({ message: "No confirmed deletions ready for processing" });
    }

    const adminSupabase = getSupabaseAdmin();
    const results = [];

    for (const deletionRequest of confirmedDeletions) {
      try {
        // Update status to executing
        await supabase
          .from('deletion_requests')
          .update({ status: 'executing' })
          .eq('id', deletionRequest.id);

        // Execute the deletion using the database function
        const { error: deletionError } = await supabase.rpc('execute_user_deletion', {
          user_uuid: deletionRequest.user_id
        });

        if (deletionError) {
          throw new Error(`Database deletion failed: ${deletionError.message}`);
        }

        // Delete user from Supabase Auth (this requires admin privileges)
        try {
          const { error: authDeletionError } = await adminSupabase.auth.admin.deleteUser(
            deletionRequest.user_id
          );

          if (authDeletionError) {
            console.warn(`Auth user deletion failed for ${deletionRequest.user_id}:`, authDeletionError);
            // Don't fail the entire process, but log the warning
          }
        } catch (authError) {
          console.warn(`Auth user deletion failed for ${deletionRequest.user_id}:`, authError);
          // Continue with the process even if auth deletion fails
        }

        // Update deletion request to executed
        await supabase
          .from('deletion_requests')
          .update({
            status: 'executed',
            executed_at: new Date().toISOString()
          })
          .eq('id', deletionRequest.id);

        results.push({
          deletion_id: deletionRequest.id,
          user_id: deletionRequest.user_id,
          status: 'success',
          executed_at: new Date().toISOString()
        });

      } catch (error) {
        console.error(`Deletion processing failed for ${deletionRequest.id}:`, error);
        
        // Update deletion request with error
        await supabase
          .from('deletion_requests')
          .update({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', deletionRequest.id);

        results.push({
          deletion_id: deletionRequest.id,
          user_id: deletionRequest.user_id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} deletions`,
      results
    });

  } catch (error) {
    console.error("Deletion worker error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
