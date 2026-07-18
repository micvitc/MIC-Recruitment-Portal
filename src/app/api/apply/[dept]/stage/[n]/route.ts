import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";
import { sendApplicationReceipt } from "@/lib/mailer";
import type { FormField } from "@/models/Department";

const CYCLE_ID = "2026-27";

interface RouteParams {
  params: Promise<{ dept: string; n: string }>;
}

import { z } from "zod";

function validateResponses(
  formFields: FormField[],
  responses: Record<string, unknown>
): { data?: Record<string, unknown>; error?: string } {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const field of formFields) {
    let fieldSchema: z.ZodTypeAny;

    if (field.type === "url") {
      const urlStr = z.string().url(`"${field.label}" must be a valid URL.`).max(2000, `"${field.label}" URL is too long.`);
      fieldSchema = z.union([urlStr, z.array(urlStr)]);
    } else if (field.type === "checkbox") {
      fieldSchema = z.union([z.string(), z.array(z.string())]);
    } else {
      fieldSchema = z.string().max(field.maxLength || 5000, `"${field.label}" exceeds the maximum length of ${field.maxLength || 5000} characters.`);
    }

    if (field.required) {
      if (field.type === "checkbox" || field.type === "url") {
        fieldSchema = z.union([
          z.string().min(1, `"${field.label}" is required.`),
          z.array(z.string().min(1, `"${field.label}" is required.`)).min(1, `"${field.label}" is required.`)
        ]);
      } else {
        fieldSchema = z.string().min(1, `"${field.label}" is required.`).max(field.maxLength || 5000, `"${field.label}" exceeds maximum length.`);
      }
    } else {
      // Optional fields can be undefined, null, or empty string
      fieldSchema = z.union([fieldSchema, z.literal(""), z.null(), z.undefined()]).optional();
    }

    schemaShape[field.id] = fieldSchema;
  }

  // Default z.object() strips any keys not defined in schemaShape, preventing NoSQL injection/bloat
  const schema = z.object(schemaShape);

  const result = schema.safeParse(responses);
  if (!result.success) {
    const err = result.error as z.ZodError;
    return { error: err.issues[0]?.message ?? "Validation failed." };
  }
  return { data: result.data };
}

// GET — fetch current user's status
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { dept, n } = await params;
  const stageNum = parseInt(n, 10);
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  await dbConnect();

  const [application, department] = await Promise.all([
    Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }),
    Department.findOne({ slug: dept }),
  ]);

  if (!application) {
    return NextResponse.json({ success: false, error: "No application found." }, { status: 404 });
  }
  if (!department) {
    return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
  }

  // Determine which preference this dept belongs to
  const isFirst = application.firstPreference === dept;
  const progress = isFirst ? application.firstPrefProgress : application.secondPrefProgress;
  const stageSubmission = progress.stages.find((s) => s.stage === stageNum);
  const stageConfig = department.stages.find((s) => s.stage === stageNum);

  return NextResponse.json({
    success: true,
    stageConfig,
    submission: stageSubmission ?? null,
    currentStage: progress.currentStage,
    status: progress.status,
  });
}

