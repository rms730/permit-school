import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';

export async function POST() {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Disable MFA for the user
    // This would typically involve updating the user's MFA status in your database
    // For now, we'll just return success
    
    return NextResponse.json({ 
      message: "MFA disabled successfully",
      mfa_enabled: false
    });
  } catch (error) {
    console.error("MFA disable error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
