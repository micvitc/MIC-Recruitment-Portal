import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";

interface RouteParams {
  params: Promise<{ dept: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { dept } = await params;

  // ── Auth guard ────────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  await dbConnect();

  try {
    // Total applicants who chose this department as either first or second preference
    const totalApplicants = await Application.countDocuments({
      cycleId: "2026-27",
      $or: [{ firstPreference: dept }, { secondPreference: dept }],
    });

    // Candidates currently active in this department (their activePreference is this department and overallStatus is in-progress)
    const activePipeline = await Application.aggregate([
      {
        $match: {
          cycleId: "2026-27",
          overallStatus: "in-progress",
          $or: [
            { firstPreference: dept, activePreference: "first" },
            { secondPreference: dept, activePreference: "second" },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$activePreference", "first"] },
              then: "$firstPrefProgress.currentStage",
              else: "$secondPrefProgress.currentStage",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Selected candidates for this department
    const selected = await Application.countDocuments({
      cycleId: "2026-27",
      overallStatus: "selected",
      $or: [
        { firstPreference: dept, activePreference: "first" },
        { secondPreference: dept, activePreference: "second" },
      ],
    });

    const byStage = {
      1: 0,
      2: 0,
      3: 0,
    };
    activePipeline.forEach((s) => {
      if (s._id >= 1 && s._id <= 3) {
        byStage[s._id as 1 | 2 | 3] = s.count;
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalApplicants,
        byStage,
        selected,
        conversionRate: totalApplicants > 0 ? ((selected / totalApplicants) * 100).toFixed(1) : "0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
