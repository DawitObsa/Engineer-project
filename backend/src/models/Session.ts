import { Schema, model } from "mongoose";

export const Session = model("Session", new Schema({
  tokenId: { type: String, required: true, unique: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  revokedAt: Date,
  ipAddress: String,
  userAgent: { type: String, maxlength: 500 },
}, { timestamps: true }).index({ userId: 1, revokedAt: 1 }));
