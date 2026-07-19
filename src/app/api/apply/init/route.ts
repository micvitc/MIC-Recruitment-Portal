import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import type { DeptSlug, PrefType } from "@/models/Application";
import { applyInitSchema } from "@/lib/validation";

const CYCLE_ID = "2026-27";

const DEPT_TYPE_MAP: Record<DeptSlug, PrefType> = {
  development: "tech",
  "competitive-coding": "tech",
  "ui-ux": "tech",
  "ai-ml": "tech",
  "cyber-security": "tech",
  design: "non-tech",
  management: "non-tech",
  entrepreneurship: "non-tech",
  "content-media": "non-tech",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    // Check recruitment is open
    const cycle = await RecruitmentCycle.findOne({ cycleId: CYCLE_ID });
    const { isCycleOpen } = await import("@/lib/cycle");
    if (!isCycleOpen(cycle)) {
      return NextResponse.json(
        { success: false, error: "Recruitment is currently closed." },
        { status: 403 }
      );
    }

    // Check existing application
    const existing = await Application.findOne({
      userId: session.user.id,
      cycleId: CYCLE_ID,
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "You have already submitted an application.", applicationId: existing._id },
        { status: 409 }
      );
    }

    const body = await req.json();
    const parseResult = applyInitSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }
    const { firstPreference, _trap } = parseResult.data;

    // Honeypot check
    if (_trap) {
      return NextResponse.json({ success: false, error: "Bad request." }, { status: 400 });
    }

    const firstPrefType = DEPT_TYPE_MAP[firstPreference as DeptSlug];

    if (!firstPrefType) {
      return NextResponse.json(
        { success: false, error: "Invalid department selection." },
        { status: 400 }
      );
    }

    // Verify department exists and is active
    const dept1 = await Department.findOne({ slug: firstPreference, isActive: true });

    if (!dept1) {
      return NextResponse.json(
        { success: false, error: "The selected department is not available." },
        { status: 400 }
      );
    }

    const application = await Application.create({
      userId: session.user.id,
      userEmail: session.user.email,
      cycleId: CYCLE_ID,
      firstPreference,
      firstPrefType,
      activePreference: "first",
      overallStatus: "in-progress",
      firstPrefProgress: { currentStage: 1, status: "active", stages: [] },
      secondPrefProgress: { currentStage: 1, status: "pending", stages: [] },
    });

    return NextResponse.json(
      {
        success: true,
        applicationId: application._id,
        firstPreference,
        message: "Application initiated. Proceed to Stage 1.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { code?: number; message?: string };
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "You have already applied for this recruitment cycle." },
        { status: 409 }
      );
    }
    console.error("apply/init error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
