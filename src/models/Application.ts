import mongoose, { Schema, Document, Model } from "mongoose";

export type DeptSlug =
  | "development"
  | "competitive-coding"
  | "ui-ux"
  | "ai-ml"
  | "cyber-security"
  | "design"
  | "management"
  | "entrepreneurship"
  | "content-media";

export type PrefType = "tech" | "non-tech";
export type StageResult = "pending" | "passed" | "failed";
export type OverallStatus =
  | "in-progress"
  | "selected"
  | "rejected"
  | "waitlisted";
export type PrefStatus = "active" | "passed" | "rejected" | "pending";

export interface IPanelistScore {
  interviewerEmail: string;
  scores: Record<string, number>;
  note?: string;
  createdAt: Date;
}

export interface StageSubmission {
  stage: number;
  submittedAt: Date;
  responses: Record<string, unknown>;
  scores?: Record<string, number>;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  result: StageResult;
  panelistScores?: IPanelistScore[];
}

export interface PrefProgress {
  currentStage: number;
  status: PrefStatus;
  stages: StageSubmission[];
}

export interface IApplication extends Document {
  userId: string;
  userEmail: string;
  cycleId: string;

  firstPreference: DeptSlug;
  firstPrefType: PrefType;
  secondPreference?: DeptSlug;
  secondPrefType?: PrefType;

  activePreference: "first" | "second";
  overallStatus: OverallStatus;

  firstPrefProgress: PrefProgress;
  secondPrefProgress: PrefProgress;

  createdAt: Date;
  updatedAt: Date;
}

const StageSubmissionSchema = new Schema<StageSubmission>(
  {
    stage: { type: Number, required: true },
    submittedAt: { type: Date, required: true },
    responses: { type: Schema.Types.Mixed, default: {} },
    scores: { type: Map, of: Number },
    panelistScores: [
      {
        interviewerEmail: { type: String, required: true },
        scores: { type: Map, of: Number },
        note: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    adminNote: { type: String },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    result: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },
  },
  { _id: false }
);

const PrefProgressSchema = new Schema<PrefProgress>(
  {
    currentStage: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["active", "passed", "rejected", "pending"],
      default: "active",
    },
    stages: { type: [StageSubmissionSchema], default: [] },
  },
  { _id: false }
);

const DEPT_SLUGS: DeptSlug[] = [
  "development",
  "competitive-coding",
  "ui-ux",
  "ai-ml",
  "cyber-security",
  "design",
  "management",
  "entrepreneurship",
  "content-media",
];

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: { type: String, required: true },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    cycleId: { type: String, required: true, default: "2026-27" },

    firstPreference: { type: String, enum: DEPT_SLUGS, required: true },
    firstPrefType: {
      type: String,
      enum: ["tech", "non-tech"],
      required: true,
    },
    secondPreference: { type: String, enum: DEPT_SLUGS, required: false },
    secondPrefType: {
      type: String,
      enum: ["tech", "non-tech"],
      required: false,
    },

    activePreference: {
      type: String,
      enum: ["first", "second"],
      default: "first",
    },
    overallStatus: {
      type: String,
      enum: ["in-progress", "selected", "rejected", "waitlisted"],
      default: "in-progress",
    },

    firstPrefProgress: { type: PrefProgressSchema, default: () => ({}) },
    secondPrefProgress: {
      type: PrefProgressSchema,
      default: () => ({ status: "pending", currentStage: 1, stages: [] }),
    },
  },
  { timestamps: true }
);

// One application per user per cycle
ApplicationSchema.index({ userId: 1, cycleId: 1 }, { unique: true });
ApplicationSchema.index({ userEmail: 1, cycleId: 1 });

const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
