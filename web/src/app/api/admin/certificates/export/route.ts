import { NextResponse } from "next/server";

import { getServerClient } from "@/lib/supabaseServer";

export async function GET() {
  try {
    const supabase = await getServerClient();

    // Get user from session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get certificates with user and course info
    const { data: certificates, error: certificatesError } = await supabase
      .from("certificates")
      .select(`
        id,
        student_id,
        course_id,
        status,
        passed_at,
        created_at,
        courses(title, code),
        jurisdictions(name, code)
      `)
      .order("created_at", { ascending: false });

    if (certificatesError) {
      return NextResponse.json({ error: "Failed to load certificates" }, { status: 500 });
    }

    // Get user emails for display
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    const userMap = new Map();
    if (!usersError && users) {
      users.users.forEach(user => {
        userMap.set(user.id, user.email);
      });
    }

    // Generate CSV
    const csvHeaders = [
      "Student Email",
      "Course",
      "Jurisdiction", 
      "Status",
      "Passed Date",
      "Issued Date"
    ];

    const csvRows = certificates?.map(cert => [
      userMap.get(cert.student_id) || cert.student_id,
      (cert.courses as any)?.title || (cert.courses as any)?.code || 'N/A',
      (cert.jurisdictions as any)?.name || (cert.jurisdictions as any)?.code || 'N/A',
      cert.status,
      cert.passed_at ? new Date(cert.passed_at).toISOString().split('T')[0] : 'N/A',
      new Date(cert.created_at).toISOString().split('T')[0]
    ]) || [];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="certificates.csv"',
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
