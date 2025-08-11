import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";

export async function POST(req: Request) {
  try {
    const { attemptId, itemNo, answer } = await req.json();

    // Validate input
    if (!attemptId || typeof attemptId !== "string") {
      return NextResponse.json(
        { error: "Missing attemptId", code: "BAD_BODY" },
        { status: 400 },
      );
    }

    if (!itemNo || typeof itemNo !== "number" || itemNo < 1) {
      return NextResponse.json(
        { error: "Invalid itemNo", code: "BAD_BODY" },
        { status: 400 },
      );
    }

    if (!answer || typeof answer !== "string") {
      return NextResponse.json(
        { error: "Missing answer", code: "BAD_BODY" },
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
      .select("id, student_id")
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

    // Get the attempt item
    const { data: item, error: itemError } = await supabase
      .from("attempt_items")
      .select("id, answer")
      .eq("attempt_id", attemptId)
      .eq("item_no", itemNo)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: "Question not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Compare with stored correct answer
    const correct = answer === item.answer;

    // Update the attempt item
    const { error: updateError } = await supabase
      .from("attempt_items")
      .update({ correct })
      .eq("id", item.id);

    if (updateError) {
      console.error("Attempt item update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save answer", code: "DATABASE_ERROR" },
        { status: 500 },
      );
    }

    return NextResponse.json({ correct });
  } catch (err: any) {
    console.error("Attempt answer API error:", err);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
