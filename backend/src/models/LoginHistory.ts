import { Schema, model } from "mongoose";

export const LoginHistory = model("LoginHistory", new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  emailAttempted: { type: String, required: true, lowercase: true, trim: true },
  outcome: { type: String, enum: ["SUCCESS", "FAILURE", "LOGOUT", "SESSION_REVOKED"], required: true },
  ipAddress: String,
  userAgent: { type: String, maxlength: 500 },
}, { timestamps: true }).index({ createdAt: -1 }));
