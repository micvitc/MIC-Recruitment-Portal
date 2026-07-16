import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import RecruitmentCycle from "@/models/RecruitmentCycle";

export const dynamic = "force-dynamic";

const CYCLE_ID = "2026-27";

export async function GET() {
  const session = await auth();

  await dbConnect();
  
  const cycle = await RecruitmentCycle.findOne({ cycleId: CYCLE_ID }).lean();
  const cycleOpen = cycle?.isOpen ?? false;

  if (!session?.user?.id) {
    return NextResponse.json({
      success: true,
      application: null,
      cycleOpen,
      user: null,
    });
  }

  const application = await Application.findOne({ userId: session.user.id, cycleId: CYCLE_ID }).lean();

  if (!application) {
    return NextResponse.json({
      success: true,
      application: null,
      cycleOpen,
      user: session.user,
    });
  }

  return NextResponse.json({
    success: true,
    application,
    cycleOpen,
    user: session.user,
  });
}
