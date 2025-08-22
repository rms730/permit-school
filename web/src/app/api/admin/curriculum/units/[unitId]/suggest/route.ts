import { NextResponse } from "next/server";

import { getServerClient } from "@/lib/supabaseServer";

export async function POST(
  request: Request,
  { params }: { params: { unitId: string } }
) {
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

    // Get unit info to build search query
    const { data: unit, error: unitError } = await supabase
      .from("course_units")
      .select(`
        title,
        objectives,
        courses(jurisdictions(code))
      `)
      .eq("id", params.unitId)
      .single();

    if (unitError || !unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    // Build search query from unit title and objectives
    const searchQuery = [unit.title, unit.objectives]
      .filter(Boolean)
      .join(" ");

    const jurisdictionCode = (unit.courses as any)?.jurisdictions?.code || "CA";

    // Call the hybrid search RPC
    const { data: suggestions, error: suggestionsError } = await supabase.rpc(
      "search_hybrid",
      {
        query_text: searchQuery,
        j_code: jurisdictionCode,
        limit_count: 50,
      }
    );

    if (suggestionsError) {
      return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
    }

    // Format the response
    const formattedSuggestions = suggestions?.map((suggestion: any, index: number) => ({
      ord: index + 1,
      chunk_id: suggestion.id,
      snippet: suggestion.chunk,
      score: suggestion.score,
    })) || [];

    return NextResponse.json({ suggestions: formattedSuggestions });
  } catch (error) {
    console.error("Unit suggestions API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
