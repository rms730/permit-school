import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  try {
    const supabase = getServerClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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
    const { courseId, unitId, direction } = body;

    if (!courseId || !unitId || !direction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["up", "down"].includes(direction)) {
      return NextResponse.json({ error: "Direction must be 'up' or 'down'" }, { status: 400 });
    }

    // Call the reorder function
    const { error } = await supabase.rpc("reorder_course_units", {
      p_course_id: courseId,
      p_unit_id: unitId,
      p_direction: direction,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to reorder unit" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unit reorder API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
