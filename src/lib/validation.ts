import { z } from "zod";
import type { FormField } from "@/models/Department";

export function validateResponses(
  formFields: FormField[],
  responses: Record<string, unknown>
): { data?: Record<string, unknown>; error?: string } {
  // Pre-process: trim strings, filter empty array values
  const cleanedResponses: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(responses ?? {})) {
    if (Array.isArray(val)) {
      const filtered = val
        .map(item => (typeof item === "string" ? item.trim() : item))
        .filter(item => item !== null && item !== undefined && item !== "");
      cleanedResponses[key] = filtered.length > 0 ? filtered : undefined;
    } else if (typeof val === "string") {
      const trimmed = val.trim();
      cleanedResponses[key] = trimmed === "" ? undefined : trimmed;
    } else {
      cleanedResponses[key] = val;
    }
  }

  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const field of formFields) {
    let fieldSchema: z.ZodTypeAny;

    // Base string schema — enforces min(1) only if required
    let strSchema = z.string();
    if (field.required) {
      strSchema = strSchema.min(1, `"${field.label}" is required.`);
    }

    // Detect field purpose by id/label keywords
    const id = field.id.toLowerCase();
    const label = field.label.toLowerCase();

    const isPhoneField =
      (field.type === "text" || field.type === "number") &&
      (id.includes("phone") || id.includes("mobile") ||
        label.includes("phone") || label.includes("mobile") || label.includes("contact"));

    const isGithubField =
      field.type === "url" &&
      (id.includes("github") || label.includes("github"));

    const isLinkedinField =
      field.type === "url" &&
      (id.includes("linkedin") || label.includes("linkedin"));

    if (isPhoneField) {
      // Phone: exactly 10 digits, no other characters allowed
      const phoneSchema = strSchema
        .regex(/^[0-9]{10}$/, `"${field.label}" must be exactly 10 digits with no spaces or special characters.`);
      fieldSchema = field.required
        ? phoneSchema
        : z.union([phoneSchema, z.literal(""), z.null(), z.undefined()]).optional();
    } else if (isGithubField) {
      // GitHub: must be a valid URL pointing to github.com or *.github.io
      let githubSchema = strSchema
        .max(2000, `"${field.label}" URL is too long.`)
        .url(`"${field.label}" must be a valid URL (e.g., https://github.com/username).`)
        .refine(val => {
          try {
            const url = new URL(val);
            return (
              url.hostname === "github.com" ||
              url.hostname.endsWith(".github.com") ||
              url.hostname.endsWith(".github.io")
            );
          } catch {
            return false;
          }
        }, `"${field.label}" must be a valid GitHub URL (e.g., https://github.com/username).`);

      const githubArraySchema = z.array(githubSchema);
      fieldSchema = field.required
        ? z.union([githubSchema, githubArraySchema.min(1, `"${field.label}" is required.`)])
        : z.union([githubSchema, githubArraySchema, z.literal(""), z.null(), z.undefined()]).optional();
    } else if (isLinkedinField) {
      // LinkedIn: must be a valid URL pointing to linkedin.com or lnkd.in
      let linkedinSchema = strSchema
        .max(2000, `"${field.label}" URL is too long.`)
        .url(`"${field.label}" must be a valid URL (e.g., https://linkedin.com/in/username).`)
        .refine(val => {
          try {
            const url = new URL(val);
            return (
              url.hostname === "linkedin.com" ||
              url.hostname.endsWith(".linkedin.com") ||
              url.hostname === "lnkd.in"
            );
          } catch {
            return false;
          }
        }, `"${field.label}" must be a valid LinkedIn URL (e.g., https://linkedin.com/in/username).`);

      const linkedinArraySchema = z.array(linkedinSchema);
      fieldSchema = field.required
        ? z.union([linkedinSchema, linkedinArraySchema.min(1, `"${field.label}" is required.`)])
        : z.union([linkedinSchema, linkedinArraySchema, z.literal(""), z.null(), z.undefined()]).optional();
    } else if (field.type === "url") {
      // Generic URL field
      let urlSchema = strSchema
        .max(2000, `"${field.label}" URL is too long.`)
        .url(`"${field.label}" must be a valid URL.`);
      const urlArraySchema = z.array(urlSchema);
      fieldSchema = field.required
        ? z.union([urlSchema, urlArraySchema.min(1, `"${field.label}" is required.`)])
        : z.union([urlSchema, urlArraySchema, z.literal(""), z.null(), z.undefined()]).optional();
    } else if (field.type === "checkbox") {
      const checkboxArraySchema = z.array(strSchema).min(field.required ? 1 : 0, `"${field.label}" is required.`);
      fieldSchema = field.required
        ? z.union([strSchema, checkboxArraySchema])
        : z.union([strSchema, checkboxArraySchema, z.literal(""), z.null(), z.undefined()]).optional();
    } else if (field.type === "email") {
      let emailSchema = strSchema
        .max(field.maxLength || 254, `"${field.label}" exceeds maximum length.`)
        .email(`"${field.label}" must be a valid email address.`);
      fieldSchema = field.required
        ? emailSchema
        : z.union([emailSchema, z.literal(""), z.null(), z.undefined()]).optional();
    } else {
      // text, textarea, select, radio, number
      fieldSchema = strSchema.max(
        field.maxLength || 5000,
        `"${field.label}" exceeds the maximum length of ${field.maxLength || 5000} characters.`
      );
      if (!field.required) {
        fieldSchema = z.union([fieldSchema, z.literal(""), z.null(), z.undefined()]).optional();
      }
    }

    schemaShape[field.id] = fieldSchema;
  }

  // z.object() strips unknown keys — prevents NoSQL injection/payload bloat
  const schema = z.object(schemaShape);
  const result = schema.safeParse(cleanedResponses);
  if (!result.success) {
    const err = result.error as z.ZodError;
    return { error: err.issues[0]?.message ?? "Validation failed." };
  }
  return { data: result.data };
}

