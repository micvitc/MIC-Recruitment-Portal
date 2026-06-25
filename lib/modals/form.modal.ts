import mongoose, { Schema, Document } from "mongoose";

interface IFormData extends Document {
  Name: string;
  Email: string;
  RegistrationNumber : string;
  Phone: string;
  Reason: string;
  Projects?: string;
  Department: string;
  Questions: Map<string, string>;
  shortlisted: boolean; // Use lowercase consistently
}

const formDataSchema: Schema = new mongoose.Schema({
  Name: { type: String, required: true },
  Email: { type: String, required: true },
  RegistrationNumber: { type: String, required: true },
  Phone: { type: String, required: true },
  Reason: { type: String, required: true },
  Projects: { type: String, required: false },
  Department: { type: String, required: true },
  Questions: { type: Map, of: String },
  shortlisted: { type: Boolean, default: false },
});

export default mongoose.models.FormData || mongoose.model<IFormData>("FormData", formDataSchema);
