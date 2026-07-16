import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";

// Whitelist of sortable fields to prevent unintended field exposure
const ALLOWED_SORTS = new Set([
  "-createdAt",
  "createdAt",
  "-updatedAt",
  "updatedAt",
  "-overallStatus",
  "overallStatus",
  "userEmail",
  "-userEmail",
  "-firstPreference",
  "firstPreference",
]);

// Escape special regex characters to prevent ReDoS
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
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

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "25"));
  const dept = searchParams.get("dept") ?? "";
  const status = searchParams.get("status") ?? "";
  const stage = searchParams.get("stage") ?? "";
  const pref = searchParams.get("pref") ?? ""; // "first" | "second"
  const search = searchParams.get("q") ?? "";
  const rawSort = searchParams.get("sort") ?? "-createdAt";

  // Whitelist the sort field — fall back to default if unknown
  const sort = ALLOWED_SORTS.has(rawSort) ? rawSort : "-createdAt";

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
    // Escape user input before using it in a MongoDB $regex to prevent ReDoS
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { userEmail: { $regex: safeSearch, $options: "i" } },
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
