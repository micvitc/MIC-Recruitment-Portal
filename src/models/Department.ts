import mongoose, { Schema, Document, Model } from "mongoose";

export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "url"
    | "number"
    | "email";
  placeholder?: string;
  options?: string[];
  required: boolean;
  maxLength?: number;
  helpText?: string;
}

export interface StageConfig {
  stage: number;
  title: string;
  description: string;
  formFields: FormField[];
}

export interface IDepartment extends Document {
  slug: string;
  name: string;
  type: "tech" | "non-tech";
  totalStages: number;
  stages: StageConfig[];
  isActive: boolean;
  maxCapacity: number;
  desc?: string;
  tagline?: string;
  description?: string;
  skills?: string;
  iconType?: string;
}

const FormFieldSchema = new Schema<FormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "text",
        "textarea",
        "select",
        "radio",
        "checkbox",
        "url",
        "number",
        "email",
      ],
      required: true,
    },
    placeholder: String,
    options: [String],
    required: { type: Boolean, default: true },
    maxLength: Number,
    helpText: String,
  },
  { _id: false }
);

const StageConfigSchema = new Schema<StageConfig>(
  {
    stage: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    formFields: { type: [FormFieldSchema], default: [] },
  },
  { _id: false }
);

const DepartmentSchema = new Schema<IDepartment>(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["tech", "non-tech"], required: true },
    totalStages: { type: Number, default: 2 },
    stages: { type: [StageConfigSchema], default: [] },
    isActive: { type: Boolean, default: true },
    maxCapacity: { type: Number, default: 20 },
    desc: String,
    tagline: String,
    description: String,
    skills: String,
    iconType: String,
  },
  { timestamps: true }
);

const Department: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
