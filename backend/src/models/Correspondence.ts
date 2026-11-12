import { Schema, model } from "mongoose";

export const Correspondence = model("Correspondence", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  direction: { type: String, enum: ["INCOMING", "OUTGOING"], required: true },
  referenceNumber: { type: String, required: true, trim: true, maxlength: 120 },
  letterDate: { type: Date, required: true },
  senderOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  recipientOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  subject: { type: String, required: true, trim: true, maxlength: 500 },
  category: { type: String, required: true, enum: ["CONTRACT", "EOT", "TECHNICAL", "PROGRESS", "QUALITY", "ADMINISTRATION", "OTHER"] },
  responseDeadline: Date,
  replyReference: { type: String, trim: true, maxlength: 120 },
  documentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }],
  relatedRecords: [{ entityType: { type: String, required: true }, entityId: { type: String, required: true } }],
  status: { type: String, enum: ["OPEN", "REPLIED", "CLOSED", "ARCHIVED"], default: "OPEN", index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true }).index({ projectId: 1, referenceNumber: 1 }, { unique: true }));
