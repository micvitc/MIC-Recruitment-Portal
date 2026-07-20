import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Department from "@/models/Department";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const departments = await Department.find({ isActive: true }).lean();

    // Map departments to their UI props
    const formattedQuests = departments.map((d) => ({
      slug: d.slug,
      title: d.name.toUpperCase(),
      name: d.name,
      type: d.type,
      desc: d.desc ?? "",
      subtitle: d.desc ?? "",
      tagline: d.tagline ?? "",
      description: d.description ?? "",
      skills: d.skills ?? "",
      iconType: d.iconType ?? "dev",
      role: d.name,
      stage1Open: d.stageToggles ? (d.stageToggles["1"] !== false) : true,
    }));

    const techQuests = formattedQuests.filter((q) => q.type === "tech");
    const nonTechQuests = formattedQuests.filter((q) => q.type === "non-tech");

    return NextResponse.json({
      success: true,
      title: "Recruitments",
      subtitle: "CHOOSE THE QUEST SUITS YOU THE MOST",
      techQuests,
      nonTechQuests,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to load recruitments configuration.";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
