import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecruitmentCycle extends Document {
  cycleId: string;
  isOpen: boolean;
  openedAt: Date;
  closedAt?: Date;
  label: string;
  startAt?: Date;
  endAt?: Date;
}

const RecruitmentCycleSchema = new Schema<IRecruitmentCycle>(
  {
    cycleId: { type: String, required: true, unique: true },
    isOpen: { type: Boolean, default: false },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    label: { type: String, default: "MIC Recruitment 2026–27" },
    startAt: { type: Date },
    endAt: { type: Date },
  },
  { timestamps: true }
);

const RecruitmentCycle: Model<IRecruitmentCycle> =
  mongoose.models.RecruitmentCycle ||
  mongoose.model<IRecruitmentCycle>("RecruitmentCycle", RecruitmentCycleSchema);

export default RecruitmentCycle;
