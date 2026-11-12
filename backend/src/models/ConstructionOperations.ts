import { Schema, model } from "mongoose";

export const WorkActivity = model("WorkActivity", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  code: { type: String, required: true, trim: true, maxlength: 40 },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  unit: { type: String, required: true, trim: true, maxlength: 20 },
  plannedQuantity: { type: Number, required: true, min: 0 },
  approvedWeight: { type: Number, required: true, min: 0, max: 100 },
  dependencies: [{ type: Schema.Types.ObjectId, ref: "WorkActivity" }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true }).index({ projectId: 1, code: 1 }, { unique: true }));

export const ProgressReport = model("ProgressReport", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  reportType: { type: String, enum: ["DAILY", "WEEKLY", "MONTHLY"], required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  submittedAt: { type: Date, required: true },
  status: { type: String, enum: ["DRAFT", "SUBMITTED", "VERIFIED", "RETURNED"], default: "DRAFT", index: true },
  submittedProgressPercent: { type: Number, min: 0, max: 100 },
  verifiedProgressPercent: { type: Number, min: 0, max: 100 },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  verifiedAt: Date,
  constraints: { type: String, maxlength: 5000 },
  remarks: { type: String, maxlength: 5000 },
}, { timestamps: true }).index({ projectId: 1, reportType: 1, periodStart: 1 }, { unique: true }));

export const ProgressEntry = model("ProgressEntry", new Schema({
  reportId: { type: Schema.Types.ObjectId, ref: "ProgressReport", required: true, index: true },
  activityId: { type: Schema.Types.ObjectId, ref: "WorkActivity", required: true, index: true },
  plannedQuantity: { type: Number, required: true, min: 0 },
  submittedQuantity: { type: Number, required: true, min: 0 },
  verifiedQuantity: { type: Number, min: 0 },
  measurementNote: { type: String, maxlength: 3000 },
}, { timestamps: true }).index({ reportId: 1, activityId: 1 }, { unique: true }));

export const Equipment = model("Equipment", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  category: { type: String, required: true, maxlength: 100 },
  identificationNumber: { type: String, required: true, trim: true, maxlength: 100 },
  ownership: { type: String, enum: ["CONTRACTOR", "HIRED", "OTHER"], required: true },
  condition: { type: String, enum: ["SERVICEABLE", "UNDER_MAINTENANCE", "BREAKDOWN", "UNSERVICEABLE"], default: "SERVICEABLE" },
  availability: { type: String, enum: ["AVAILABLE", "ALLOCATED", "UNAVAILABLE"], default: "AVAILABLE", index: true },
  assignedActivityId: { type: Schema.Types.ObjectId, ref: "WorkActivity" },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true }).index({ projectId: 1, identificationNumber: 1 }, { unique: true }));

export const EquipmentLog = model("EquipmentLog", new Schema({
  equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment", required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  logType: { type: String, enum: ["MOBILIZED", "DEMOBILIZED", "BREAKDOWN", "MAINTENANCE", "REPAIR", "UTILIZATION"], required: true },
  occurredAt: { type: Date, required: true },
  operatingHours: { type: Number, min: 0 },
  note: { type: String, maxlength: 3000 },
  recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true }));

export const Material = model("Material", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 180 },
  unit: { type: String, required: true, maxlength: 20 },
  minimumStock: { type: Number, min: 0, default: 0 },
  testStatus: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "NOT_REQUIRED"], default: "PENDING" },
  isFuel: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true }).index({ projectId: 1, name: 1 }, { unique: true }));

export const StockTransaction = model("StockTransaction", new Schema({
  materialId: { type: Schema.Types.ObjectId, ref: "Material", required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  transactionType: { type: String, enum: ["DELIVERY", "ISSUE", "ADJUSTMENT", "RETURN"], required: true },
  quantity: { type: Number, required: true, min: 0 },
  occurredAt: { type: Date, required: true },
  reference: { type: String, maxlength: 120 },
  note: { type: String, maxlength: 3000 },
  recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true }).index({ materialId: 1, occurredAt: 1 }));

export const RecoveryProgramme = model("RecoveryProgramme", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  reference: { type: String, required: true, maxlength: 120 },
  revision: { type: String, required: true, maxlength: 40 },
  submittedAt: { type: Date, required: true },
  status: { type: String, enum: ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "IMPLEMENTATION_VERIFIED", "CLOSED"], default: "DRAFT", index: true },
  verificationNote: { type: String, maxlength: 5000 },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true }).index({ projectId: 1, reference: 1, revision: 1 }, { unique: true }));

export const CorrectiveAction = model("CorrectiveAction", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  sourceType: { type: String, enum: ["RECOVERY", "QUALITY"], required: true },
  sourceId: { type: String, required: true },
  description: { type: String, required: true, maxlength: 5000 },
  responsibleOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["OPEN", "IN_PROGRESS", "VERIFIED", "CLOSED", "OVERDUE"], default: "OPEN", index: true },
  verificationNote: { type: String, maxlength: 5000 },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true }));

export const NonConformanceReport = model("NonConformanceReport", new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  reference: { type: String, required: true, maxlength: 120 },
  location: { type: String, required: true, maxlength: 300 },
  workSection: { type: String, maxlength: 200 },
  description: { type: String, required: true, maxlength: 5000 },
  severity: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"], required: true },
  responsibleOrganizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  dueDate: Date,
  status: { type: String, enum: ["OPEN", "CORRECTIVE_ACTION_IN_PROGRESS", "REINSPECTION_REQUESTED", "CLOSED"], default: "OPEN", index: true },
  photoDocumentIds: [{ type: Schema.Types.ObjectId, ref: "Document" }],
  issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true }).index({ projectId: 1, reference: 1 }, { unique: true }));
