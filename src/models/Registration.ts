import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRegistration extends Document {
  name: string;
  email: string;
  phone: string;
  role: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: Date;
}

const RegistrationSchema: Schema<IRegistration> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role selection is required"],
      enum: ["Frontend Developer", "Backend Developer", "UI/UX Designer", "Mobile Developer", "DevOps Engineer"],
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recreating the model in dev mode
const Registration: Model<IRegistration> =
  mongoose.models.Registration || mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
