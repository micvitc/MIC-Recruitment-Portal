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
      scoreAgg,
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
      Application.aggregate([
        {
          $match: {
            cycleId: "2026-27",
            $or: [
              { firstPreference: dept, activePreference: "first" },
              { secondPreference: dept, activePreference: "second" },
            ],
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
        { $unwind: "$stages" },
        { $match: { "stages.scores": { $exists: true } } },
        {
          $group: {
            _id: null,
            avgTechnical: { $avg: "$stages.scores.technical" },
            avgCommunication: { $avg: "$stages.scores.communication" },
            avgCreativity: { $avg: "$stages.scores.creativity" },
          },
        },
      ]),
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

    const avgScores = scoreAgg[0] || {
      avgTechnical: 0,
      avgCommunication: 0,
      avgCreativity: 0,
    };

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
        avgScores: {
          technical: avgScores.avgTechnical ? Number(avgScores.avgTechnical.toFixed(1)) : 0,
          communication: avgScores.avgCommunication ? Number(avgScores.avgCommunication.toFixed(1)) : 0,
          creativity: avgScores.avgCreativity ? Number(avgScores.avgCreativity.toFixed(1)) : 0,
        },
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
