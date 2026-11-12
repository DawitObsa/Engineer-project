import { Router } from "express";
import { Correspondence } from "../models/Correspondence.js";
import { EOTClaim } from "../models/EOT.js";
import { NonConformanceReport, ProgressReport } from "../models/ConstructionOperations.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError, asyncHandler } from "../utils/http.js";

export const reportRouter = Router();
reportRouter.use(requireAuth);
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
reportRouter.get("/project-status.csv", asyncHandler(async (req, res) => {
  const projectId = String(req.query.projectId || "");
  if (!projectId) throw new ApiError(400, "projectId is required");
  if (!req.auth!.roles.includes("SUPER_ADMIN") && !req.auth!.projectIds.includes(projectId)) throw new ApiError(403, "You are not assigned to this project");
  const [claims, progress, ncrs, correspondence] = await Promise.all([
    EOTClaim.find({ projectId, isArchived: false }).lean(),
    ProgressReport.find({ projectId }).lean(),
    NonConformanceReport.find({ projectId }).lean(),
    Correspondence.find({ projectId }).lean(),
  ]);
  const rows = ["Module,Record,Reference,Status,Date,Detail"];
  claims.forEach((claim) => rows.push(["EOT", claim.claimNumber, claim.contractorReference, claim.status, claim.claimDate, `${claim.claimedDays} claimed days`].map(csvCell).join(",")));
  progress.forEach((report) => rows.push(["Progress", report.reportType, report.id, report.status, report.periodEnd, `${report.verifiedProgressPercent ?? ""}% verified`].map(csvCell).join(",")));
  ncrs.forEach((ncr) => rows.push(["Quality", ncr.reference, ncr.location, ncr.status, ncr.dueDate ?? "", ncr.description].map(csvCell).join(",")));
  correspondence.forEach((letter) => rows.push(["Correspondence", letter.subject, letter.referenceNumber, letter.status, letter.letterDate, letter.category].map(csvCell).join(",")));
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="icpcas-${projectId}-status.csv"`);
  res.send(rows.join("\n"));
}));

reportRouter.get("/project-status.html", asyncHandler(async (req, res) => {
  const projectId = String(req.query.projectId || "");
  if (!projectId) throw new ApiError(400, "projectId is required");
  if (!req.auth!.roles.includes("SUPER_ADMIN") && !req.auth!.projectIds.includes(projectId)) throw new ApiError(403, "You are not assigned to this project");
  const [claims, progress, ncrs, correspondence] = await Promise.all([EOTClaim.countDocuments({ projectId, isArchived: false }), ProgressReport.countDocuments({ projectId }), NonConformanceReport.countDocuments({ projectId }), Correspondence.countDocuments({ projectId })]);
  const safeProjectId = projectId.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  res.type("html").send(`<!doctype html><html><head><meta charset="utf-8"><title>ICPCAS project status</title><style>body{font:14px Arial;color:#14213d;margin:40px}table{border-collapse:collapse;width:100%;max-width:760px}td,th{border:1px solid #dce3eb;padding:10px;text-align:left}th{background:#f3f6fa}@media print{button{display:none}}</style></head><body><button onclick="print()">Print / Save as PDF</button><h1>ICPCAS Project Status</h1><p>Project: ${safeProjectId}</p><p>Generated: ${new Date().toISOString()}</p><table><tr><th>Module</th><th>Record count</th></tr><tr><td>EOT claims</td><td>${claims}</td></tr><tr><td>Progress reports</td><td>${progress}</td></tr><tr><td>NCRs</td><td>${ncrs}</td></tr><tr><td>Correspondence</td><td>${correspondence}</td></tr></table></body></html>`);
}));
