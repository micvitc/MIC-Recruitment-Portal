import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import FormData from "@/lib/modals/form.modal";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export async function GET(req) {
  try {
    // Check authentication using headers
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;
    
    // Check if user has VIT email
    if (!userEmail || !userEmail.endsWith("@vitstudent.ac.in")) {
      return NextResponse.json(
        { message: "Only VIT students can check applications" },
        { status: 403 }
      );
    }
    
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { message: "Email is required" },
      { status: 400 }
    );
  }

    await connect();
    const count = await FormData.countDocuments({
      Email: email,
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error checking applications:", error);
    return NextResponse.json(
      {
        message:
          "Internal server error inside check-applications dir",
      },
      { status: 500 }
    );
  }
}
