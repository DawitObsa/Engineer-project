import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { Organization } from "../models/Organization.js";
import { roles, User, hashPassword } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { recordAudit } from "../services/audit.js";

export const userRouter = Router();
export const organizationRouter = Router();
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ID");
const createUserSchema = z.object({ fullName: z.string().min(2).max(120), email: z.string().email(), password: z.string().min(12).max(128), organizationId: objectIdSchema, roles: z.array(z.enum(roles)).min(1), projectIds: z.array(objectIdSchema).default([]) });
const updateUserSchema = z.object({ roles: z.array(z.enum(roles)).min(1).optional(), projectIds: z.array(objectIdSchema).optional(), isActive: z.boolean().optional() });
const organizationSchema = z.object({ name: z.string().min(2).max(160), code: z.string().min(2).max(20), type: z.enum(["CONSULTANT", "CONTRACTOR", "EMPLOYER"]) });
userRouter.use(requireAuth);
userRouter.get("/", requireRole("SUPER_ADMIN", "ORGANIZATION_ADMIN"), asyncHandler(async (req, res) => { const filter = req.auth!.roles.includes("SUPER_ADMIN") ? {} : { organizationId: req.auth!.organizationId }; const users = await User.find(filter).select("-passwordHash").sort({ fullName: 1 }); res.json({ success: true, data: users }); }));
const elevatedRoles = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"];
userRouter.post("/", requireRole("SUPER_ADMIN", "ORGANIZATION_ADMIN"), asyncHandler(async (req, res) => { const input = createUserSchema.parse(req.body); if (!req.auth!.roles.includes("SUPER_ADMIN") && input.organizationId !== req.auth!.organizationId) throw new ApiError(403, "Organization administrators may manage only their own organization"); if (!req.auth!.roles.includes("SUPER_ADMIN") && input.roles.some((role) => elevatedRoles.includes(role))) throw new ApiError(403, "Only Super Admins may assign administrator roles"); const user = await User.create({ ...input, projectIds: input.projectIds.map((id) => new Types.ObjectId(id)), passwordHash: await hashPassword(input.password) }); await recordAudit({ actorId: req.auth!.sub, organizationId: req.auth!.organizationId, action: "USER_CREATED", entityType: "User", entityId: user.id, ipAddress: req.ip, metadata: { organizationId: input.organizationId, roles: input.roles } }); res.status(201).json({ success: true, data: { id: user.id, fullName: user.fullName, email: user.email, roles: user.roles, projectIds: user.projectIds, isActive: user.isActive } }); }));
userRouter.patch("/:userId", requireRole("SUPER_ADMIN", "ORGANIZATION_ADMIN"), asyncHandler(async (req, res) => { const input = updateUserSchema.parse(req.body); const user = await User.findById(req.params.userId); if (!user) throw new ApiError(404, "User not found"); if (!req.auth!.roles.includes("SUPER_ADMIN") && String(user.organizationId) !== req.auth!.organizationId) throw new ApiError(403, "Organization administrators may manage only their own organization"); if (!req.auth!.roles.includes("SUPER_ADMIN") && input.roles?.some((role) => elevatedRoles.includes(role))) throw new ApiError(403, "Only Super Admins may assign administrator roles"); if (String(user._id) === req.auth!.sub && input.isActive === false) throw new ApiError(409, "You cannot deactivate your own account"); if (input.roles) user.roles = input.roles; if (input.projectIds) user.projectIds = input.projectIds.map((id) => new Types.ObjectId(id)); if (input.isActive !== undefined) user.isActive = input.isActive; await user.save(); await recordAudit({ actorId: req.auth!.sub, organizationId: req.auth!.organizationId, action: "USER_UPDATED", entityType: "User", entityId: user.id, ipAddress: req.ip }); res.json({ success: true, data: { id: user.id, roles: user.roles, projectIds: user.projectIds, isActive: user.isActive } }); }));

organizationRouter.use(requireAuth);
organizationRouter.get("/", requireRole("SUPER_ADMIN", "ORGANIZATION_ADMIN"), asyncHandler(async (_req, res) => res.json({ success: true, data: await Organization.find({ isActive: true }).sort({ name: 1 }) })));
organizationRouter.post("/", requireRole("SUPER_ADMIN"), asyncHandler(async (req, res) => { const input = organizationSchema.parse(req.body); const organization = await Organization.create({ ...input, code: input.code.toUpperCase() }); await recordAudit({ actorId: req.auth!.sub, organizationId: req.auth!.organizationId, action: "ORGANIZATION_CREATED", entityType: "Organization", entityId: organization.id, ipAddress: req.ip }); res.status(201).json({ success: true, data: organization }); }));
