import bcrypt from "bcryptjs";
import { Schema, model, type InferSchemaType } from "mongoose";

export const roles = ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "CONTRACTOR", "ENGINEER", "EMPLOYER", "PROJECT_MANAGER", "SITE_INSPECTOR", "TECHNICAL_REVIEWER", "QUALITY_INSPECTOR", "READ_ONLY_AUDITOR"] as const;
const userSchema = new Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  passwordResetHash: { type: String, select: false },
  passwordResetExpiresAt: Date,
  passwordChangedAt: Date,
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  roles: [{ type: String, enum: roles, required: true }],
  projectIds: [{ type: Schema.Types.ObjectId, ref: "Project", index: true }],
  isActive: { type: Boolean, default: true },
  lastLoginAt: Date,
}, { timestamps: true });
userSchema.index({ organizationId: 1, isActive: 1 });
export type UserDocument = InferSchemaType<typeof userSchema> & { _id: string };
export const User = model("User", userSchema);
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, passwordHash: string) => bcrypt.compare(password, passwordHash);
