import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Application from "@/models/Application";
import InterviewSlot from "@/models/InterviewSlot";
import { sendInterviewBookingConfirmation } from "@/lib/mailer";

export async function GET(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  await dbConnect();

  try {
    // 1. Fetch user's application
    const application = await Application.findOne({ userId: session.user.id, cycleId: "2026-27" });
    if (!application) {
      return NextResponse.json({ success: false, error: "No application found." }, { status: 404 });
    }

    const deptSlug = application.activePreference === "first" ? application.firstPreference : application.secondPreference;

    // 2. Fetch available slots for this dept or 'all'
    const availableSlots = await InterviewSlot.find({
      deptSlug: { $in: [deptSlug, "all"] },
      status: "available",
      startTime: { $gt: new Date() }, // only future slots
    }).sort({ startTime: 1 });

    // 3. Fetch candidate's current booking if any
    const currentBooking = await InterviewSlot.findOne({
      "bookedBy.userId": session.user.id,
      deptSlug: { $in: [deptSlug, "all"] },
      status: "booked",
    });

    return NextResponse.json({
      success: true,
      slots: availableSlots,
      currentBooking,
      deptSlug,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load candidate booking details.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Auth guard
  const session = await auth();
  if (!session?.user || !session.user.id) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }

  await dbConnect();

  try {
    const { slotId } = await req.json();
    if (!slotId) {
      return NextResponse.json({ success: false, error: "Slot ID is required." }, { status: 400 });
    }

    // 1. Get application
    const application = await Application.findOne({ userId: session.user.id, cycleId: "2026-27" });
    if (!application) {
      return NextResponse.json({ success: false, error: "No application found." }, { status: 404 });
    }

    const deptSlug = application.activePreference === "first" ? application.firstPreference : application.secondPreference;

    // 2. Check if new slot is available and valid
    const targetSlot = await InterviewSlot.findById(slotId);
    if (!targetSlot) {
      return NextResponse.json({ success: false, error: "Slot not found." }, { status: 404 });
    }

    if (targetSlot.status !== "available") {
      return NextResponse.json({ success: false, error: "Slot is no longer available." }, { status: 400 });
    }

    if (targetSlot.deptSlug !== "all" && targetSlot.deptSlug !== deptSlug) {
      return NextResponse.json({ success: false, error: "This slot is not for your department." }, { status: 400 });
    }

    // 3. Check if candidate already has a booked slot for this preference and release it
    const existingSlot = await InterviewSlot.findOne({
      "bookedBy.userId": session.user.id,
      deptSlug: { $in: [deptSlug, "all"] },
      status: "booked",
    });

    if (existingSlot) {
      existingSlot.status = "available";
      existingSlot.bookedBy = undefined;
      existingSlot.markModified("bookedBy");
      await existingSlot.save();
    }

    // 4. Book the new slot
    targetSlot.status = "booked";
    targetSlot.bookedBy = {
      userId: session.user.id,
      userEmail: session.user.email ?? application.userEmail,
      userName: session.user.name ?? undefined,
    };
    await targetSlot.save();

    // 5. Send confirmation email
    const timeStr = targetSlot.startTime.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    sendInterviewBookingConfirmation(
      session.user.email ?? application.userEmail,
      timeStr,
      targetSlot.locationDetails,
      targetSlot.locationType === "online",
      targetSlot.meetingLink
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Interview booked successfully.",
      slot: targetSlot,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to book slot.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
