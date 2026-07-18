import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import InterviewSlot from "@/models/InterviewSlot";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
  }

  await dbConnect();

  try {
    const slot = await InterviewSlot.findByIdAndDelete(id);
    if (!slot) {
      return NextResponse.json({ success: false, error: "Slot not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Slot deleted successfully.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to delete slot.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
