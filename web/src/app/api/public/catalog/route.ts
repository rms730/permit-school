import { NextResponse } from "next/server";
import { getRouteClient } from "@/lib/supabaseRoute";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getRouteClient();

    // Get course catalog from view
    const { data: catalog, error } = await supabase
      .from("v_course_catalog")
      .select("*")
      .order("j_code", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to load catalog" }, { status: 500 });
    }

    return NextResponse.json({ catalog }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error("Catalog API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
