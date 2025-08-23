import { NextRequest, NextResponse } from "next/server";

import { getRouteClient } from "@/lib/supabaseRoute";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate consent type
    const validTypes = ["terms", "privacy", "guardian"];
    if (!body.consent_type || !validTypes.includes(body.consent_type)) {
      return NextResponse.json({ 
        error: "Invalid consent type. Must be one of: terms, privacy, guardian" 
      }, { status: 400 });
    }

    // Get IP and user agent
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Record consent
    const { data, error } = await supabase
      .from("consents")
      .insert({
        student_id: user.id,
        consent_type: body.consent_type,
        ip: ip,
        user_agent: userAgent,
        payload: body.payload || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update profile if this is terms or privacy consent
    if (body.consent_type === "terms" || body.consent_type === "privacy") {
      const updateField = body.consent_type === "terms" ? "terms_accepted_at" : "privacy_accepted_at";
      
      await supabase
        .from("student_profiles")
        .update({ [updateField]: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Consent POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
