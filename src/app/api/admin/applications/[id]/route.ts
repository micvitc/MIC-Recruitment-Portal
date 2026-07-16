import { NextRequest, NextResponse } from "next/server";
import { sendStageUpdate } from "@/lib/mailer";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET — full application details
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // ── Auth guard ────────────────────────────────────────────────────────────
  const getSession = await auth();
  if (
    !getSession?.user ||
    (getSession.user as { role?: string }).role !== "admin"
  ) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  await dbConnect();

  const application = await Application.findById(id).lean();
  if (!application) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  // Enrich with dept names
  const [dept1, dept2] = await Promise.all([
    Department.findOne({ slug: (application as unknown as { firstPreference: string }).firstPreference }).lean(),
    Department.findOne({ slug: (application as unknown as { secondPreference: string }).secondPreference }).lean(),
  ]);

  return NextResponse.json({ success: true, application, dept1, dept2 });
}

// PATCH — advance or reject
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await auth();

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  await dbConnect();

  const body = await req.json();
  const { action, preference, note, scores } = body;

  if (!["advance", "reject"].includes(action) || !["first", "second"].includes(preference)) {
    return NextResponse.json({ success: false, error: "Invalid action or preference." }, { status: 400 });
  }
  // action: "advance" | "reject"
  // preference: "first" | "second"

  const application = await Application.findById(id);
  if (!application) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  const progressKey = preference === "first" ? "firstPrefProgress" : "secondPrefProgress";
  const deptSlug =
    preference === "first"
      ? application.firstPreference
      : application.secondPreference;

  const department = await Department.findOne({ slug: deptSlug });
  const progress =
    preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress;

  // Update the most recent stage's result
  const currentStageIdx = progress.stages.findIndex(
    (s) => s.stage === progress.currentStage
  );

  if (action === "advance") {
    const nextStage = progress.currentStage + 1;
    const isLastStage = nextStage > (department?.totalStages ?? 2);

    if (currentStageIdx !== -1) {
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].result = "passed";
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].reviewedBy =
        session?.user?.email ?? "admin";
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].reviewedAt = new Date();
      if (note) {
        (preference === "first"
          ? application.firstPrefProgress
          : application.secondPrefProgress).stages[currentStageIdx].adminNote = note;
      }
      if (scores) {
        (preference === "first"
          ? application.firstPrefProgress
          : application.secondPrefProgress).stages[currentStageIdx].scores = scores;
      }
    }

    if (isLastStage) {
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).status = "passed";
      application.overallStatus = "selected";
    } else {
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).currentStage = nextStage;
    }

    // Log advance action
    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      isLastStage ? "stage_select" : "stage_advance",
      application.userEmail,
      `Advanced ${preference} preference (${deptSlug}) to ${isLastStage ? "Selected" : "Stage " + (nextStage - 1)}.`
    );
  } else {
    // reject
    if (currentStageIdx !== -1) {
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].result = "failed";
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].reviewedBy =
        session?.user?.email ?? "admin";
      (preference === "first"
        ? application.firstPrefProgress
        : application.secondPrefProgress).stages[currentStageIdx].reviewedAt = new Date();
      if (note) {
        (preference === "first"
          ? application.firstPrefProgress
          : application.secondPrefProgress).stages[currentStageIdx].adminNote = note;
      }
    }
    (preference === "first"
      ? application.firstPrefProgress
      : application.secondPrefProgress).status = "rejected";

    // If rejected from first preference, activate second
    if (preference === "first") {
      application.activePreference = "second";
      application.secondPrefProgress.status = "active";
      // Second pref has just been activated, overall stays in-progress
    } else {
      // Rejected from second preference — check if both are now rejected
      if (application.firstPrefProgress.status === "rejected") {
        application.overallStatus = "rejected";
      }
    }

    // Log reject action
    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      session.user.email ?? "unknown",
      "candidate_reject",
      application.userEmail,
      `Rejected from ${preference} preference (${deptSlug}).`
    );
  }

  application.markModified(progressKey);
  await application.save();

  // Send email update in background
  sendStageUpdate(application.userEmail, action === "advance" ? "passed" : "rejected", note).catch(console.error);

  return NextResponse.json({
    success: true,
    message: `Applicant ${action === "advance" ? "advanced" : "rejected"} successfully.`,
  });
}
