import { connect } from "@/lib/db";
import FormData from "@/lib/modals/form.modal";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request) {
    try {
        // Check authentication using headers
    const session = await auth.api.getSession({
        headers: await headers()
      });
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: "Authentication required" }),
          { status: 401 }
        );
      }

    const user = session.user;

    const userEmail = user.email;
    if (!userEmail || !userEmail.endsWith("@vitstudent.ac.in")) {
      return new Response(
        JSON.stringify({ error: "Only VIT students can check submissions" }),
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const department = searchParams.get("department");

    if (!email || !department) {
        return new Response(
            JSON.stringify({ error: "Missing email or department" }),
            { status: 400 }
        );
    }

    if (email !== userEmail) {
        return new Response(
          JSON.stringify({ error: "You can only check your own submissions" }),
          { status: 403 }
        );
      }
      
        await connect();
        const count = await FormData.countDocuments({
            Email: email,
            Department: department,
        });

        return new Response(
            JSON.stringify({ submitted: count > 0 }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Database query failed" }),
            { status: 500 }
        );
    }
}
