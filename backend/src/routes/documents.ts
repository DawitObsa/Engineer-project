import { Router } from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { z } from "zod";
import { env } from "../config/env.js";
import { Document } from "../models/Document.js";
import { requireAuth, requireProjectAccess, requireRole } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/http.js";
import { recordAudit } from "../services/audit.js";

export const documentRouter = Router();
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => fs.mkdir(env.fileStoragePath, { recursive: true }, (error) => callback(error, env.fileStoragePath)),
    filename: (_req, file, callback) => { const extension = file.mimetype === "application/pdf" ? ".pdf" : file.mimetype === "image/png" ? ".png" : ".jpg"; callback(null, `${crypto.randomUUID()}${extension}`); },
  }),
  fileFilter: (_req, file, callback) => callback(null, allowedMimeTypes.has(file.mimetype)),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
});
const linksSchema = z.array(z.object({ entityType: z.string().min(1).max(80), entityId: z.string().min(1).max(80) })).default([]);

documentRouter.use(requireAuth);
documentRouter.get("/", asyncHandler(async (req, res) => { const projectId = String(req.query.projectId || ""); if (!projectId) throw new ApiError(400, "projectId is required"); if (!req.auth!.roles.includes("SUPER_ADMIN") && !req.auth!.projectIds.includes(projectId)) throw new ApiError(403, "You are not assigned to this project"); const documents = await Document.find({ projectId, isArchived: false }).select("-storagePath").sort({ createdAt: -1 }); res.json({ success: true, data: documents }); }));
// For multipart uploads, projectId must be present in the query string so access is checked before bytes reach disk.
documentRouter.post("/", requireProjectAccess, requireRole("CONTRACTOR", "ENGINEER", "EMPLOYER", "PROJECT_MANAGER", "SITE_INSPECTOR", "TECHNICAL_REVIEWER", "QUALITY_INSPECTOR", "ORGANIZATION_ADMIN", "SUPER_ADMIN"), upload.single("file"), asyncHandler(async (req, res) => { const projectId = String(req.query.projectId || ""); if (!req.file) throw new ApiError(400, "A PDF, JPEG or PNG file is required"); const links = linksSchema.parse(req.body.links ? JSON.parse(req.body.links) : []); const content = await fsp.readFile(req.file.path); const document = await Document.create({ originalName: path.basename(req.file.originalname), mimeType: req.file.mimetype, sizeBytes: req.file.size, storageKey: req.file.filename, storagePath: req.file.path, sha256: crypto.createHash("sha256").update(content).digest("hex"), projectId, organizationId: req.auth!.organizationId, uploadedBy: req.auth!.sub, links }); await recordAudit({ actorId: req.auth!.sub, organizationId: req.auth!.organizationId, projectId, action: "DOCUMENT_UPLOADED", entityType: "Document", entityId: document.id, ipAddress: req.ip }); res.status(201).json({ success: true, data: document.toObject({ transform: (_doc, record) => { delete record.storagePath; return record; } }) }); }));
documentRouter.get("/:documentId/download", asyncHandler(async (req, res) => { const document = await Document.findById(req.params.documentId).select("+storagePath"); if (!document || document.isArchived) throw new ApiError(404, "Document not found"); if (!req.auth!.roles.includes("SUPER_ADMIN") && !req.auth!.projectIds.includes(String(document.projectId))) throw new ApiError(403, "You are not assigned to this project"); if (!fs.existsSync(document.storagePath)) throw new ApiError(404, "Document content is unavailable"); await recordAudit({ actorId: req.auth!.sub, organizationId: req.auth!.organizationId, projectId: String(document.projectId), action: "DOCUMENT_DOWNLOADED", entityType: "Document", entityId: document.id, ipAddress: req.ip }); res.type(document.mimeType).download(document.storagePath, document.originalName); }));
documentRouter.patch("/:documentId/archive", requireRole("ENGINEER", "PROJECT_MANAGER", "ORGANIZATION_ADMIN", "SUPER_ADMIN"), asyncHandler(async (req, res) => { const document = await Document.findById(req.params.documentId); if (!document) throw new ApiError(404, "Document not found"); if (!req.auth!.roles.includes("SUPER_ADMIN") && !req.auth!.projectIds.includes(String(document.projectId))) throw new ApiError(403, "You are not assigned to this project"); document.isArchived = true; await document.save(); await recordAudit({ actorId: req.auth!.sub, organizationId: req.auth!.organizationId, projectId: String(document.projectId), action: "DOCUMENT_ARCHIVED", entityType: "Document", entityId: document.id, ipAddress: req.ip }); res.json({ success: true, data: { id: document.id, isArchived: true } }); }));
