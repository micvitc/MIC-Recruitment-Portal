import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import Department from "@/models/Department";
import RecruitmentCycle from "@/models/RecruitmentCycle";

export async function GET(req: NextRequest) {
  // Check admin privileges
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 403 }
    );
  }

  await dbConnect();

  try {
    const [applications, departments, cycles] = await Promise.all([
      Application.find({}).lean(),
      Department.find({}).lean(),
      RecruitmentCycle.find({}).lean(),
    ]);

    const backupData = {
      applications,
      departments,
      cycles,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    // Return backup data as an attachment JSON download
    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename=mic_backup_${new Date().toISOString().split("T")[0]}.json`,
      },
    });
  } catch (err) {
    console.error("Backup failed:", err);
    return NextResponse.json(
      { success: false, error: "Database backup execution failed." },
      { status: 500 }
    );
  }
}
