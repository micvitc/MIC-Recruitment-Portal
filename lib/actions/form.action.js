import { connect } from "@/lib/db";
import FormData from "@/lib/modals/form.modal";

export const submitFormAction = async (formData) => {
  try {
    // Connect to the database
    await connect();

    // Extract form data
    const {
      Name,
      Email,
      RegistrationNumber,
      Phone,
      Reason,
      Projects,
      ...Questions
    } = formData;

    // Create a new document using the FormData model
    const newFormData = new FormData({
      Name,
      Email,
      RegistrationNumber,
      Phone,
      Reason,
      Projects,
      Questions, // Store dynamic questions
    });

    // Save the document to MongoDB
    await newFormData.save();

    return {
      success: true,
      message: "Form submitted successfully!",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
