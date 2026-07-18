import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import nodemailer from "nodemailer";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }

  const smtpEmail = process.env.SMTP_EMAIL;
  const smtpPassword = process.env.SMTP_PASSWORD;

  const isConfigured = !!(smtpEmail && smtpPassword);

  if (!isConfigured) {
    return NextResponse.json({
      success: true,
      configured: false,
      status: "Missing SMTP credentials in environment variables.",
      smtpEmail: smtpEmail || null,
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpEmail,
        pass: smtpPassword,
      },
    });

    // Run connection verify check (timeout after 5 seconds to prevent hanging)
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP connection timeout")), 5000)
    );

    await Promise.race([verifyPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      configured: true,
      status: "Connected successfully",
      smtpEmail,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "SMTP connection failed.";
    return NextResponse.json({
      success: true,
      configured: true,
      status: `Failed: ${errorMsg}`,
      smtpEmail,
    });
  }
}
