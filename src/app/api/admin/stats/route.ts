import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();

  const [
    total,
    inProgress,
    selected,
    rejected,
    byDept,
    recentActivity,
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
    Application.find({ cycleId: "2026-27" })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("userEmail overallStatus firstPreference secondPreference updatedAt")
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
      recentActivity,
    },
  });
}
