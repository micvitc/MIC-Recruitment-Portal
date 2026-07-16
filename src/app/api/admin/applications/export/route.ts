import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";

export async function GET(req: NextRequest) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Suppress unused-variable lint warning; req is needed for the handler signature
  void req;

  try {
    await dbConnect();

    // Fetch all applications for the current cycle only
    const applications = await Application.find({ cycleId: "2026-27" }).lean();

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
    const rows = (applications as Record<string, unknown>[]).map((app) => {
      const firstProgress = app.firstPrefProgress as Record<string, unknown> | undefined;
      const secondProgress = app.secondPrefProgress as Record<string, unknown> | undefined;
      return [
        String(app._id ?? ""),
        String(app.userEmail ?? ""),
        app.createdAt ? new Date(app.createdAt as string).toISOString() : "",
        String(app.overallStatus ?? ""),
        String(app.firstPreference ?? ""),
        String(app.firstPrefType ?? ""),
        String(firstProgress?.status ?? ""),
        String(firstProgress?.currentStage ?? "1"),
        String(app.secondPreference ?? ""),
        String(app.secondPrefType ?? ""),
        String(secondProgress?.status ?? ""),
        String(secondProgress?.currentStage ?? "1"),
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
