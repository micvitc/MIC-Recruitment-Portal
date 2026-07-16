import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "25"));
  const dept = searchParams.get("dept") ?? "";
  const status = searchParams.get("status") ?? "";
  const stage = searchParams.get("stage") ?? "";
  const pref = searchParams.get("pref") ?? ""; // "first" | "second"
  const search = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "-createdAt";

  const filter: Record<string, unknown> = { cycleId: "2026-27" };

  if (dept) {
    filter.$or = [{ firstPreference: dept }, { secondPreference: dept }];
  }
  if (status) filter.overallStatus = status;
  if (pref === "first" && stage) {
    filter["firstPrefProgress.currentStage"] = parseInt(stage);
  } else if (pref === "second" && stage) {
    filter["secondPrefProgress.currentStage"] = parseInt(stage);
  }
  if (search) {
    filter.$or = [
      { userEmail: { $regex: search, $options: "i" } },
    ];
  }

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    applications,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
