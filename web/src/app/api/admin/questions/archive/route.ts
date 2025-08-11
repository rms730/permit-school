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
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Question id is required" }, { status: 400 });
    }

    // Archive the question
    const { data: archivedQuestion, error: archiveError } = await supabase
      .from("question_bank")
      .update({
        status: "archived",
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (archiveError) {
      console.error("Error archiving question:", archiveError);
      return NextResponse.json({ error: "Failed to archive question" }, { status: 500 });
    }

    if (!archivedQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ question: archivedQuestion });

  } catch (error) {
    console.error("Error in questions archive API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
