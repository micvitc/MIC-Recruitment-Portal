import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import FormData from '@/lib/modals/form.modal';

export async function PATCH(req, { params }) {
    await connect();

    const { id } = params;
    const { shortlisted } = await req.json();

    console.log("API received data:", { id, shortlisted }); // Log the received data

    try {
        const applicant = await FormData.findByIdAndUpdate(
            id,
            { $set: { shortlisted } }, // Force update using $set to ensure the field is recognized
            { new: true }
        );
        if (!applicant) {
            console.log("Applicant not found.");
            return NextResponse.json({ success: false, message: 'Applicant not found' }, { status: 404 });
        }

        console.log("Applicant updated successfully:", applicant);
        return NextResponse.json({ success: true, data: applicant });
    } catch (error) {
        console.error("Error updating applicant:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
