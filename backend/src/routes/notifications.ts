import { Router } from "express";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/http.js";

export const notificationRouter = Router();
notificationRouter.use(requireAuth);
notificationRouter.get("/", asyncHandler(async (req, res) => { const unreadOnly = req.query.unread === "true"; const notifications = await Notification.find({ recipientId: req.auth!.sub, ...(unreadOnly ? { readAt: { $exists: false } } : {}) }).sort({ createdAt: -1 }).limit(100); res.json({ success: true, data: notifications }); }));
notificationRouter.patch("/:notificationId/read", asyncHandler(async (req, res) => { const notification = await Notification.findOneAndUpdate({ _id: req.params.notificationId, recipientId: req.auth!.sub }, { readAt: new Date() }, { new: true }); if (!notification) throw new ApiError(404, "Notification not found"); res.json({ success: true, data: notification }); }));
notificationRouter.patch("/read-all", asyncHandler(async (req, res) => { await Notification.updateMany({ recipientId: req.auth!.sub, readAt: { $exists: false } }, { readAt: new Date() }); res.status(204).send(); }));