// ─────────────────────────────────────────────────────────────────────────
// Admin and Recruitment Validation Schemas
// ─────────────────────────────────────────────────────────────────────────

export const emailBlastSchema = z.object({
  recipientType: z.enum(["test", "cohort"]),
  testEmail: z.string().email("Invalid test email address.").optional().nullable(),
  filters: z.object({
    status: z.string().optional(),
    department: z.string().optional(),
    stage: z.coerce.number().optional(),
    preference: z.enum(["first", "second", "active"]).optional(),
  }).optional().nullable(),
  subject: z.string().min(1, "Subject is required.").max(200, "Subject is too long."),
  body: z.string().min(1, "Body is required.").max(10000, "Body is too long."),
  templateType: z.string().optional().default("custom"),
});

const singleSlotSchema = z.object({
  adminEmail: z.string().email("Invalid admin email address."),
  deptSlug: z.string().min(1, "Department slug is required."),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  locationType: z.enum(["online", "offline"]),
  locationDetails: z.string().min(1, "Location details are required."),
  meetingLink: z.string().url("Invalid meeting link.").optional().nullable(),
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
}).refine(data => data.locationType !== "online" || !!data.meetingLink, {
  message: "Meeting link is required for online interviews.",
  path: ["meetingLink"],
});

export const interviewSlotInputSchema = z.union([
  z.object({
    slots: z.array(singleSlotSchema).min(1, "At least one slot must be provided."),
  }),
  singleSlotSchema,
]);

export const applyInitSchema = z.object({
  firstPreference: z.enum([
    "development",
    "competitive-coding",
    "ui-ux",
    "ai-ml",
    "cyber-security",
    "design",
    "management",
    "entrepreneurship",
    "content-media"
  ], {
    message: "Invalid department selection."
  }),
  _trap: z.string().optional().nullable(),
});

export const cycleUpdateSchema = z.object({
  isOpen: z.boolean({ message: "isOpen must be a boolean value." }),
  startAt: z.string().datetime({ message: "Invalid startAt date format." }).optional().nullable(),
  endAt: z.string().datetime({ message: "Invalid endAt date format." }).optional().nullable(),
});

