import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { Project } from "../models/Project.js";
import { Organization } from "../models/Organization.js";
import { User } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { requireAuth, requireProjectAccess, requireRole } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/http.js";

export const projectRouter = Router();
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid ID");
const projectSchema = z.object({
  name: z.string().trim().min(3).max(180),
  code: z.string().trim().min(2).max(30),
  location: z.string().trim().min(2).max(180),
  lengthKm: z.number().nonnegative().optional(),
  employerOrganizationId: objectIdSchema,
  contractorOrganizationId: objectIdSchema,
  engineerOrganizationId: objectIdSchema,
});

projectRouter.use(requireAuth);
projectRouter.get("/", asyncHandler(async (req, res) => {
  const projectFilter = req.auth!.roles.includes("SUPER_ADMIN")
    ? {}
    : req.auth!.roles.includes("ORGANIZATION_ADMIN")
      ? { $or: [
        { engineerOrganizationId: req.auth!.organizationId },
        { contractorOrganizationId: req.auth!.organizationId },
        { employerOrganizationId: req.auth!.organizationId },
      ] }
      : { _id: { $in: req.auth!.projectIds } };
  const projects = await Project.find({ ...projectFilter, isArchived: false }).sort({ createdAt: -1 });
  res.json({ success: true, data: projects });
}));

projectRouter.post("/", requireRole("SUPER_ADMIN", "ORGANIZATION_ADMIN"), asyncHandler(async (req, res) => {
  const input = projectSchema.parse(req.body);
  const organizationIds = [input.employerOrganizationId, input.contractorOrganizationId, input.engineerOrganizationId];
  const organizations = await Organization.find({ _id: { $in: organizationIds }, isActive: true }).select("_id type");
  if (organizations.length !== new Set(organizationIds).size) throw new ApiError(400, "All participating organizations must exist and be active");
  const organizationById = new Map(organizations.map((organization) => [String(organization._id), organization]));
  if (organizationById.get(input.employerOrganizationId)?.type !== "EMPLOYER"
    || organizationById.get(input.contractorOrganizationId)?.type !== "CONTRACTOR"
    || organizationById.get(input.engineerOrganizationId)?.type !== "CONSULTANT") {
    throw new ApiError(400, "Select an Employer, Contractor, and Consultant/Engineer organization for the project");
  }
  if (!req.auth!.roles.includes("SUPER_ADMIN") && !organizationIds.includes(req.auth!.organizationId)) {
    throw new ApiError(403, "Organization administrators may create projects only for their organization");
  }

  const project = await Project.create({
    ...input,
    code: input.code.toUpperCase(),
    status: "PLANNED",
  });
  await User.updateOne({ _id: req.auth!.sub }, { $addToSet: { projectIds: project._id } });
  await AuditLog.create({
    actorId: req.auth!.sub,
    organizationId: req.auth!.organizationId,
    projectId: project._id,
    action: "PROJECT_CREATED",
    entityType: "Project",
    entityId: project.id,
    ipAddress: req.ip,
  });
  res.status(201).json({ success: true, data: project });
}));

projectRouter.get("/:projectId", requireProjectAccess, asyncHandler(async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.projectId)) throw new ApiError(404, "Project not found");
  const project = await Project.findOne({ _id: req.params.projectId, isArchived: false });
  if (!project) throw new ApiError(404, "Project not found");
  if (req.auth!.roles.includes("ORGANIZATION_ADMIN")
    && !req.auth!.roles.includes("SUPER_ADMIN")
    && ![project.engineerOrganizationId, project.contractorOrganizationId, project.employerOrganizationId].some((id) => String(id) === req.auth!.organizationId)) {
    throw new ApiError(403, "Your organization is not assigned to this project");
  }
  res.json({ success: true, data: project });
}));