// POST — submit a stage
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { dept, n } = await params;
  const stageNum = parseInt(n, 10);

  if (isNaN(stageNum) || stageNum < 1) {
    return NextResponse.json({ success: false, error: "Invalid stage number." }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    const cycle = await RecruitmentCycle.findOne({ cycleId: CYCLE_ID });
    if (!cycle?.isOpen) {
      return NextResponse.json(
        { success: false, error: "Recruitment is currently closed." },
        { status: 403 }
      );
    }

    const [application, department] = await Promise.all([
      Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }),
      Department.findOne({ slug: dept }),
    ]);

    if (!application) {
      return NextResponse.json({ success: false, error: "No application found. Please start from /apply." }, { status: 404 });
    }
    if (!department) {
      return NextResponse.json({ success: false, error: "Department not found." }, { status: 404 });
    }

    const isFirst = application.firstPreference === dept;
    const isSecond = application.secondPreference === dept;

    if (!isFirst && !isSecond) {
      return NextResponse.json(
        { success: false, error: "This department is not in your preferences." },
        { status: 403 }
      );
    }

    const progress = isFirst
      ? application.firstPrefProgress
      : application.secondPrefProgress;

    // Must submit stages in order
    if (stageNum > progress.currentStage) {
      return NextResponse.json(
        { success: false, error: `You must complete Stage ${progress.currentStage} first.` },
        { status: 400 }
      );
    }

    // Cannot resubmit an already-reviewed stage
    const existingStage = progress.stages.find((s) => s.stage === stageNum);
    if (existingStage && existingStage.result !== "pending") {
      return NextResponse.json(
        { success: false, error: "This stage has already been reviewed and cannot be resubmitted." },
        { status: 409 }
      );
    }

    const stageConfig = department.stages.find((s) => s.stage === stageNum);
    if (!stageConfig) {
      return NextResponse.json({ success: false, error: "Stage configuration not found." }, { status: 404 });
    }

    const body = await req.json();
    const { responses, _trap } = body;

    if (_trap) {
      return NextResponse.json({ success: false, error: "Bad request." }, { status: 400 });
    }

    // Validate all required fields and strip unknown fields via Zod
    const validationResult = validateResponses(stageConfig.formFields, responses ?? {});
    if (validationResult.error) {
      return NextResponse.json({ success: false, error: validationResult.error }, { status: 400 });
    }
    const safeResponses = validationResult.data;

    // Build stage submission
    const submission = {
      stage: stageNum,
      submittedAt: new Date(),
      responses: safeResponses ?? {},
      result: "pending" as const,
    };

    const progressKey = isFirst ? "firstPrefProgress" : "secondPrefProgress";

    if (existingStage) {
      // Edit existing pending stage
      await Application.updateOne(
        { userId: session.user.id, cycleId: CYCLE_ID, [`${progressKey}.stages.stage`]: stageNum },
        {
          $set: {
            [`${progressKey}.stages.$.responses`]: safeResponses,
            [`${progressKey}.stages.$.submittedAt`]: new Date(),
          },
        }
      );
    } else {
      // Push new stage submission
      const nextStage = Math.max(progress.currentStage, stageNum + 1);
      const reachedMax = nextStage > department.totalStages;

      await Application.updateOne(
        { userId: session.user.id, cycleId: CYCLE_ID },
        {
          $push: { [`${progressKey}.stages`]: submission },
          $set: {
            [`${progressKey}.currentStage`]: reachedMax
              ? department.totalStages
              : nextStage,
          },
        }
      );

      // Send email receipt on initial application submission (stage 1)
      if (stageNum === 1) {
        // we use session.user.email, which requires adding email to session or fetching it.
        // wait, application model has userEmail
        sendApplicationReceipt(application.userEmail, department.name).catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stage ${stageNum} submitted successfully.`,
      nextStage: Math.min(stageNum + 1, department.totalStages),
      isLastStage: stageNum >= department.totalStages,
    });
  } catch (err) {
    console.error("stage submit error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT — edit an existing pending stage
export async function PUT(req: NextRequest, { params }: RouteParams) {
  // Same logic as POST but forces update of existing submission
  const { dept, n } = await params;
  const stageNum = parseInt(n, 10);

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await dbConnect();

    const cycle = await RecruitmentCycle.findOne({ cycleId: CYCLE_ID });
    if (!cycle?.isOpen) {
      return NextResponse.json(
        { success: false, error: "Recruitment is closed. Editing is no longer available." },
        { status: 403 }
      );
    }

    const [application, department] = await Promise.all([
      Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }),
      Department.findOne({ slug: dept }),
    ]);

    if (!application || !department) {
      return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
    }

    const isFirst = application.firstPreference === dept;
    const progress = isFirst ? application.firstPrefProgress : application.secondPrefProgress;
    const progressKey = isFirst ? "firstPrefProgress" : "secondPrefProgress";

    const existingStage = progress.stages.find((s) => s.stage === stageNum);
    if (!existingStage) {
      return NextResponse.json({ success: false, error: "Stage not yet submitted. Use POST." }, { status: 400 });
    }
    if (existingStage.result !== "pending") {
      return NextResponse.json(
        { success: false, error: "This stage has been reviewed and cannot be edited." },
        { status: 409 }
      );
    }

    const stageConfig = department.stages.find((s) => s.stage === stageNum);
    if (!stageConfig) {
      return NextResponse.json({ success: false, error: "Stage config not found." }, { status: 404 });
    }

    const body = await req.json();
    const { responses, _trap } = body;
    if (_trap) return NextResponse.json({ success: false, error: "Bad request." }, { status: 400 });

    // Validate responses and strip unknown fields
    const validationResult = validateResponses(stageConfig.formFields, responses ?? {});
    if (validationResult.error) {
      return NextResponse.json({ success: false, error: validationResult.error }, { status: 400 });
    }
    const safeResponses = validationResult.data;

    await Application.updateOne(
      { userId: session.user.id, cycleId: CYCLE_ID, [`${progressKey}.stages.stage`]: stageNum },
      {
        $set: {
          [`${progressKey}.stages.$.responses`]: safeResponses,
          [`${progressKey}.stages.$.submittedAt`]: new Date(),
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: "Stage updated successfully.",
      nextStage: Math.min(stageNum + 1, department.totalStages),
      isLastStage: stageNum >= department.totalStages,
    });
  } catch (err) {
    console.error("stage edit error:", err);
    return NextResponse.json({ success: false, error: "An unexpected error occurred." }, { status: 500 });
  }
}
