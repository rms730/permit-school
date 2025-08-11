import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabaseServer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");

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
        hours_required_minutes,
        jurisdictions(name, code)
      `)
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Get units for this course
    const { data: units, error: unitsError } = await supabase
      .from("course_units")
      .select(`
        unit_no,
        title,
        minutes_required,
        objectives,
        is_published
      `)
      .eq("course_id", courseId)
      .order("unit_no", { ascending: true });

    if (unitsError) {
      return NextResponse.json({ error: "Failed to load units" }, { status: 500 });
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // US Letter size
    const { width, height } = page.getSize();

    // Load fonts
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 20;

    // Title
    page.drawText("Course Syllabus", {
      x: margin,
      y: yPosition,
      size: 24,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Course info
    page.drawText(`Course: ${course.code} - ${course.title}`, {
      x: margin,
      y: yPosition,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    page.drawText(`Jurisdiction: ${(course.jurisdictions as any)?.name || (course.jurisdictions as any)?.code}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    page.drawText(`Total Required Hours: ${Math.round((course.hours_required_minutes || 0) / 60)}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= lineHeight;

    page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Units
    page.drawText("Course Units:", {
      x: margin,
      y: yPosition,
      size: 16,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    units?.forEach((unit) => {
      if (yPosition < 100) {
        // Add new page
        const newPage = pdfDoc.addPage([612, 792]);
        yPosition = height - 50;
      }

      // Unit header
      page.drawText(`${unit.unit_no}. ${unit.title}`, {
        x: margin,
        y: yPosition,
        size: 14,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;

      page.drawText(`Time Required: ${unit.minutes_required} minutes`, {
        x: margin + 20,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= lineHeight;

      if (unit.objectives) {
        page.drawText("Learning Objectives:", {
          x: margin + 20,
          y: yPosition,
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0, 0),
        });
        yPosition -= lineHeight;

        // Wrap text for objectives
        const words = unit.objectives.split(" ");
        let line = "";
        for (const word of words) {
          const testLine = line + word + " ";
          if (testLine.length > 80) {
            page.drawText(line, {
              x: margin + 40,
              y: yPosition,
              size: 11,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
            yPosition -= 15;
            line = word + " ";
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, {
            x: margin + 40,
            y: yPosition,
            size: 11,
            font: helveticaFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= 15;
        }
      }

      yPosition -= 10;
    });

    // Footer
    const footerPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
    footerPage.drawText(`Page ${pdfDoc.getPageCount()}`, {
      x: width - 100,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="syllabus-${course.code}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Syllabus PDF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
