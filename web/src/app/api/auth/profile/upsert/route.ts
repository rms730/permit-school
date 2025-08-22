import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { id, full_name, avatar_url, preferred_name, locale } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const adminSupabase = getSupabaseAdmin();

    // Get existing profile to check what fields to update
    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('full_name, locale, preferred_name')
      .eq('id', id)
      .single();

    // Prepare update data - don't overwrite existing full_name or locale if already set
    const updateData: any = {
      last_login_at: new Date().toISOString(),
    };

    // Only update full_name if it's not already set or if it's different
    if (full_name && (!existingProfile?.full_name || existingProfile.full_name !== full_name)) {
      updateData.full_name = full_name;
    }

    // Only update locale if it's not already set
    if (locale && !existingProfile?.locale) {
      updateData.locale = locale;
    }

    // Always update avatar_url and preferred_name if provided
    if (avatar_url) {
      updateData.avatar_url = avatar_url;
    }

    if (preferred_name) {
      updateData.preferred_name = preferred_name;
    }

    // Upsert the profile
    const { data, error } = await adminSupabase
      .from('profiles')
      .upsert({
        id,
        ...updateData,
      })
      .select()
      .single();

    if (error) {
      console.error('Profile upsert error:', error);
      return NextResponse.json({ error: 'Failed to upsert profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (error) {
    console.error('Profile upsert error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
