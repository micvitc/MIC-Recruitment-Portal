import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import RecruitmentCycle from "@/models/RecruitmentCycle";

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
  const cycle = await RecruitmentCycle.findOne({ cycleId: "2026-27" }).lean();
  return NextResponse.json({ success: true, cycle });
}

export async function PUT(req: NextRequest) {
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
  const { isOpen, startAt, endAt } = body;

  if (typeof isOpen !== "boolean") {
    return NextResponse.json(
      { success: false, error: "isOpen must be boolean." },
      { status: 400 }
    );
  }

  const updateFields: any = { isOpen };
  if (startAt !== undefined) updateFields.startAt = startAt ? new Date(startAt) : null;
  if (endAt !== undefined) updateFields.endAt = endAt ? new Date(endAt) : null;

  if (isOpen) {
    updateFields.openedAt = new Date();
  } else {
    updateFields.closedAt = new Date();
  }

  const cycle = await RecruitmentCycle.findOneAndUpdate(
    { cycleId: "2026-27" },
    {
      $set: updateFields,
    },
    { new: true, upsert: true }
  );

  // Log action
  const { logAdminAction } = await import("@/lib/logger");
  await logAdminAction(
    session.user.email ?? "unknown",
    "cycle_toggle",
    "2026-27",
    `Recruitment is now ${isOpen ? "OPEN" : "CLOSED"}.`
  );

  return NextResponse.json({
    success: true,
    cycle,
    message: `Recruitment is now ${isOpen ? "OPEN" : "CLOSED"}.`,
  });
}
