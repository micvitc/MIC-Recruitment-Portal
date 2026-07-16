import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import RecruitmentCycle from "@/models/RecruitmentCycle";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const cycle = await RecruitmentCycle.findOne({ cycleId: "2026-27" }).lean();
  return NextResponse.json({ success: true, cycle });
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { isOpen } = body;

  if (typeof isOpen !== "boolean") {
    return NextResponse.json({ success: false, error: "isOpen must be boolean." }, { status: 400 });
  }

  const cycle = await RecruitmentCycle.findOneAndUpdate(
    { cycleId: "2026-27" },
    {
      $set: {
        isOpen,
        ...(isOpen ? { openedAt: new Date() } : { closedAt: new Date() }),
      },
    },
    { new: true, upsert: true }
  );

  return NextResponse.json({
    success: true,
    cycle,
    message: `Recruitment is now ${isOpen ? "OPEN" : "CLOSED"}.`,
  });
}
