import mongoose from "mongoose";
import { env, validateEnvironment } from "./config/env.js";
import { Organization } from "./models/Organization.js";
import { User, hashPassword } from "./models/User.js";
import { Project } from "./models/Project.js";
import { EOTClaim } from "./models/EOT.js";
import { Correspondence } from "./models/Correspondence.js";
import { StaffProposal } from "./models/Personnel.js";
import { TechnicalSubmission } from "./models/TechnicalSubmission.js";

if (process.env.ALLOW_SAMPLE_SEED !== "true") throw new Error("Refusing to seed. Set ALLOW_SAMPLE_SEED=true explicitly.");
const password = process.env.SEED_ADMIN_PASSWORD || "";
if (password.length < 12) throw new Error("Set SEED_ADMIN_PASSWORD to a unique password of at least 12 characters.");
validateEnvironment();
await mongoose.connect(env.mongoUri);
if (await Project.exists({})) throw new Error("Refusing to seed a non-empty database. Use a dedicated development database.");

const [pes, cggc, era] = await Organization.create([
  { name: "Prominent Engineering Solutions (SAMPLE)", code: "PES", type: "CONSULTANT" },
  { name: "Chiana Gezhouba Group Co., Ltd. (SAMPLE)", code: "CGGC", type: "CONTRACTOR" },
  { name: "Ethiopian Roads Administration (SAMPLE)", code: "ERA", type: "EMPLOYER" },
]);
const project = await Project.create({ name: "Tepi–Mizan Road Upgrading Project (SAMPLE)", code: "TM-RUP-01", location: "Southwest Ethiopia", lengthKm: 47.87, status: "ACTIVE", employerOrganizationId: era._id, contractorOrganizationId: cggc._id, engineerOrganizationId: pes._id });
const admin = await User.create({ fullName: "Sample PES Administrator", email: "admin@pes.example", passwordHash: await hashPassword(password), organizationId: pes._id, roles: ["SUPER_ADMIN", "ENGINEER"], projectIds: [project._id] });
await EOTClaim.create({ projectId: project._id, contractorOrganizationId: cggc._id, claimNumber: "07", contractorReference: "CGGC-PES-TM-[2026]-100", claimDate: new Date("2026-08-24"), claimHeads: [{ name: "Diesel shortage", claimedDays: 88 }], delayEvent: "Historical document-derived sample claim. Verify source records before use.", delayStartDate: new Date("2026-01-01"), delayEndDate: new Date("2026-06-20"), claimedDays: 536, status: "AWAITING_EMPLOYER_DECISION", history: [{ action: "SAMPLE_IMPORT", note: "Interim recommendation 30 calendar days; final Employer decision pending in reviewed letter.", performedBy: admin._id, performedAt: new Date("2026-11-06") }] });
await Correspondence.create({ projectId: project._id, direction: "OUTGOING", referenceNumber: "PES/TM/060/26", letterDate: new Date("2026-11-06"), senderOrganizationId: pes._id, recipientOrganizationId: era._id, subject: "Interim EOT recommendation (SAMPLE)", category: "EOT", status: "OPEN", createdBy: admin._id });
await StaffProposal.create([{ projectId: project._id, contractorOrganizationId: cggc._id, fullName: "Biruk Tamiru", position: "Material Inspector", proposalReference: "ERA/MPMO/TM/0028/2026", noObjectionReference: "ERA/MPMO/TM/0028/2026", noObjectionDate: new Date("2026-10-16"), status: "NO_OBJECTION_RECEIVED", history: [{ action: "SAMPLE_IMPORT", note: "Historical sample; actual commencement must be verified separately.", performedBy: admin._id, performedAt: new Date("2026-10-23") }], createdBy: admin._id }, { projectId: project._id, contractorOrganizationId: cggc._id, fullName: "Edmealem Adamu", position: "Work Inspector", proposalReference: "ERA/MPMO/TM/0028/2026", noObjectionReference: "ERA/MPMO/TM/0028/2026", noObjectionDate: new Date("2026-10-16"), status: "MOBILIZATION_NOTIFIED", history: [{ action: "SAMPLE_IMPORT", note: "Historical sample; notice is not proof of actual commencement.", performedBy: admin._id, performedAt: new Date("2026-10-23") }], createdBy: admin._id }]);
await TechnicalSubmission.create({ projectId: project._id, contractorOrganizationId: cggc._id, discipline: "BRIDGE", title: "Beko Bridge arrangement revision (SAMPLE)", submissionReference: "PES/TM/061/26", revisionNumber: "R1", submissionDate: new Date("2026-11-07"), status: "REJECTED", createdBy: admin._id });
console.log("Sample pilot data created. It is historical, document-derived sample data—not current verified project status.");
await mongoose.disconnect();
