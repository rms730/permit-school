import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";

export async function get() {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        course_id,
        status,
        started_at,
        completed_at,
        courses(title, code)
      `)
      .eq("student_id", user.id)
      .order("started_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(enrollments || []);
  } catch (error) {
    console.error("Enrollments GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
