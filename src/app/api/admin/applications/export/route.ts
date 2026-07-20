import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";

export async function GET(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    await dbConnect();

    // Fetch all applications for the current cycle only
    const applications = await Application.find({ cycleId: "2026-27" }).lean();

    if (!applications || applications.length === 0) {
      return new NextResponse("No applications found.", { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const colsParam = searchParams.get("columns");

    const allHeaders = {
      id: "ID",
      email: "Email",
      createdAt: "Created At",
      overallStatus: "Overall Status",
      firstPref: "First Preference",
      firstPrefType: "First Pref Type",
      firstPrefStatus: "First Pref Status",
      firstPrefStage: "First Pref Current Stage",
      secondPref: "Second Preference",
      secondPrefType: "Second Pref Type",
      secondPrefStatus: "Second Pref Status",
      secondPrefStage: "Second Pref Current Stage",
      scores: "Rubric Scores",
    };

    const columns = colsParam ? colsParam.split(",") : Object.keys(allHeaders);

    // Validate columns
    const activeCols = columns.filter((col) => col in allHeaders) as Array<keyof typeof allHeaders>;
    const headers = activeCols.map((col) => allHeaders[col]);

    // Map rows
    const rows = (applications as Record<string, unknown>[]).map((app) => {
      const firstProgress = app.firstPrefProgress as Record<string, unknown> | undefined;
      const secondProgress = app.secondPrefProgress as Record<string, unknown> | undefined;

      const getScoresString = () => {
        const scoresList: string[] = [];
        const processStages = (stages: any[], prefLabel: string) => {
          stages?.forEach((s: any) => {
            if (s.scores) {
              // Convert Map/Object scores entries to text
              const entries = (s.scores instanceof Map 
                ? Array.from(s.scores.entries())
                : Object.entries(s.scores)) as [string, any][];
              const scoresEntries = entries.map(([k, v]) => `${k}:${v}`).join("; ");
              scoresList.push(`[${prefLabel} Stage ${s.stage}] ${scoresEntries}`);
            }
          });
        };
        processStages(firstProgress?.stages as any[], "First");
        processStages(secondProgress?.stages as any[], "Second");
        return scoresList.join(" | ");
      };

      const cellMap = {
        id: String(app._id ?? ""),
        email: String(app.userEmail ?? ""),
        createdAt: app.createdAt ? new Date(app.createdAt as string).toISOString() : "",
        overallStatus: String(app.overallStatus ?? ""),
        firstPref: String(app.firstPreference ?? ""),
        firstPrefType: String(app.firstPrefType ?? ""),
        firstPrefStatus: String(firstProgress?.status ?? ""),
        firstPrefStage: String(firstProgress?.currentStage ?? "1"),
        secondPref: String(app.secondPreference ?? ""),
        secondPrefType: String(app.secondPrefType ?? ""),
        secondPrefStatus: String(secondProgress?.status ?? ""),
        secondPrefStage: String(secondProgress?.currentStage ?? "1"),
        scores: getScoresString(),
      };

      return activeCols.map((col) => {
        const cell = cellMap[col];
        return `"${cell.replace(/"/g, '""')}"`; // Escape quotes for CSV compatibility
      });
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
