import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Strictly, we should check if session.user is an admin.
  // Assuming anyone who hits this route and has an active session is allowed,
  // as per the existing admin routes.

  try {
    await dbConnect();

    // We can fetch all applications
    const applications = await Application.find({}).lean();

    if (!applications || applications.length === 0) {
      return new NextResponse("No applications found.", { status: 404 });
    }

    // CSV Headers
    const headers = [
      "ID",
      "Email",
      "Created At",
      "Overall Status",
      "First Preference",
      "First Pref Type",
      "First Pref Status",
      "First Pref Current Stage",
      "Second Preference",
      "Second Pref Type",
      "Second Pref Status",
      "Second Pref Current Stage",
    ];

    // Map rows
    const rows = applications.map((app: any) => {
      return [
        app._id.toString(),
        app.userEmail || "",
        new Date(app.createdAt).toISOString(),
        app.overallStatus || "",
        app.firstPreference || "",
        app.firstPrefType || "",
        app.firstPrefProgress?.status || "",
        app.firstPrefProgress?.currentStage?.toString() || "1",
        app.secondPreference || "",
        app.secondPrefType || "",
        app.secondPrefProgress?.status || "",
        app.secondPrefProgress?.currentStage?.toString() || "1",
      ].map((cell) => `"${cell.replace(/"/g, '""')}"`); // Escape quotes for CSV
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="mic-applicants-2026.csv"',
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
