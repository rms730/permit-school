import { NextRequest, NextResponse } from 'next/server';
import { getRouteClient } from '@/lib/supabaseRoute';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

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

    // Generate TOTP secret
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email!, 'Permit School Admin', secret);
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(otpauth);
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    return NextResponse.json({
      secret,
      qr_code: qrCode,
      backup_codes: backupCodes,
      otpauth
    });
  } catch (error) {
    console.error("MFA setup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
