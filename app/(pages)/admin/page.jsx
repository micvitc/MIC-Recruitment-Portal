import React from "react";
import NavBar from "@/components/NavBar";
import { connect } from "@/lib/db";
import FormData from "@/lib/modals/form.modal";
import AdminContent from "@/components/AdminContent";
export default async function AdminPage() {
    await connect();

    const result = await FormData.find({});
    const applicants = result.map((doc) => {
        const applicant = doc.toObject();
        applicant._id = applicant._id.toString();
        return applicant;
    });

    return (
        <div>
            <NavBar />
            <AdminContent applicants={applicants} />
        </div>
    );
}
