import { Schema, model } from "mongoose";

export const staffStatuses = ["DRAFT", "PROPOSED", "UNDER_REVIEW", "CLARIFICATION_REQUESTED", "NO_OBJECTION_RECEIVED", "MOBILIZATION_NOTIFIED", "MOBILIZED_VERIFIED", "ACTIVE", "REPLACED", "DEMOBILIZED", "REJECTED"] as const;
const personnelEventSchema = new Schema({ action: { type: String, required: true }, note: { type: String, maxlength: 4000 }, performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, performedAt: { type: Date, required: true }, documentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }] }, { _id: true });

export const StaffProposal = model("StaffProposal", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  contractorOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  fullName: { type: String, required: true, trim: true, maxlength: 140 },
  position: { type: String, required: true, trim: true, maxlength: 120 },
  qualificationSummary: { type: String, maxlength: 5000 },
  proposalReference: { type: String, required: true, trim: true, maxlength: 120 },
  cvDocumentId: { type: Schema.Types.ObjectId, ref: "Document" },
  noObjectionReference: { type: String, trim: true, maxlength: 120 },
  noObjectionDate: Date,
  plannedMobilizationDate: Date,
  actualCommencementDate: Date,
  status: { type: String, enum: staffStatuses, default: "DRAFT", index: true },
  history: { type: [personnelEventSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isArchived: { type: Boolean, default: false, index: true },
}, { timestamps: true }).index({ projectId: 1, proposalReference: 1 }, { unique: true }));
