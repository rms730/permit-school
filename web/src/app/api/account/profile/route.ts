import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { isValidLocale } from '@/lib/i18n/locales';
import { getRouteClient } from '@/lib/supabaseRoute';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate allowed fields
    const allowedFields = [
      'preferred_name', 
      'locale', 
      'theme_pref', 
      'marketing_opt_in',
      'avatar_url'
    ];
    
    const updateData: any = {};
    
    // Only allow specific fields to be updated
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Validate theme preference
    if (updateData.theme_pref && !['system', 'light', 'dark'].includes(updateData.theme_pref)) {
      return NextResponse.json({ error: "Invalid theme preference" }, { status: 400 });
    }

    // Validate locale
    if (updateData.locale && !isValidLocale(updateData.locale)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }

    // Validate marketing opt-in is boolean
    if (updateData.marketing_opt_in !== undefined && typeof updateData.marketing_opt_in !== 'boolean') {
      return NextResponse.json({ error: "Marketing opt-in must be a boolean" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
