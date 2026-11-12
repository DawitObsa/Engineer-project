import { Schema, model } from "mongoose";

export const Organization = model("Organization", new Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 160 },
  code: { type: String, required: true, trim: true, unique: true, uppercase: true, maxlength: 20 },
  type: { type: String, enum: ["CONSULTANT", "CONTRACTOR", "EMPLOYER"], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true }));
