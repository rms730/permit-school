import { NextResponse } from "next/server";

import { checkSeatTimeMilestones } from "@/lib/notify";
import { getRouteClient } from "@/lib/supabaseRoute";

export async function POST(req: Request) {
  try {
    const { unitId, msDelta } = await req.json();

    // Validate input
    if (!unitId || typeof unitId !== "string") {
      return NextResponse.json(
        { error: "Missing unitId", code: "BAD_BODY" },
        { status: 400 },
      );
    }

    if (
      !msDelta ||
      typeof msDelta !== "number" ||
      msDelta < 1000 ||
      msDelta > 300000
    ) {
      return NextResponse.json(
        { error: "Invalid msDelta", code: "BAD_BODY" },
        { status: 400 },
      );
    }

    const supabase = await getRouteClient();

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

    // Find course_id via course_units
    const { data: unit, error: unitError } = await supabase
      .from("course_units")
      .select("course_id, unit_no, minutes_required")
      .eq("id", unitId)
      .single();

    if (unitError || !unit) {
      return NextResponse.json(
        { error: "Unit not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Insert seat time event
    const { error: insertError } = await supabase
      .from("seat_time_events")
      .insert({
        student_id: user.id,
        course_id: unit.course_id,
        unit_id: unitId,
        ms_delta: msDelta,
      });

    if (insertError) {
      console.error("Seat time insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to record seat time", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Get current progress
    const { data: progress, error: progressError } = await supabase
      .from("unit_progress")
      .select("time_ms")
      .eq("student_id", user.id)
      .eq("course_id", unit.course_id)
      .eq("unit_no", unit.unit_no)
      .single();

    const currentTimeMs = progress?.time_ms || 0;
    const newTimeMs = Math.min(
      currentTimeMs + msDelta,
      unit.minutes_required * 60000,
    );
    const capped = newTimeMs >= unit.minutes_required * 60000;

    // Upsert unit progress
    const { error: upsertError } = await supabase.from("unit_progress").upsert({
      student_id: user.id,
      course_id: unit.course_id,
      unit_no: unit.unit_no,
      time_ms: newTimeMs,
    });

    if (upsertError) {
      console.error("Progress upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to update progress", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    // Check for seat time milestones (best effort, don't block response)
    try {
      await checkSeatTimeMilestones(user.id, unit.course_id, Math.floor(msDelta / 60000));
    } catch (milestoneError) {
      console.error("Seat time milestone check error:", milestoneError);
    }

    return NextResponse.json({ ok: true, capped });
  } catch (err: any) {
    console.error("Seat time API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
