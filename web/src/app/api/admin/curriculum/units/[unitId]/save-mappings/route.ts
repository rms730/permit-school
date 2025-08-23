import { NextResponse } from "next/server";

import { getServerClient } from "@/lib/supabaseServer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const { unitId } = await params;
    const supabase = await getServerClient();

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

    const body = await request.json();
    const { mappings, action } = body;

    if (!mappings || !Array.isArray(mappings) || !action) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!["replace", "append"].includes(action)) {
      return NextResponse.json({ error: "Action must be 'replace' or 'append'" }, { status: 400 });
    }

    // Start a transaction
    const { error: transactionError } = await supabase.rpc("begin_transaction");

    if (transactionError) {
      return NextResponse.json({ error: "Failed to start transaction" }, { status: 500 });
    }

    try {
      if (action === "replace") {
        // Delete existing mappings
        const { error: deleteError } = await supabase
          .from("unit_chunks")
          .delete()
          .eq("unit_id", unitId);

        if (deleteError) {
          throw deleteError;
        }
      }

      // Insert new mappings
      if (mappings.length > 0) {
        const mappingData = mappings.map((mapping: any) => ({
          unit_id: unitId,
          chunk_id: mapping.chunk_id,
          ord: mapping.ord,
        }));

        const { error: insertError } = await supabase
          .from("unit_chunks")
          .insert(mappingData);

        if (insertError) {
          throw insertError;
        }
      }

      // Commit transaction
      const { error: commitError } = await supabase.rpc("commit_transaction");

      if (commitError) {
        throw commitError;
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback transaction
      await supabase.rpc("rollback_transaction");
      throw error;
    }
  } catch (error) {
    console.error("Save mappings API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
