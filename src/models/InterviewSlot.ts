import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInterviewSlot extends Document {
  adminEmail: string;
  deptSlug: string; // 'all' or department slug (e.g. 'development')
  startTime: Date;
  endTime: Date;
  status: "available" | "booked" | "completed" | "cancelled";
  locationType: "offline" | "online";
  locationDetails: string; // Room location (offline) or Google Meet link details (online)
  bookedBy?: {
    userId: string;
    userEmail: string;
    userName?: string;
  };
  meetingLink?: string; // Stored specifically if online
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSlotSchema = new Schema<IInterviewSlot>(
  {
    adminEmail: { type: String, required: true },
    deptSlug: { type: String, required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["available", "booked", "completed", "cancelled"],
      default: "available",
      index: true,
    },
    locationType: {
      type: String,
      enum: ["offline", "online"],
      required: true,
    },
    locationDetails: { type: String, required: true },
    bookedBy: {
      userId: { type: String },
      userEmail: { type: String },
      userName: { type: String },
    },
    meetingLink: { type: String },
  },
  { timestamps: true }
);

// Prevent an interviewer from having overlapping slots
InterviewSlotSchema.index({ adminEmail: 1, startTime: 1 }, { unique: true });

const InterviewSlot: Model<IInterviewSlot> =
  mongoose.models.InterviewSlot ||
  mongoose.model<IInterviewSlot>("InterviewSlot", InterviewSlotSchema);

export default InterviewSlot;
