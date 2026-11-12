import { Schema, model } from "mongoose";

export const AuditLog = model("AuditLog", new Schema({
  actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
  action: { type: String, required: true, maxlength: 120 },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  ipAddress: String,
}, { timestamps: true }));
