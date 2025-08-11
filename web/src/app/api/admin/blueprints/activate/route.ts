import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Get user from session to check admin role
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, course_id } = body;

    if (!id || !course_id) {
      return NextResponse.json({ error: "Blueprint id and course_id are required" }, { status: 400 });
    }

    // Get the blueprint to verify it exists and belongs to the course
    const { data: blueprint, error: fetchError } = await supabase
      .from("exam_blueprints")
      .select("id, course_id, name")
      .eq("id", id)
      .eq("course_id", course_id)
      .single();

    if (fetchError || !blueprint) {
      return NextResponse.json({ error: "Blueprint not found" }, { status: 404 });
    }

    // Deactivate any other active blueprint for this course
    const { error: deactivateError } = await supabase
      .from("exam_blueprints")
      .update({ is_active: false })
      .eq("course_id", course_id)
      .eq("is_active", true);

    if (deactivateError) {
      console.error("Error deactivating other blueprints:", deactivateError);
      return NextResponse.json({ error: "Failed to deactivate other blueprints" }, { status: 500 });
    }

    // Activate the specified blueprint
    const { data: activatedBlueprint, error: activateError } = await supabase
      .from("exam_blueprints")
      .update({ is_active: true })
      .eq("id", id)
      .select()
      .single();

    if (activateError) {
      console.error("Error activating blueprint:", activateError);
      return NextResponse.json({ error: "Failed to activate blueprint" }, { status: 500 });
    }

    return NextResponse.json({ blueprint: activatedBlueprint });

  } catch (error) {
    console.error("Error in blueprint activate API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
