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
    const {
      id,
      course_id,
      stem,
      choices,
      answer,
      explanation,
      skill,
      difficulty,
      tags = [],
      source_sections = [],
      source_ref,
      status = "draft"
    } = body;

    // Validate required fields
    if (!course_id || !stem || !choices || !answer || !explanation || !skill || !difficulty) {
      return NextResponse.json({ 
        error: "Missing required fields: course_id, stem, choices, answer, explanation, skill, difficulty" 
      }, { status: 400 });
    }

    // Validate difficulty range
    if (difficulty < 1 || difficulty > 5) {
      return NextResponse.json({ error: "Difficulty must be between 1 and 5" }, { status: 400 });
    }

    // Validate status
    if (!["draft", "approved", "archived"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Normalize tags to lowercase
    const normalizedTags = tags.map((tag: string) => tag.toLowerCase());

    // Check if this is an update or create
    if (id) {
      // Update existing question
      const { data: existingQuestion } = await supabase
        .from("question_bank")
        .select("status, version, published_at, stem, choices, answer, explanation, skill, difficulty")
        .eq("id", id)
        .single();

      if (!existingQuestion) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 });
      }

      // Determine if we need to bump version
      const coreFieldsChanged = 
        existingQuestion.stem !== stem ||
        JSON.stringify(existingQuestion.choices) !== JSON.stringify(choices) ||
        existingQuestion.answer !== answer ||
        existingQuestion.explanation !== explanation ||
        existingQuestion.skill !== skill ||
        existingQuestion.difficulty !== difficulty;

      const statusTransitioningToApproved = existingQuestion.status !== "approved" && status === "approved";

      const newVersion = coreFieldsChanged ? existingQuestion.version + 1 : existingQuestion.version;
      const newPublishedAt = statusTransitioningToApproved ? new Date().toISOString() : existingQuestion.published_at;

      const { data: updatedQuestion, error: updateError } = await supabase
        .from("question_bank")
        .update({
          stem,
          choices,
          answer,
          explanation,
          skill,
          difficulty,
          tags: normalizedTags,
          source_sections,
          source_ref,
          status,
          version: newVersion,
          published_at: newPublishedAt,
          author_id: user.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating question:", updateError);
        return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
      }

      return NextResponse.json({ question: updatedQuestion });

    } else {
      // Create new question
      const { data: newQuestion, error: createError } = await supabase
        .from("question_bank")
        .insert({
          course_id,
          stem,
          choices,
          answer,
          explanation,
          skill,
          difficulty,
          tags: normalizedTags,
          source_sections,
          source_ref,
          status,
          author_id: user.id
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating question:", createError);
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
      }

      return NextResponse.json({ question: newQuestion }, { status: 201 });
    }

  } catch (error) {
    console.error("Error in questions upsert API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
