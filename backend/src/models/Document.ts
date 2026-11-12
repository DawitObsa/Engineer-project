import { Schema, model } from "mongoose";

const documentVersionSchema = new Schema({
  version: { type: Number, required: true, min: 1 },
  storageKey: { type: String, required: true },
  storagePath: { type: String, required: true, select: false },
  sha256: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, required: true },
}, { _id: false });

export const Document = model("Document", new Schema({
  originalName: { type: String, required: true, trim: true, maxlength: 240 },
  mimeType: { type: String, required: true, enum: ["application/pdf", "image/jpeg", "image/png"] },
  sizeBytes: { type: Number, required: true, min: 1, max: 20 * 1024 * 1024 },
  storageKey: { type: String, required: true, unique: true },
  storagePath: { type: String, required: true, select: false },
  sha256: { type: String, required: true, index: true },
  version: { type: Number, required: true, default: 1, min: 1 },
  priorVersions: { type: [documentVersionSchema], default: [] },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  links: [{ entityType: { type: String, required: true }, entityId: { type: String, required: true } }],
  isArchived: { type: Boolean, default: false, index: true },
}, { timestamps: true }).index({ projectId: 1, isArchived: 1, createdAt: -1 }));
