import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";

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
    const department = await Department.findOne({ slug: dept }).lean();
    if (!department) {
      return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
    }

    const [
      firstPrefCount,
      secondPrefCount,
      acceptedCount,
      scoreApps,
      stageAgg,
      yearAgg,
    ] = await Promise.all([
      Application.countDocuments({ cycleId: "2026-27", firstPreference: dept }),
      Application.countDocuments({ cycleId: "2026-27", secondPreference: dept }),
      Application.countDocuments({
        cycleId: "2026-27",
        overallStatus: "selected",
        $or: [
          { firstPreference: dept, activePreference: "first" },
          { secondPreference: dept, activePreference: "second" },
        ],
      }),
      Application.find({
        cycleId: "2026-27",
        $or: [
          { firstPreference: dept, activePreference: "first" },
          { secondPreference: dept, activePreference: "second" },
        ],
      }).lean(),
      Application.aggregate([
        {
          $match: {
            cycleId: "2026-27",
            $or: [
              { firstPreference: dept, activePreference: "first" },
              { secondPreference: dept, activePreference: "second" },
            ],
            overallStatus: "in-progress",
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
      ]),
      Application.aggregate([
        {
          $match: {
            cycleId: "2026-27",
            $or: [{ firstPreference: dept }, { secondPreference: dept }],
          },
        },
        {
          $project: {
            stages: {
              $cond: {
                if: { $eq: ["$activePreference", "first"] },
                then: "$firstPrefProgress.stages",
                else: "$secondPrefProgress.stages",
              },
            },
          },
        },
        {
          $addFields: {
            stage1: {
              $filter: {
                input: "$stages",
                as: "s",
                cond: { $eq: ["$$s.stage", 1] },
              },
            },
          },
        },
        { $unwind: "$stage1" },
        {
          $group: {
            _id: "$stage1.responses.year",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const sumMap: Record<string, number> = {};
    const countMap: Record<string, number> = {};

    scoreApps.forEach((app: any) => {
      const progress = app.activePreference === "first" ? app.firstPrefProgress : app.secondPrefProgress;
      progress?.stages?.forEach((stage: any) => {
        if (stage.scores) {
          const entries = (stage.scores instanceof Map 
            ? Array.from(stage.scores.entries())
            : Object.entries(stage.scores)) as [string, any][];

          entries.forEach(([key, val]) => {
            const scoreVal = Number(val);
            if (!isNaN(scoreVal) && scoreVal > 0) {
              sumMap[key] = (sumMap[key] || 0) + scoreVal;
              countMap[key] = (countMap[key] || 0) + 1;
            }
          });
        }
      });
    });

    const avgScores: Record<string, number> = {};
    Object.keys(sumMap).forEach((key) => {
      avgScores[key] = Number((sumMap[key] / countMap[key]).toFixed(1));
    });

    return NextResponse.json({
      success: true,
      stats: {
        slug: dept,
        name: department.name,
        maxCapacity: department.maxCapacity,
        totalStages: department.totalStages,
        firstPrefCount,
        secondPrefCount,
        acceptedCount,
        avgScores,
        stagesFunnel: stageAgg.map((s) => ({ stageNum: s._id - 1, count: s.count })),
        yearDistribution: yearAgg.map((y) => ({ year: String(y._id || "Other"), count: y.count })),
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to fetch department statistics.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
