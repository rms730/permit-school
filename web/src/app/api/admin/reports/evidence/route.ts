import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabaseServer";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
    }

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

    // Get course info
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(`
        id,
        code,
        title,
        jurisdictions(name, code)
      `)
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Build query for student progress
    let query = supabase
      .from("v_student_course_progress")
      .select("*")
      .eq("course_id", courseId);

    // Add date filters if provided
    if (fromDate) {
      query = query.gte("created_at", fromDate);
    }
    if (toDate) {
      query = query.lte("created_at", toDate);
    }

    const { data: progress, error: progressError } = await query;

    if (progressError) {
      return NextResponse.json({ error: "Failed to load progress data" }, { status: 500 });
    }

    // Get user emails for display
    const userIds = progress?.map(p => p.user_id) || [];
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    const userMap = new Map();
    if (!usersError && users) {
      users.users.forEach(user => {
        userMap.set(user.id, user.email);
      });
    }

    // Generate CSV
    const csvHeaders = [
      "User ID",
      "Email",
      "Full Name",
      "Role",
      "Course Code",
      "Course Title",
      "Jurisdiction",
      "Minutes Total",
      "Quiz Attempts",
      "Quiz Average",
      "Final Exam Score",
      "Final Exam Completed",
      "Final Exam Passed",
      "Certificate Number",
      "Certificate Issued At"
    ];

    const csvRows = progress?.map(p => [
      p.user_id,
      userMap.get(p.user_id) || "N/A",
      p.full_name || "N/A",
      p.role || "N/A",
      p.course_code || "N/A",
      p.course_title || "N/A",
      p.jurisdiction_code || "N/A",
      p.minutes_total || 0,
      p.quiz_attempts || 0,
      p.quiz_avg ? p.quiz_avg.toFixed(2) : "N/A",
      p.final_exam_score ? p.final_exam_score.toFixed(2) : "N/A",
      p.final_exam_completed ? new Date(p.final_exam_completed).toISOString().split('T')[0] : "N/A",
      p.final_exam_passed ? "Yes" : "No",
      p.certificate_number || "N/A",
      p.issued_at ? new Date(p.issued_at).toISOString().split('T')[0] : "N/A"
    ]) || [];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const filename = `evidence-${course.code}-${fromDate || 'all'}-${toDate || 'all'}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Evidence CSV error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
