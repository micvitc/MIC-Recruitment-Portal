import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const [
    total,
    inProgress,
    selected,
    rejected,
    byDept,
    dailyApplications,
    recentActivity,
    byStage,
    departmentsList,
    acceptedByDept,
    auditLogs,
  ] = await Promise.all([
    Application.countDocuments({ cycleId: "2026-27" }),
    Application.countDocuments({ cycleId: "2026-27", overallStatus: "in-progress" }),
    Application.countDocuments({ cycleId: "2026-27", overallStatus: "selected" }),
    Application.countDocuments({ cycleId: "2026-27", overallStatus: "rejected" }),
    Application.aggregate([
      { $match: { cycleId: "2026-27" } },
      {
        $facet: {
          byFirst: [
            { $group: { _id: "$firstPreference", count: { $sum: 1 } } },
          ],
          bySecond: [
            { $group: { _id: "$secondPreference", count: { $sum: 1 } } },
          ],
        },
      },
    ]),
    Application.aggregate([
      { $match: { cycleId: "2026-27" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          applications: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Application.find({ cycleId: "2026-27" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("userEmail overallStatus firstPreference secondPreference updatedAt")
      .lean(),
    Application.aggregate([
      { $match: { cycleId: "2026-27", overallStatus: "in-progress" } },
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
    Department.find({}, "slug name isActive").lean(),
    Application.aggregate([
      { $match: { cycleId: "2026-27", overallStatus: "selected" } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$activePreference", "first"] },
              then: "$firstPreference",
              else: "$secondPreference",
            },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return NextResponse.json({
    success: true,
    stats: {
      total,
      inProgress,
      selected,
      rejected,
      conversionRate: total > 0 ? ((selected / total) * 100).toFixed(1) : "0",
      byDepartment: byDept[0],
      dailyApplications,
      recentActivity,
      byStage,
      departmentsList,
      acceptedByDept,
      auditLogs,
    },
  });
}
