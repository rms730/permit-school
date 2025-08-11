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
      name,
      total_questions,
      rules = []
    } = body;

    // Validate required fields
    if (!course_id || !name || !total_questions || !rules.length) {
      return NextResponse.json({ 
        error: "Missing required fields: course_id, name, total_questions, rules" 
      }, { status: 400 });
    }

    // Validate total_questions
    if (total_questions <= 0) {
      return NextResponse.json({ error: "total_questions must be greater than 0" }, { status: 400 });
    }

    // Validate rules
    const totalCount = rules.reduce((sum: number, rule: any) => sum + rule.count, 0);
    if (totalCount !== total_questions) {
      return NextResponse.json({ 
        error: `Sum of rule counts (${totalCount}) must equal total_questions (${total_questions})` 
      }, { status: 400 });
    }

    // Validate each rule
    for (const rule of rules) {
      if (!rule.rule_no || !rule.skill || !rule.count) {
        return NextResponse.json({ 
          error: "Each rule must have rule_no, skill, and count" 
        }, { status: 400 });
      }

      if (rule.count <= 0) {
        return NextResponse.json({ 
          error: "Rule count must be greater than 0" 
        }, { status: 400 });
      }

      if (rule.min_difficulty && (rule.min_difficulty < 1 || rule.min_difficulty > 5)) {
        return NextResponse.json({ 
          error: "min_difficulty must be between 1 and 5" 
        }, { status: 400 });
      }

      if (rule.max_difficulty && (rule.max_difficulty < 1 || rule.max_difficulty > 5)) {
        return NextResponse.json({ 
          error: "max_difficulty must be between 1 and 5" 
        }, { status: 400 });
      }

      if (rule.min_difficulty && rule.max_difficulty && rule.min_difficulty > rule.max_difficulty) {
        return NextResponse.json({ 
          error: "min_difficulty cannot be greater than max_difficulty" 
        }, { status: 400 });
      }
    }

    // Start transaction
    const { data: blueprint, error: blueprintError } = await supabase
      .from("exam_blueprints")
      .upsert({
        id,
        course_id,
        name,
        total_questions,
        is_active: false // Always start as inactive
      })
      .select()
      .single();

    if (blueprintError) {
      console.error("Error saving blueprint:", blueprintError);
      return NextResponse.json({ error: "Failed to save blueprint" }, { status: 500 });
    }

    // Delete existing rules
    const { error: deleteRulesError } = await supabase
      .from("exam_blueprint_rules")
      .delete()
      .eq("blueprint_id", blueprint.id);

    if (deleteRulesError) {
      console.error("Error deleting existing rules:", deleteRulesError);
      return NextResponse.json({ error: "Failed to update blueprint rules" }, { status: 500 });
    }

    // Insert new rules
    const rulesToInsert = rules.map((rule: any) => ({
      blueprint_id: blueprint.id,
      rule_no: rule.rule_no,
      skill: rule.skill,
      count: rule.count,
      min_difficulty: rule.min_difficulty || null,
      max_difficulty: rule.max_difficulty || null,
      include_tags: rule.include_tags || [],
      exclude_tags: rule.exclude_tags || []
    }));

    const { error: insertRulesError } = await supabase
      .from("exam_blueprint_rules")
      .insert(rulesToInsert);

    if (insertRulesError) {
      console.error("Error inserting rules:", insertRulesError);
      return NextResponse.json({ error: "Failed to save blueprint rules" }, { status: 500 });
    }

    // Get the complete blueprint with rules
    const { data: completeBlueprint, error: fetchError } = await supabase
      .from("exam_blueprints")
      .select(`
        id,
        name,
        total_questions,
        is_active,
        created_at,
        updated_at,
        exam_blueprint_rules(
          rule_no,
          skill,
          count,
          min_difficulty,
          max_difficulty,
          include_tags,
          exclude_tags
        )
      `)
      .eq("id", blueprint.id)
      .single();

    if (fetchError) {
      console.error("Error fetching complete blueprint:", fetchError);
      return NextResponse.json({ error: "Failed to fetch blueprint" }, { status: 500 });
    }

    return NextResponse.json({ blueprint: completeBlueprint });

  } catch (error) {
    console.error("Error in blueprint save API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
