import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Session } from "../models/Session.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/http.js";
import { roles, User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Types } from "mongoose";

export type AuthClaims = { sub: string; organizationId: string; roles: typeof roles[number][]; projectIds: string[]; jti: string };
declare global { namespace Express { interface Request { auth?: AuthClaims } } }
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return next(new ApiError(401, "Authentication is required"));
  let claims: { sub: string; jti: string };
  try {
    const verified = jwt.verify(token, env.jwtSecret, { issuer: "icpcas-api" });
    if (typeof verified === "string" || typeof verified.sub !== "string" || typeof verified.jti !== "string") {
      throw new ApiError(401, "Invalid session claims");
    }
    claims = { sub: verified.sub, jti: verified.jti };
  } catch (error) {
    return next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired session"));
  }
  Promise.all([
    Session.exists({ tokenId: claims.jti, userId: claims.sub, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } }),
    User.findById(claims.sub).select("organizationId roles projectIds isActive"),
  ]).then(([activeSession, user]) => {
    if (!activeSession || !user?.isActive) return next(new ApiError(401, "Session is no longer active"));
    req.auth = {
      sub: String(user._id),
      organizationId: String(user.organizationId),
      roles: user.roles as AuthClaims["roles"],
      projectIds: user.projectIds.map(String),
      jti: claims.jti,
    };
    next();
  }).catch((error: unknown) => next(error));
}
export function requireRole(...allowed: typeof roles[number][]) { return (req: Request, _res: Response, next: NextFunction) => { if (!req.auth?.roles.some((role) => allowed.includes(role))) return next(new ApiError(403, "Your assigned role is not permitted to perform this action")); next(); }; }
export function requireProjectAccess(req: Request, _res: Response, next: NextFunction) {
  const projectId = String(req.params.projectId || req.body.projectId || req.query.projectId || "");
  if (req.auth?.roles.includes("SUPER_ADMIN") || req.auth?.projectIds.includes(projectId)) return next();
  if (!req.auth?.roles.includes("ORGANIZATION_ADMIN") || !Types.ObjectId.isValid(projectId)) {
    return next(new ApiError(403, "You are not assigned to this project"));
  }
  Project.exists({
    _id: projectId,
    $or: [
      { engineerOrganizationId: req.auth.organizationId },
      { contractorOrganizationId: req.auth.organizationId },
      { employerOrganizationId: req.auth.organizationId },
    ],
  }).then((isOrganizationProject) => {
    if (!isOrganizationProject) return next(new ApiError(403, "Your organization is not assigned to this project"));
    next();
  }).catch((error: unknown) => next(error));
}
