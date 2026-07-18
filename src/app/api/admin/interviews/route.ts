import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import InterviewSlot from "@/models/InterviewSlot";

export async function GET(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
  }

  await dbConnect();

  try {
    const slots = await InterviewSlot.find({}).sort({ startTime: 1 });
    return NextResponse.json({ success: true, slots });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load slots.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const { slots } = body; // Array of slots, or a single slot object

    if (Array.isArray(slots)) {
      // Batch creation
      const createdSlots = await InterviewSlot.insertMany(
        slots.map((slot) => ({
          adminEmail: slot.adminEmail,
          deptSlug: slot.deptSlug,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          locationType: slot.locationType,
          locationDetails: slot.locationDetails,
          meetingLink: slot.locationType === "online" ? slot.meetingLink : undefined,
          status: "available",
        }))
      );
      return NextResponse.json({ success: true, count: createdSlots.length });
    } else {
      const { adminEmail, deptSlug, startTime, endTime, locationType, locationDetails, meetingLink } = body;

      if (!adminEmail || !deptSlug || !startTime || !endTime || !locationType || !locationDetails) {
        return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
      }

      const slot = await InterviewSlot.create({
        adminEmail,
        deptSlug,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        locationType,
        locationDetails,
        meetingLink: locationType === "online" ? meetingLink : undefined,
        status: "available",
      });

      return NextResponse.json({ success: true, slot });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create slot.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
