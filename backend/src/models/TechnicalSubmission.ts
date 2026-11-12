import { Schema, model } from "mongoose";

export const technicalStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "COMMENTS_ISSUED", "REVISION_REQUIRED", "RESUBMITTED", "CONDITIONALLY_ACCEPTED", "RECOMMENDED_FOR_APPROVAL", "EMPLOYER_APPROVAL_PENDING", "APPROVED", "REJECTED", "SUPERSEDED", "CLOSED"] as const;
export const TechnicalSubmission = model("TechnicalSubmission", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  contractorOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  discipline: { type: String, required: true, enum: ["ROAD", "BRIDGE", "DRAINAGE", "GEOTECHNICAL", "MATERIALS", "OTHER"] },
  title: { type: String, required: true, trim: true, maxlength: 500 },
  submissionReference: { type: String, required: true, trim: true, maxlength: 120 },
  contractorReference: { type: String, trim: true, maxlength: 120 },
  drawingNumbers: [{ type: String, maxlength: 120 }],
  revisionNumber: { type: String, required: true, trim: true, maxlength: 40 },
  submissionDate: { type: Date, required: true },
  documentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }],
  baselineSubmissionId: { type: Schema.Types.ObjectId, ref: "TechnicalSubmission" },
  status: { type: String, enum: technicalStatuses, default: "DRAFT", index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isArchived: { type: Boolean, default: false, index: true },
}, { timestamps: true }).index({ projectId: 1, submissionReference: 1, revisionNumber: 1 }, { unique: true }));

export const TechnicalReview = model("TechnicalReview", new Schema({
  submissionId: { type: Schema.Types.ObjectId, ref: "TechnicalSubmission", required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  decision: { type: String, enum: ["COMMENTS_ISSUED", "REVISION_REQUIRED", "CONDITIONALLY_ACCEPTED", "RECOMMENDED_FOR_APPROVAL", "APPROVED", "REJECTED"], required: true },
  comments: { type: String, required: true, maxlength: 8000 },
  requiredActions: { type: String, maxlength: 5000 },
  responseDeadline: Date,
  documentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }],
}, { timestamps: true }));
