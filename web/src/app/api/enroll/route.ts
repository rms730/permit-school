import { NextRequest, NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";

export async function post(request: NextRequest) {
  try {
    const supabase = getRouteClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    let courseId: string;
    
    // Handle both j_code + course_code and direct course_id
    if (body.course_id) {
      courseId = body.course_id;
    } else if (body.j_code && body.course_code) {
      // Find course by jurisdiction and course code
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("jurisdiction_id", (await supabase.from("jurisdictions").select("id").eq("code", body.j_code).single()).data?.id)
        .eq("code", body.course_code)
        .single();
        
      if (courseError || !course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      courseId = course.id;
    } else {
      return NextResponse.json({ 
        error: "Must provide either course_id or both j_code and course_code" 
      }, { status: 400 });
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from("enrollments")
      .select("id, status")
      .eq("student_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (existingEnrollment) {
      if (existingEnrollment.status === "active") {
        return NextResponse.json({ 
          error: "Already enrolled in this course",
          enrollment_id: existingEnrollment.id 
        }, { status: 409 });
      } else {
        // Reactivate enrollment
        const { data, error } = await supabase
          .from("enrollments")
          .update({ status: "active", completed_at: null })
          .eq("id", existingEnrollment.id)
          .select()
          .single();
          
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json(data);
      }
    }

    // Validate entitlement (subscription or Unit 1 free)
    const { data: entitlements } = await supabase
      .from("entitlements")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    const hasSubscription = entitlements && entitlements.length > 0;
    
    // Check if Unit 1 is free (this would need to be configured in jurisdiction_configs)
    // For now, we'll allow enrollment if they have any entitlements
    if (!hasSubscription) {
      return NextResponse.json({ 
        error: "No active subscription found. Please purchase a course to continue." 
      }, { status: 402 });
    }

    // Create enrollment
    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        student_id: user.id,
        course_id: courseId,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Enroll POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
