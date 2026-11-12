import { Schema, model } from "mongoose";

export const Project = model("Project", new Schema({
  name: { type: String, required: true, trim: true, maxlength: 180 },
  code: { type: String, required: true, trim: true, uppercase: true, unique: true },
  location: { type: String, required: true, trim: true },
  lengthKm: { type: Number, min: 0 },
  status: { type: String, enum: ["PLANNED", "ACTIVE", "SUSPENDED", "COMPLETED", "ARCHIVED"], default: "PLANNED", index: true },
  employerOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  contractorOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  engineerOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  originalCompletionDate: Date,
  currentApprovedCompletionDate: Date,
  isArchived: { type: Boolean, default: false, index: true },
}, { timestamps: true }));
