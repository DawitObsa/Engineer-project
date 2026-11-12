import { Schema, model } from "mongoose";

export const eotStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "SUPPLEMENTARY_INFORMATION_REQUESTED", "RESUBMITTED", "ASSESSMENT_IN_PROGRESS", "RECOMMENDED", "AWAITING_EMPLOYER_DECISION", "APPROVED", "PARTIALLY_APPROVED", "REJECTED", "WITHDRAWN", "CLOSED"] as const;

const claimHeadSchema = new Schema({ name: { type: String, required: true, maxlength: 160 }, claimedDays: { type: Number, required: true, min: 0 }, detail: { type: String, maxlength: 3000 } }, { _id: true });
const eventSchema = new Schema({ action: { type: String, required: true }, note: { type: String, maxlength: 5000 }, performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, performedAt: { type: Date, required: true }, documentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }] }, { _id: true });

export const EOTClaim = model("EOTClaim", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  contractorOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  claimNumber: { type: String, required: true, trim: true, maxlength: 60 },
  contractorReference: { type: String, required: true, trim: true, maxlength: 120 },
  claimDate: { type: Date, required: true },
  claimHeads: { type: [claimHeadSchema], default: [] },
  delayEvent: { type: String, required: true, maxlength: 3000 },
  delayStartDate: { type: Date, required: true },
  delayEndDate: { type: Date, required: true },
  claimedDays: { type: Number, required: true, min: 0 },
  clauseReference: { type: String, maxlength: 160 },
  affectedActivities: [{ type: String, maxlength: 160 }],
  mitigationMeasures: { type: String, maxlength: 5000 },
  concurrentDelay: { type: String, maxlength: 5000 },
  timeImpactAnalysis: { type: String, maxlength: 5000 },
  evidenceDocumentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }],
  status: { type: String, enum: eotStatuses, default: "DRAFT", index: true },
  history: { type: [eventSchema], default: [] },
  isArchived: { type: Boolean, default: false, index: true },
}, { timestamps: true }).index({ projectId: 1, claimNumber: 1 }, { unique: true }));

export const EOTAssessment = model("EOTAssessment", new Schema({
  claimId: { type: Schema.Types.ObjectId, ref: "EOTClaim", required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  stage: { type: String, enum: ["ENGINEER_ASSESSMENT", "INTERIM_RECOMMENDATION", "FINAL_RECOMMENDATION", "EMPLOYER_DECISION"], required: true },
  assessedDays: { type: Number, min: 0 },
  recommendedDays: { type: Number, min: 0 },
  approvedDays: { type: Number, min: 0 },
  determination: { type: String, enum: ["APPROVED", "PARTIALLY_APPROVED", "REJECTED", "NOT_APPLICABLE"], default: "NOT_APPLICABLE" },
  rationale: { type: String, required: true, maxlength: 8000 },
  documentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  supersedesAssessmentId: { type: Schema.Types.ObjectId, ref: "EOTAssessment" },
}, { timestamps: true }));
