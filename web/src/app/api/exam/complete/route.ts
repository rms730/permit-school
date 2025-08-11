import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";
import { notifyStudentAndGuardians } from "@/lib/notify";

export async function POST(req: Request) {
  try {
    const { attemptId } = await req.json();

    // Validate input
    if (!attemptId || typeof attemptId !== "string") {
      return NextResponse.json(
        { error: "Missing attemptId", code: "BAD_BODY" },
        { status: 400 },
      );
    }

    const supabase = getRouteClient();

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }

    // Validate ownership of attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .select("id, student_id, course_id, mode")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json(
        { error: "Attempt not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    if (attempt.student_id !== user.id) {
      return NextResponse.json(
        { error: "Not your attempt", code: "FORBIDDEN" },
        { status: 403 },
      );
    }

    if (attempt.mode !== "final") {
      return NextResponse.json(
        { error: "Not a final exam attempt", code: "INVALID_MODE" },
        { status: 400 },
      );
    }

    // Get all attempt items to compute score
    const { data: items, error: itemsError } = await supabase
      .from("attempt_items")
      .select("correct")
      .eq("attempt_id", attemptId);

    if (itemsError || !items || items.length === 0) {
      console.error("Attempt items query error:", itemsError);
      return NextResponse.json(
        { error: "No exam items found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Compute final score
    const correctCount = items.filter((item) => item.correct === true).length;
    const score = correctCount / items.length;

    // Get pass threshold from env
    const passThreshold = parseFloat(process.env.FINAL_EXAM_PASS_PCT || '0.8');
    const passed = score >= passThreshold;

    // Update attempt with completion
    const { error: updateError } = await supabase
      .from("attempts")
      .update({
        completed_at: new Date().toISOString(),
        score: score,
      })
      .eq("id", attemptId);

    if (updateError) {
      console.error("Attempt update error:", updateError);
      return NextResponse.json(
        { error: "Failed to complete attempt", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // If passed, create draft certificate
    if (passed) {
      // Get jurisdiction_id for the course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("jurisdiction_id")
        .eq("id", attempt.course_id)
        .single();

      if (!courseError && course) {
        const { error: certError } = await supabase
          .from("certificates")
          .upsert({
            student_id: user.id,
            course_id: attempt.course_id,
            jurisdiction_id: course.jurisdiction_id,
            status: "draft",
            passed_at: new Date().toISOString(),
            ship_to: {
              name: user.email || "Student",
              address1: "",
              city: "",
              state: "",
              zip: ""
            }
          });

        if (certError) {
          console.error("Certificate creation error:", certError);
          // Continue even if certificate creation fails
        }
      }
    }

    // Send notifications (best effort, don't block response)
    try {
      if (passed) {
        await notifyStudentAndGuardians(user.id, 'final_passed', {
          course_id: attempt.course_id,
          attempt_id: attemptId,
          score: score
        });
      }
    } catch (notificationError) {
      console.error("Final exam notification error:", notificationError);
    }

    return NextResponse.json({ 
      status: passed ? "passed" : "failed", 
      score 
    });
  } catch (err: any) {
    console.error("Exam complete API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
