export type RecordStatus = "Approved" | "Under review" | "Pending decision" | "Action required" | "Open" | "Active" | "Draft" | "Rejected";
export type RegistryItem = { id: string; title: string; reference: string; status: RecordStatus; owner: string; due: string; detail?: string };

export const pilotProject = {
  name: "Tepi–Mizan Road Upgrading Project",
  code: "TM-RUP-01",
  location: "Southwest Ethiopia",
  length: "47.87 km",
  engineer: "Prominent Engineering Solutions",
  contractor: "Chiana Gezhouba Group Co., Ltd.",
  employer: "Ethiopian Roads Administration",
};

export const initialRecords: Record<string, RegistryItem[]> = {
  "Contracts": [
    { id: "CTR-001", title: "Original contract baseline", reference: "TM-RUP/CTR/01", status: "Approved", owner: "Ethiopian Roads Administration", due: "Completion date controlled", detail: "Baseline contract record. Approved time adjustments must be registered as separate decisions." },
  ],
  "EOT Claims": [
    { id: "EOT-07", title: "Extension of Time Claim No. 07", reference: "CGGC-PES-TM-[2026]-100", status: "Pending decision", owner: "Ethiopian Roads Administration", due: "Employer decision pending", detail: "Claimed extension: 536 calendar days. Interim engineer recommendation: 30 days." },
    { id: "EOT-07-SI", title: "Supplementary substantiation request", reference: "PES/TM/058/26", status: "Action required", owner: "Chiana Gezhouba Group", due: "Evidence response", detail: "Request issued 23 Oct 2026." },
  ],
  "Technical Submissions": [
    { id: "TS-041", title: "Beko Bridge arrangement revision", reference: "PES/TM/061/26", status: "Rejected", owner: "Chiana Gezhouba Group", due: "Revert to baseline", detail: "Proposed 16m + 18m + 16m arrangement not approved; previously conditionally accepted 2 × 25m baseline remains intact." },
    { id: "TS-042", title: "Detailed bridge investigation", reference: "TM-DES-042", status: "Under review", owner: "Technical reviewer", due: "18 Nov 2026" },
  ],
  "Equipment": [
    { id: "EQ-021", title: "Asphalt paver — availability record", reference: "EQ/TM/021", status: "Active", owner: "Chiana Gezhouba Group", due: "Utilization log required" },
    { id: "EQ-034", title: "Excavator — maintenance record", reference: "EQ/TM/034", status: "Under review", owner: "Plant manager", due: "Maintenance verification" },
  ],
  "Materials & Fuel": [
    { id: "MAT-017", title: "Diesel stock and availability register", reference: "FUEL/TM/017", status: "Action required", owner: "Contractor", due: "Stock evidence required", detail: "Fuel-related evidence is relevant to Claim No. 07 and must be reviewed separately from contractual entitlement." },
    { id: "MAT-023", title: "Sub-base material delivery", reference: "MAT/TM/023", status: "Under review", owner: "Quality inspector", due: "Test approval pending" },
  ],
  "Personnel & Mobilization": [
    { id: "ST-018", title: "Biruk Tamiru — Material Inspector", reference: "ERA/MPMO/TM/0028/2026", status: "Approved", owner: "Engineer", due: "Mobilization verified", detail: "No-objection letter dated 16 Oct 2026; notice dated 23 Oct 2026." },
    { id: "ST-019", title: "Edmealem Adamu — Work Inspector", reference: "ERA/MPMO/TM/0028/2026", status: "Under review", owner: "Employer", due: "Verify commencement" },
  ],
  "Construction Progress": [
    { id: "PR-1026", title: "October 2026 monthly progress report", reference: "TM-PR-1026", status: "Approved", owner: "Engineer", due: "Verified 06 Nov 2026", detail: "Planned: 3.50%. Actual: 2.10%." },
    { id: "PR-1126", title: "November 2026 look-ahead programme", reference: "TM-LA-1126", status: "Under review", owner: "Engineer", due: "15 Nov 2026" },
  ],
  "Recovery Programmes": [
    { id: "RP-001", title: "Recovery programme instruction", reference: "PES/TM/059/26", status: "Action required", owner: "Chiana Gezhouba Group", due: "7 calendar days from receipt", detail: "Programme, equipment, manpower, materials/fuel, critical activities, quality and monitoring required." },
  ],
  "Quality Control": [
    { id: "NCR-014", title: "Drainage workmanship observation", reference: "NCR-TM-014", status: "Open", owner: "Contractor", due: "20 Nov 2026" },
    { id: "INS-108", title: "Sub-base field inspection", reference: "IR-TM-108", status: "Under review", owner: "Quality inspector", due: "13 Nov 2026" },
  ],
  "Correspondence": [
    { id: "COR-058", title: "Request for supplementary substantiation", reference: "PES/TM/058/26", status: "Action required", owner: "Chiana Gezhouba Group", due: "Response outstanding" },
    { id: "COR-060", title: "Interim EOT recommendation", reference: "PES/TM/060/26", status: "Pending decision", owner: "Ethiopian Roads Administration", due: "Employer decision pending" },
    { id: "COR-061", title: "Beko Bridge design decision", reference: "PES/TM/061/26", status: "Approved", owner: "Engineer", due: "Issued 07 Nov 2026" },
  ],
  "User Management": [
    { id: "USR-001", title: "Abel Mekonnen", reference: "PES · ENGINEER", status: "Active", owner: "Prominent Engineering Solutions", due: "Assigned to TM-RUP-01" },
    { id: "USR-002", title: "Contractor document controller", reference: "CGGC · CONTRACTOR", status: "Active", owner: "Chiana Gezhouba Group", due: "Assigned to TM-RUP-01" },
  ],
};

export const progressActivities = [
  { name: "Subgrade", actual: 71.75, detail: "34.35 km" },
  { name: "Sub-base", actual: 59.95, detail: "28.70 km" },
  { name: "Base course", actual: 50.40, detail: "24.13 km" },
  { name: "Asphalt concrete", actual: 50.40, detail: "24.13 km" },
  { name: "Culverts", actual: 57.39, detail: "66 of 115" },
];

export const trendData = [
  { month: "Jun", planned: 57.1, actual: 54.5 },
  { month: "Jul", planned: 61.0, actual: 57.7 },
  { month: "Aug", planned: 65.2, actual: 62.2 },
  { month: "Sep", planned: 68.8, actual: 66.1 },
  { month: "Oct", planned: 72.3, actual: 71.04 },
];

export const auditEvents = [
  { action: "Interim EOT recommendation registered", actor: "Engineer workflow", when: "6 Nov 2026", kind: "EOT assessment" },
  { action: "Beko Bridge revision decision recorded", actor: "Technical reviewer", when: "7 Nov 2026", kind: "Technical submission" },
  { action: "October progress verification published", actor: "Site inspection team", when: "6 Nov 2026", kind: "Progress" },
  { action: "Recovery programme instruction issued", actor: "Project manager", when: "3 Nov 2026", kind: "Correspondence" },
];
