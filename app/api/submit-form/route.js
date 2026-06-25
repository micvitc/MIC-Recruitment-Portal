import { connect } from "@/lib/db";
import FormData from "@/lib/modals/form.modal";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    // Check authentication using headers
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session?.user) {
      return new Response(
        JSON.stringify({ message: "Authentication required" }),
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;



    // Check if user has VIT email
    if (!userEmail || !userEmail.endsWith("@vitstudent.ac.in")) {
      return new Response(
        JSON.stringify({
          message: "Only VIT students can submit applications",
        }),
        { status: 403 }
      );
    }

    await connect();
    const data = await req.json();

    // Separate department from questions
    const { Department, Questions, ...formFields } = data;

    // Check if user has already submitted to this department
    const existingSubmission = await FormData.findOne({
      Email: userEmail,
      Department: Department,
    });

    if (existingSubmission) {
      return new Response(
        JSON.stringify({
          message:
            "Remember that you can only submit upto 2 unique applications",
        }),
        { status: 400 }
      );
    }

    // Check total application count
    const totalApplications = await FormData.countDocuments({
      Email: userEmail,
    });

    if (totalApplications >= 2) {
      return new Response(
        JSON.stringify({
          message:
            "Remember that you can only submit upto 2 unique applications",
        }),
        { status: 400 }
      );
    }


    const newForm = new FormData({
      ...formFields,
      Department, // Add department to top level
      Questions, // Add questions to top level
    });

    await newForm.save();
    return new Response(
      JSON.stringify({
        message: "Form submitted successfully!",
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error submitting form" }),
      { status: 500 }
    );
  }
}
