import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmailLog extends Document {
  recipientEmail: string;
  senderEmail: string;
  subject: string;
  body: string;
  templateUsed?: string;
  status: "success" | "failed";
  errorDetails?: string;
  createdAt: Date;
}

const EmailLogSchema = new Schema<IEmailLog>(
  {
    recipientEmail: { type: String, required: true, index: true },
    senderEmail: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    templateUsed: { type: String },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
      index: true,
    },
    errorDetails: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const EmailLog: Model<IEmailLog> =
  mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>("EmailLog", EmailLogSchema);

export default EmailLog;
