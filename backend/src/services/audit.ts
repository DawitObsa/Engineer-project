import { AuditLog } from "../models/AuditLog.js";

export function recordAudit(input: { actorId: string; organizationId: string; projectId?: string; action: string; entityType: string; entityId: string; ipAddress?: string; metadata?: object }) {
  return AuditLog.create(input);
}
