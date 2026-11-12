import { Schema, model } from "mongoose";

export const Notification = model("Notification", new Schema({
  recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", index: true },
  type: { type: String, required: true, maxlength: 80 },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  entityType: { type: String, maxlength: 80 },
  entityId: { type: String, maxlength: 80 },
  dueAt: Date,
  readAt: Date,
}, { timestamps: true }).index({ recipientId: 1, readAt: 1, createdAt: -1 }));
