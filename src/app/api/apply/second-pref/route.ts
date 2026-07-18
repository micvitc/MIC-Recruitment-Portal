import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import type { DeptSlug, PrefType } from "@/models/Application";

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
    const application = await Application.findOne({
      userId: session.user.id,
      cycleId: CYCLE_ID,
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found. Please select your 1st preference first." },
        { status: 404 }
      );
    }

    if (application.secondPreference) {
      return NextResponse.json(
        { success: false, error: "You have already selected your 2nd preference." },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { secondPreference, _trap } = body;

    // Honeypot check
    if (_trap) {
      return NextResponse.json({ success: false, error: "Bad request." }, { status: 400 });
    }

    if (!secondPreference) {
      return NextResponse.json(
        { success: false, error: "Second preference is required." },
        { status: 400 }
      );
    }

    if (application.firstPreference === secondPreference) {
      return NextResponse.json(
        { success: false, error: "First and second preferences cannot be the same department." },
        { status: 400 }
      );
    }

    const secondPrefType = DEPT_TYPE_MAP[secondPreference as DeptSlug];

    if (!secondPrefType) {
      return NextResponse.json(
        { success: false, error: "Invalid department selection." },
        { status: 400 }
      );
    }

    if (application.firstPrefType === secondPrefType) {
      return NextResponse.json(
        {
          success: false,
          error: `You already chose a ${application.firstPrefType} department. Your 2nd preference must be ${application.firstPrefType === "tech" ? "non-tech" : "tech"}.`,
        },
        { status: 400 }
      );
    }

    // Verify department exists and is active
    const dept = await Department.findOne({ slug: secondPreference, isActive: true });

    if (!dept) {
      return NextResponse.json(
        { success: false, error: "The selected department is not available." },
        { status: 400 }
      );
    }

    application.secondPreference = secondPreference;
    application.secondPrefType = secondPrefType;
    application.secondPrefProgress = { currentStage: 1, status: "pending", stages: [] };
    
    await application.save();

    return NextResponse.json(
      {
        success: true,
        applicationId: application._id,
        secondPreference,
        message: "Second preference saved. Proceed to Stage 1.",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("apply/second-pref error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
