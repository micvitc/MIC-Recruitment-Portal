import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";

interface RouteParams {
  params: Promise<{ dept: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { dept } = await params;
  await dbConnect();
  const department = await Department.findOne({ slug: dept }).lean();
  if (!department) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ success: true, department });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { dept } = await params;
  await dbConnect();
  const body = await req.json();

  // Only allow safe fields to be updated
  const { stages, totalStages, isActive, maxCapacity } = body;

  const update: Record<string, unknown> = {};
  if (stages !== undefined) update.stages = stages;
  if (totalStages !== undefined) update.totalStages = totalStages;
  if (isActive !== undefined) update.isActive = isActive;
  if (maxCapacity !== undefined) update.maxCapacity = maxCapacity;

  const department = await Department.findOneAndUpdate(
    { slug: dept },
    { $set: update },
    { new: true }
  );

  if (!department) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, department });
}
