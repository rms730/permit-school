import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabaseServer";

export async function GET(
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

    // Get current mappings for this unit
    const { data: mappings, error: mappingsError } = await supabase
      .from("unit_chunks")
      .select(`
        ord,
        chunk_id,
        content_chunks(chunk)
      `)
      .eq("unit_id", params.unitId)
      .order("ord", { ascending: true });

    if (mappingsError) {
      return NextResponse.json({ error: "Failed to load mappings" }, { status: 500 });
    }

    // Format the response
    const formattedMappings = mappings?.map(mapping => ({
      ord: mapping.ord,
      chunk_id: mapping.chunk_id,
      snippet: (mapping.content_chunks as any)?.chunk || "",
    })) || [];

    return NextResponse.json({ mappings: formattedMappings });
  } catch (error) {
    console.error("Unit mappings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
