import { NextRequest, NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";

export async function get() {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("student_profiles")
      .select("*")
      .eq("user_id", user.id)
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

export async function put(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const required = ["first_name", "last_name", "dob", "address_line1", "city", "state", "postal_code"];
    const missing = required.filter(field => !body[field]);
    
    if (missing.length > 0) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        missing 
      }, { status: 400 });
    }

    // Calculate age
    const dob = new Date(body.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const isMinor = age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && today.getDate() < dob.getDate());

    // Prepare profile data
    const profileData = {
      user_id: user.id,
      first_name: body.first_name,
      last_name: body.last_name,
      middle_name: body.middle_name,
      dob: body.dob,
      phone: body.phone,
      address_line1: body.address_line1,
      address_line2: body.address_line2,
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      guardian_name: body.guardian_name,
      guardian_email: body.guardian_email,
      guardian_phone: body.guardian_phone,
      terms_accepted_at: body.terms_accepted_at,
      privacy_accepted_at: body.privacy_accepted_at,
    };

    const { data, error } = await supabase
      .from("student_profiles")
      .upsert(profileData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      ...data, 
      is_minor: isMinor 
    });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
