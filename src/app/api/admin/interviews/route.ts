import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import InterviewSlot from "@/models/InterviewSlot";
import { interviewSlotInputSchema } from "@/lib/validation";

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
    const parseResult = interviewSlotInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, error: parseResult.error.issues[0]?.message || "Validation failed." }, { status: 400 });
    }
    const validatedData = parseResult.data;

    if ("slots" in validatedData) {
      // Batch creation
      const createdSlots = await InterviewSlot.insertMany(
        validatedData.slots.map((slot) => ({
          adminEmail: slot.adminEmail,
          deptSlug: slot.deptSlug,
          startTime: slot.startTime,
          endTime: slot.endTime,
          locationType: slot.locationType,
          locationDetails: slot.locationDetails,
          meetingLink: slot.locationType === "online" ? slot.meetingLink : undefined,
          status: "available",
        }))
      );
      return NextResponse.json({ success: true, count: createdSlots.length });
    } else {
      const { adminEmail, deptSlug, startTime, endTime, locationType, locationDetails, meetingLink } = validatedData;

      const slot = await InterviewSlot.create({
        adminEmail,
        deptSlug,
        startTime,
        endTime,
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
