import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId, isIdle, lastActivity, currentPage, sessionId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();

    // Update user's last activity timestamp
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({ 
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Log engagement activity (for analytics and compliance)
    const { error: activityError } = await adminSupabase
      .from('user_activity_log')
      .insert({
        user_id: userId,
        activity_type: isIdle ? 'idle' : 'active',
        page_url: currentPage || null,
        session_id: sessionId || null,
        metadata: {
          lastActivity: lastActivity,
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent'),
        }
      });

    if (activityError) {
      console.error('Activity log error:', activityError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
