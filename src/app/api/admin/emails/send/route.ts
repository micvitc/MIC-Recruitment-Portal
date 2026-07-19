import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import EmailLog from "@/models/EmailLog";
import nodemailer from "nodemailer";
import { emailBlastSchema } from "@/lib/validation";

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Competitive Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Content & Media",
};

function buildQuery(filters: any) {
  const query: any = {};

  if (filters.status) {
    query.overallStatus = filters.status;
  }

  const hasDept = !!filters.department;
  const hasStage = !!filters.stage;

  if (filters.preference === "first") {
    if (hasDept) query.firstPreference = filters.department;
    if (hasStage) query["firstPrefProgress.currentStage"] = filters.stage;
  } else if (filters.preference === "second") {
    if (hasDept) query.secondPreference = filters.department;
    if (hasStage) query["secondPrefProgress.currentStage"] = filters.stage;
  } else {
    // "active" or not specified
    if (hasDept || hasStage) {
      const activeFirstCond: any = { activePreference: "first" };
      const activeSecondCond: any = { activePreference: "second" };

      if (hasDept) {
        activeFirstCond.firstPreference = filters.department;
        activeSecondCond.secondPreference = filters.department;
      }
      if (hasStage) {
        activeFirstCond["firstPrefProgress.currentStage"] = filters.stage;
        activeSecondCond["secondPrefProgress.currentStage"] = filters.stage;
      }

      query.$or = [activeFirstCond, activeSecondCond];
    }
  }

  return query;
}

function interpolate(text: string, data: { email: string; preference: string; stage: string }) {
  return text
    .replace(/\{\{email\}\}/g, data.email)
    .replace(/\{\{preference\}\}/g, data.preference)
    .replace(/\{\{stage\}\}/g, data.stage);
}

function getHTMLWrapper(bodyContent: string) {
  return `
    <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #000; color: #f1f5f9; border: 4px solid #14b8a6;">
      <h2 style="color: #14b8a6; border-bottom: 2px solid #14b8a6; padding-bottom: 10px; margin-top: 0; text-transform: uppercase; letter-spacing: 2px;">MIC Recruitment</h2>
      <div style="margin: 20px 0; line-height: 1.6; font-size: 14px; white-space: pre-wrap; color: #e2e8f0;">
        ${bodyContent}
      </div>
      <div style="border-top: 1px solid #27272a; padding-top: 15px; font-size: 11px; color: #71717a; text-align: center;">
        This is an official communication from Microsoft Innovations Club (MIC) Core Team.
        <br/>Please do not reply directly to this automated email.
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpEmail || !smtpPassword) {
    return NextResponse.json(
      { success: false, error: "SMTP settings not configured on server." },
      { status: 500 }
    );
  }

  await dbConnect();

  try {
    const body = await req.json();
    const parseResult = emailBlastSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }
    const { recipientType, testEmail, filters, subject, body: emailBody, templateType } = parseResult.data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    const adminEmail = session.user.email ?? "admin@mic.org";

    // ─────────────────────────────────────────────────────────────────────────
    // Test Email Delivery Flow
    // ─────────────────────────────────────────────────────────────────────────
    if (recipientType === "test") {
      const targetTestEmail = testEmail || adminEmail;

      // Try finding a sample application to show resolved dynamic tags
      const sampleApp = await Application.findOne();
      const sampleDeptSlug = sampleApp
        ? (sampleApp.activePreference === "first" ? sampleApp.firstPreference : sampleApp.secondPreference)
        : "development";
      const sampleStage = sampleApp
        ? (sampleApp.activePreference === "first" ? sampleApp.firstPrefProgress.currentStage : sampleApp.secondPrefProgress.currentStage)
        : 1;

      const dynamicData = {
        email: targetTestEmail,
        preference: DEPT_NAMES[sampleDeptSlug || ""] || "Development",
        stage: String(sampleStage),
      };

      const resolvedSubject = interpolate(subject, dynamicData);
      const resolvedBody = interpolate(emailBody, dynamicData);
      const htmlBody = getHTMLWrapper(resolvedBody);

      try {
        await transporter.sendMail({
          from: `"MIC Recruitment" <${smtpEmail}>`,
          to: targetTestEmail,
          subject: resolvedSubject,
          html: htmlBody,
        });

        // Log the test send in the Email logs
        await EmailLog.create({
          recipientEmail: targetTestEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: `${templateType} (test)`,
          status: "success",
        });

        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${targetTestEmail}.`,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Send failed.";
        await EmailLog.create({
          recipientEmail: targetTestEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: `${templateType} (test)`,
          status: "failed",
          errorDetails: errorMsg,
        });

        return NextResponse.json(
          { success: false, error: `Failed sending test email: ${errorMsg}` },
          { status: 500 }
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cohort Batch Delivery Flow
    // ─────────────────────────────────────────────────────────────────────────
    const query = buildQuery(filters || {});
    const applicants = await Application.find(query);

    if (applicants.length === 0) {
      return NextResponse.json(
        { success: false, error: "No applicants found matching the selected filters." },
        { status: 404 }
      );
    }

    let successCount = 0;
    let failCount = 0;
    const failures: { email: string; error: string }[] = [];

    // Send emails sequentially (simple non-blocking loop with log writes)
    for (const applicant of applicants) {
      const deptSlug = applicant.activePreference === "first" ? applicant.firstPreference : applicant.secondPreference;
      const stage = applicant.activePreference === "first" ? applicant.firstPrefProgress.currentStage : applicant.secondPrefProgress.currentStage;

      const dynamicData = {
        email: applicant.userEmail,
        preference: DEPT_NAMES[deptSlug || ""] || "Development",
        stage: String(stage),
      };

      const resolvedSubject = interpolate(subject, dynamicData);
      const resolvedBody = interpolate(emailBody, dynamicData);
      const htmlBody = getHTMLWrapper(resolvedBody);

      try {
        await transporter.sendMail({
          from: `"MIC Recruitment" <${smtpEmail}>`,
          to: applicant.userEmail,
          subject: resolvedSubject,
          html: htmlBody,
        });

        await EmailLog.create({
          recipientEmail: applicant.userEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: templateType,
          status: "success",
        });

        successCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Send failed.";
        await EmailLog.create({
          recipientEmail: applicant.userEmail,
          senderEmail: adminEmail,
          subject: resolvedSubject,
          body: resolvedBody,
          templateUsed: templateType,
          status: "failed",
          errorDetails: errorMsg,
        });

        failures.push({ email: applicant.userEmail, error: errorMsg });
        failCount++;
      }
    }

    // Log the bulk admin action in the Audit Logs
    const { logAdminAction } = await import("@/lib/logger");
    await logAdminAction(
      adminEmail,
      "bulk_email_blast",
      `${applicants.length} targets`,
      `Sent ${successCount} successfully, ${failCount} failed. Filters: ${JSON.stringify(filters)}`
    );

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      failures,
      message: `Completed blast. Sent: ${successCount}. Failed: ${failCount}.`,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Internal error occurred.";
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
