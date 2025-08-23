import { NextRequest, NextResponse } from 'next/server';

import { getRouteClient } from '@/lib/supabaseRoute';

export async function GET() {
  try {
    const supabase = await getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = user.app_metadata?.role === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get user's MFA factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    
    if (factorsError) {
      console.error('MFA factors error:', factorsError);
      return NextResponse.json({ error: "Failed to get MFA status" }, { status: 500 });
    }

    // Check if TOTP is enabled
    const totpFactor = factors.totp?.[0];
    const mfaEnabled = totpFactor?.status === 'verified';

    // Calculate session age
    const sessionAgeMs = Date.now() - (user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : Date.now());
    const sessionAgeMinutes = Math.floor(sessionAgeMs / (1000 * 60));

    return NextResponse.json({
      mfa_enabled: mfaEnabled,
      last_auth_at: user.last_sign_in_at || user.created_at,
      session_age_minutes: sessionAgeMinutes,
      factors: factors
    });
  } catch (error) {
    console.error("Security status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
