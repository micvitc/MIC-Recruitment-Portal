import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";
import { deptUpdateSchema } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ dept: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
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
  const department = await Department.findOne({ slug: dept }).lean();
  if (!department) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, department });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
  const body = await req.json();

  const parseResult = deptUpdateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
      { status: 400 }
    );
  }

  const { isActive, totalStages, stageToggles, stages } = parseResult.data;

  const update: Record<string, unknown> = {};
  if (totalStages !== undefined) update.totalStages = totalStages;
  if (isActive !== undefined) update.isActive = isActive;
  if (stageToggles !== undefined) update.stageToggles = stageToggles;
  if (stages !== undefined) update.stages = stages;

  const department = await Department.findOneAndUpdate(
    { slug: dept },
    { $set: update },
    { new: true }
  );

  if (!department) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  // Log action
  const { logAdminAction } = await import("@/lib/logger");
  const details = [];
  if (isActive !== undefined) details.push(`Active: ${isActive}`);
  if (totalStages !== undefined) details.push(`Stages: ${totalStages}`);
  
  await logAdminAction(
    session.user.email ?? "unknown",
    "dept_update",
    dept,
    `Updated settings: ${details.join(", ")}`
  );

  return NextResponse.json({ success: true, department });
}
