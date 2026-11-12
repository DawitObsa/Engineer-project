import { Notification } from "../models/Notification.js";
import { User, roles } from "../models/User.js";
type Role = typeof roles[number];

export async function notifyProjectRoles(input: { projectId: string; roles: Role[]; type: string; title: string; message: string; entityType?: string; entityId?: string; dueAt?: Date }) {
  const recipients = await User.find({ projectIds: input.projectId, roles: { $in: input.roles }, isActive: true }).select("_id");
  if (!recipients.length) return;
  await Notification.insertMany(recipients.map((recipient) => ({ ...input, recipientId: recipient._id })));
}
