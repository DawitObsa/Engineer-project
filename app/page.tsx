"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity, AlertTriangle, Archive, ArrowDownToLine, Bell, BookOpen, BriefcaseBusiness,
  Check, ClipboardCheck, Clock3, FileBarChart, FileText, Gauge,
  LayoutDashboard, LogOut, Package, Plus, Search, Settings, ShieldCheck,
  SlidersHorizontal, Users, Wrench, X, type LucideIcon
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { auditEvents, initialRecords, pilotProject, progressActivities, trendData, type RecordStatus, type RegistryItem } from "../lib/data";
import { apiBaseUrl, createOrganization, createProject, createUser, getCurrentUser, getOrganizations, getProjects, getUsers, loginWithApi, logoutWithApi, type ManagedOrganization, type ManagedProject, type ManagedUser } from "../lib/api";

type View = "Dashboard" | "Projects" | "Contracts" | "Construction Progress" | "EOT Claims" | "Personnel & Mobilization" | "Technical Submissions" | "Equipment" | "Materials & Fuel" | "Recovery Programmes" | "Quality Control" | "Correspondence" | "Reports" | "User Management" | "Audit Logs" | "Settings";
type SessionRole = "SUPER_ADMIN" | "ORGANIZATION_ADMIN" | "CONTRACTOR" | "ENGINEER" | "EMPLOYER" | "PROJECT_MANAGER" | "SITE_INSPECTOR" | "TECHNICAL_REVIEWER" | "QUALITY_INSPECTOR" | "READ_ONLY_AUDITOR";
const sessionRoles: SessionRole[] = ["SUPER_ADMIN", "ORGANIZATION_ADMIN", "CONTRACTOR", "ENGINEER", "EMPLOYER", "PROJECT_MANAGER", "SITE_INSPECTOR", "TECHNICAL_REVIEWER", "QUALITY_INSPECTOR", "READ_ONLY_AUDITOR"];
const adminRoles: SessionRole[] = ["SUPER_ADMIN", "ORGANIZATION_ADMIN"];
const allViews = new Set<View>(["Dashboard", "Projects", "Contracts", "Construction Progress", "EOT Claims", "Personnel & Mobilization", "Technical Submissions", "Equipment", "Materials & Fuel", "Recovery Programmes", "Quality Control", "Correspondence", "Reports", "User Management", "Audit Logs", "Settings"]);
const roleViews: Record<SessionRole, Set<View>> = {
  SUPER_ADMIN: allViews,
  ORGANIZATION_ADMIN: allViews,
  ENGINEER: new Set(["Dashboard", "Projects", "Contracts", "Construction Progress", "EOT Claims", "Personnel & Mobilization", "Technical Submissions", "Equipment", "Materials & Fuel", "Recovery Programmes", "Quality Control", "Correspondence", "Reports"]),
  CONTRACTOR: new Set(["Dashboard", "Projects", "Contracts", "Construction Progress", "EOT Claims", "Personnel & Mobilization", "Technical Submissions", "Equipment", "Materials & Fuel", "Recovery Programmes", "Quality Control", "Correspondence", "Reports"]),
  EMPLOYER: new Set(["Dashboard", "Projects", "Contracts", "Construction Progress", "EOT Claims", "Personnel & Mobilization", "Technical Submissions", "Quality Control", "Correspondence", "Reports"]),
  PROJECT_MANAGER: new Set(["Dashboard", "Projects", "Contracts", "Construction Progress", "EOT Claims", "Personnel & Mobilization", "Technical Submissions", "Equipment", "Materials & Fuel", "Recovery Programmes", "Quality Control", "Correspondence", "Reports"]),
  SITE_INSPECTOR: new Set(["Dashboard", "Projects", "Construction Progress", "Quality Control", "Correspondence", "Reports"]),
  TECHNICAL_REVIEWER: new Set(["Dashboard", "Projects", "Technical Submissions", "Correspondence", "Reports"]),
  QUALITY_INSPECTOR: new Set(["Dashboard", "Projects", "Construction Progress", "Quality Control", "Correspondence", "Reports"]),
  READ_ONLY_AUDITOR: new Set(["Dashboard", "Projects", "Reports", "Audit Logs"]),
};

const navGroups: { label: string; items: { name: View; icon: LucideIcon }[] }[] = [
  { label: "WORKSPACE", items: [{ name: "Dashboard", icon: LayoutDashboard }, { name: "Projects", icon: BriefcaseBusiness }, { name: "Contracts", icon: FileText }] },
  { label: "PROJECT DELIVERY", items: [{ name: "Construction Progress", icon: Gauge }, { name: "EOT Claims", icon: Clock3 }, { name: "Personnel & Mobilization", icon: Users }, { name: "Technical Submissions", icon: ClipboardCheck }, { name: "Equipment", icon: Wrench }, { name: "Materials & Fuel", icon: Package }, { name: "Recovery Programmes", icon: Activity }, { name: "Quality Control", icon: ShieldCheck }, { name: "Correspondence", icon: BookOpen }] },
  { label: "GOVERNANCE", items: [{ name: "Reports", icon: FileBarChart }, { name: "User Management", icon: Users }, { name: "Audit Logs", icon: Archive }, { name: "Settings", icon: Settings }] },
];

const openViews: View[] = ["Contracts", "EOT Claims", "Personnel & Mobilization", "Technical Submissions", "Construction Progress", "Equipment", "Materials & Fuel", "Recovery Programmes", "Quality Control", "Correspondence", "User Management"];
const descriptions: Partial<Record<View, string>> = {
  Projects: "Project workspace, parties and controlled project records.",
  Contracts: "Contract baseline, milestones and controlled amendments.",
  "Construction Progress": "Submitted and independently verified construction quantities.",
  "EOT Claims": "Contractual time claims with preserved review and decision history.",
  "Personnel & Mobilization": "Staff proposals, no-objections and verified mobilization records.",
  "Technical Submissions": "Design submissions, review comments and controlled baselines.",
  Equipment: "Plant availability, maintenance and utilization by work activity.",
  "Materials & Fuel": "Transaction-based stock, delivery and fuel monitoring.",
  "Recovery Programmes": "Corrective programmes tracked separately from implementation evidence.",
  "Quality Control": "Inspections, NCRs, defects and corrective action verification.",
  Correspondence: "Controlled incoming and outgoing project correspondence.",
  Reports: "Generate role-authorized exports from recorded project data.",
  "User Management": "Organization membership, role assignments and project access.",
  "Audit Logs": "Immutable activity history for controlled project records.",
  Settings: "Project configuration and data governance settings.",
};

const statusTone = (status: RecordStatus) => {
  if (["Approved", "Active"].includes(status)) return "green";
  if (["Action required", "Rejected"].includes(status)) return "red";
  if (["Under review", "Pending decision", "Open"].includes(status)) return "amber";
  return "gray";
};

function Logo() { return <div className="brand"><div className="brandmark">IC</div><div><h1>ICPCAS</h1><p>PROJECT CONTROL SYSTEM</p></div></div>; }

function Sidebar({ view, setView, onSignOut, roles, profileName, projectName }: { view: View; setView: (view: View) => void; onSignOut: () => void; roles: SessionRole[]; profileName: string; projectName: string }) {
  const canView = (name: View) => roles.some((role) => roleViews[role].has(name));
  const groups = navGroups.map((group) => ({ ...group, items: group.items.filter(({ name }) => canView(name)) })).filter((group) => group.items.length > 0);
  const initials = profileName.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
  return <aside className="sidebar"><Logo /><div className="project-mini">ACTIVE PROJECT<strong>{projectName || "No authorized project"}</strong></div>{groups.map((group) => <div key={group.label}><p className="nav-label">{group.label}</p><nav className="nav">{group.items.map(({ name, icon: Icon }) => <button key={name} className={view === name ? "active" : ""} onClick={() => setView(name)}><Icon />{name}</button>)}</nav></div>)}<div className="nav-spacer" /><div className="profile-mini"><div className="avatar">{initials}</div><div><strong>{profileName}</strong><span>{roles.map((role) => role.replaceAll("_", " ")).join(", ")}</span></div><button className="close" aria-label="Sign out" onClick={onSignOut}><LogOut size={15} /></button></div></aside>;
}

function Status({ status }: { status: RecordStatus }) { return <span className={`badge ${statusTone(status)}`}>{status}</span>; }

function Dashboard({ setView, profileName }: { setView: (view: View) => void; profileName: string }) {
  return <>
    <div className="page-header"><div><p className="eyebrow">Portfolio overview · sample pilot data</p><h1 className="page-title">Good morning, {profileName.split(/\s+/)[0] || "there"}</h1><p className="page-subtitle">Here is the latest verified position for Tepi–Mizan Road Upgrading Project.</p></div><span className="sample"><AlertTriangle size={13} />Historical, document-derived sample records — verify before relying on them.</span></div>
    <div className="metric-grid">
      <Metric label="Verified progress" value="71.04%" note="October 2026 verified value" icon={Gauge} tone="blue" />
      <Metric label="EOT claims pending" value="1" note="Employer decision outstanding" icon={Clock3} tone="amber" />
      <Metric label="Open quality actions" value="1" note="Corrective action due 20 Nov" icon={ShieldCheck} tone="red" />
      <Metric label="Staff mobilization" value="1 / 2" note="One commencement to verify" icon={Users} tone="green" />
    </div>
    <div className="content-grid">
      <section className="card"><div className="card-head"><div><h2 className="card-title">Planned versus verified progress</h2><p className="card-meta">Cumulative physical progress · June–October 2026</p></div><button className="linkish" onClick={() => setView("Construction Progress")}>Open register</button></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData} margin={{ top: 10, left: -22, right: 8, bottom: 0 }}><defs><linearGradient id="actual" x1="0" x2="0" y1="0" y2="1"><stop offset="5%" stopColor="#286bd7" stopOpacity={.22}/><stop offset="95%" stopColor="#286bd7" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="#e9edf3" strokeDasharray="3 3" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#778398", fontSize: 11 }} /><YAxis domain={[45, 80]} axisLine={false} tickLine={false} tick={{ fill: "#778398", fontSize: 10 }} tickFormatter={(v) => `${v}%`} /><Tooltip formatter={(value: number) => [`${value}%`]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} /><Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} /><Area type="monotone" name="Verified actual" dataKey="actual" stroke="#2364d2" strokeWidth={2.3} fill="url(#actual)" /><Area type="monotone" name="Planned" dataKey="planned" stroke="#af7a18" strokeWidth={2} strokeDasharray="5 4" fill="transparent" /></AreaChart></ResponsiveContainer></div><div className="stat-strip"><div><span>October plan</span><strong>3.50%</strong></div><div><span>October actual</span><strong>2.10%</strong></div><div><span>Variance</span><strong className="down">−1.40 pp</strong></div></div></section>
      <section className="card"><div className="card-head"><div><h2 className="card-title">Attention required</h2><p className="card-meta">Items needing follow-up</p></div><button className="linkish" onClick={() => setView("EOT Claims")}>View all</button></div><div className="timeline"><TimelineItem title="Employer decision awaited" copy="Interim EOT recommendation PES/TM/060/26 remains pending." date="EOT Claim 07" /><TimelineItem title="Recovery programme required" copy="Submit the instructed plan and evidence of implementation." date="PES/TM/059/26" warn /><TimelineItem title="Bridge baseline to be retained" copy="Proposed Beko Bridge revision was not approved." date="PES/TM/061/26" /></div></section>
    </div>
    <div className="content-grid">
      <section className="card"><div className="card-head"><div><h2 className="card-title">Activity completion</h2><p className="card-meta">Measured quantities against project corridor</p></div><button className="linkish" onClick={() => setView("Construction Progress")}>Details</button></div><div className="progress-list">{progressActivities.map((activity) => <div className="prog-row" key={activity.name}><span>{activity.name}<span className="subcopy">{activity.detail}</span></span><div className="bar"><span style={{ width: `${activity.actual}%` }} /></div><b>{activity.actual.toFixed(1)}%</b></div>)}</div></section>
      <section className="card"><div className="card-head"><div><h2 className="card-title">Controlled record status</h2><p className="card-meta">Current sample register</p></div></div><div className="kpi-note"><Status status="Pending decision" /> <b style={{ marginLeft: 7 }}>1 EOT claim</b><br/><span>Employer authorization must be recorded before a completion date is revised.</span></div><div className="kpi-note" style={{ borderTop: "1px solid #edf0f4" }}><Status status="Under review" /> <b style={{ marginLeft: 7 }}>2 technical & quality records</b><br/><span>Reviews maintain a decision history and do not overwrite approved baselines.</span></div></section>
    </div>
  </>;
}

function Metric({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: LucideIcon; tone: "blue" | "green" | "amber" | "red" }) { return <article className="metric"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone === "blue" ? "" : tone}`}><Icon size={15}/></span></div><div className="metric-value">{value}</div><div className="metric-note">{note}</div></article>; }
function TimelineItem({ title, copy, date, warn }: { title: string; copy: string; date: string; warn?: boolean }) { return <div className="timeline-item"><span className="timeline-dot" style={warn ? { background: "#c44646", boxShadow: "0 0 0 3px #fceed" } : undefined} /><div><p><b>{title}</b><br />{copy}</p><time>{date}</time></div></div>; }

function ProjectView({ project, onEdit, managed = false }: { project: typeof pilotProject; onEdit?: () => void; managed?: boolean }) { return <><div className="page-header"><div><p className="eyebrow">Project record</p><h1 className="page-title">{project.name}</h1><p className="page-subtitle">{project.code} · {project.location} · {project.length}</p></div>{onEdit && !managed && <button className="primary" onClick={onEdit}><SlidersHorizontal size={15}/> Edit project</button>}</div><section className="card"><div className="card-head"><div><h2 className="card-title">Project overview</h2><p className="card-meta">Core record and participating organizations</p></div><Status status={managed ? "Draft" : "Active"} /></div><div className="stat-strip"><div><span>Employer</span><strong>{project.employer}</strong></div><div><span>Consultant / Engineer</span><strong>{project.engineer}</strong></div><div><span>Contractor</span><strong>{project.contractor}</strong></div></div></section><div className="section-row"><div><h2>Project sections</h2><p>Controlled records are organized by workflow and authority.</p></div></div><div className="metric-grid">{["Contract", "Progress", "EOT Claims", "Personnel", "Technical Submissions", "Resources", "Quality", "Correspondence"].map((name, i) => <article className="metric" key={name}><div className="metric-top"><span>{name}</span><span className="metric-icon"><FileText size={15}/></span></div><div className="metric-value">{managed ? "—" : ["1", "2", "1", "2", "2", "2", "2", "3"][i]}</div><div className="metric-note">{managed ? "No project records yet" : "Controlled records in sample register"}</div></article>)}</div></>; }

function Registry({ view, records, onAdd, onViewRecord }: { view: View; records: RegistryItem[]; onAdd: () => void; onViewRecord: (record: RegistryItem) => void }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All statuses");
  const filtered = records.filter((r) => `${r.title} ${r.reference} ${r.owner}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All statuses" || r.status === filter));
  return <><div className="page-header"><div><p className="eyebrow">{view === "Correspondence" ? "Document register" : "Project workflow"}</p><h1 className="page-title">{view}</h1><p className="page-subtitle">{descriptions[view]}</p></div><button className="primary" onClick={onAdd}><Plus size={15}/> New {view === "EOT Claims" ? "claim" : "record"}</button></div><section className="card"><div className="toolbar"><div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}><div style={{ position: "relative" }}><Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#8490a3" }}/><input className="search" style={{ paddingLeft: 31 }} aria-label="Search records" placeholder="Search reference, record or owner" value={query} onChange={(e) => setQuery(e.target.value)}/></div><select aria-label="Filter status" className="filter" value={filter} onChange={(e) => setFilter(e.target.value)}><option>All statuses</option>{["Approved", "Under review", "Pending decision", "Action required", "Open", "Rejected"].map((s) => <option key={s}>{s}</option>)}</select></div><span className="card-meta">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span></div><div className="table-scroll"><table className="data-table"><thead><tr><th>Record</th><th>Reference</th><th>Workflow status</th><th>Responsible party</th><th>Deadline / event</th><th aria-label="actions"></th></tr></thead><tbody>{filtered.map((record) => <tr key={record.id}><td><strong>{record.title}</strong><span className="subcopy">{record.id}</span></td><td>{record.reference}</td><td><Status status={record.status}/></td><td>{record.owner}</td><td>{record.due}</td><td><button className="row-action" onClick={() => onViewRecord(record)}>Open</button></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty"><Search size={24}/><div>No records match this search or status filter.</div></div>}</div></section></>;
}

function Placeholder({ view }: { view: View }) { const Icon = view === "Reports" ? FileBarChart : view === "User Management" ? Users : view === "Settings" ? Settings : view === "Contracts" ? FileText : view === "Equipment" ? Wrench : Package; return <><div className="page-header"><div><p className="eyebrow">Project control</p><h1 className="page-title">{view}</h1><p className="page-subtitle">{descriptions[view]}</p></div>{view === "Reports" ? <button className="primary"><ArrowDownToLine size={15}/> Generate report</button> : <button className="primary"><Plus size={15}/> Add record</button>}</div><section className="card"><div className="empty"><Icon size={31}/><h2 style={{ margin: "0 0 6px", color: "#2a3d59", fontSize: 15 }}>Ready for controlled records</h2><p style={{ maxWidth: 450, margin: "auto", lineHeight: 1.55 }}>This Phase 1 workspace establishes the shared project shell and access-aware navigation. The module register will become available as its workflow is configured.</p></div></section></>; }

function AuditLog() { return <><div className="page-header"><div><p className="eyebrow">Governance</p><h1 className="page-title">Audit Logs</h1><p className="page-subtitle">Recorded activity is retained to support controlled contractual workflows.</p></div><button className="ghost"><ArrowDownToLine size={15}/> Export log</button></div><section className="card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Recorded action</th><th>Actor / source</th><th>Module</th><th>Date</th><th>Integrity</th></tr></thead><tbody>{auditEvents.map((event) => <tr key={event.action}><td><strong>{event.action}</strong></td><td>{event.actor}</td><td>{event.kind}</td><td>{event.when}</td><td><span className="badge green"><Check size={10} style={{ marginRight: 3 }}/> Logged</span></td></tr>)}</tbody></table></div></section></>; }

function Reports({ onExport }: { onExport: () => void }) { return <><div className="page-header"><div><p className="eyebrow">Authorized reporting</p><h1 className="page-title">Reports</h1><p className="page-subtitle">Exports are based on recorded project data and visibly labelled where records are sample data.</p></div><button className="primary" onClick={onExport}><ArrowDownToLine size={15}/> Download status CSV</button></div><div className="metric-grid">{[["Monthly progress report", "Verified progress and activity measurements"], ["EOT status report", "Claim, review, recommendation and decision status"], ["Quality action report", "Open observations and corrective action deadlines"], ["Correspondence register", "Incoming and outgoing controlled records"]].map(([title, note]) => <article className="metric" key={title}><div className="metric-top"><span>{title}</span><span className="metric-icon"><FileBarChart size={15}/></span></div><div className="metric-value" style={{ fontSize: 15, marginTop: 17 }}>Available</div><div className="metric-note">{note}</div></article>)}</div><section className="card" style={{ marginTop: 16 }}><div className="card-head"><div><h2 className="card-title">Export control</h2><p className="card-meta">The current download contains only visible historical sample records.</p></div></div><div className="kpi-note">A production report service must query the secured database, apply the current caller&apos;s project and organization permissions, and record report access in the audit log.</div></section></>; }

function SettingsPanel({ onSave }: { onSave: () => void }) { return <><div className="page-header"><div><p className="eyebrow">Administration</p><h1 className="page-title">Settings</h1><p className="page-subtitle">Project-wide defaults used by controlled workflow modules.</p></div></div><form className="card" onSubmit={(e) => { e.preventDefault(); onSave(); }}><div className="card-head"><div><h2 className="card-title">Project measurement configuration</h2><p className="card-meta">Authorized administrators configure values before measurement is accepted.</p></div></div><div className="modal-body"><div className="form-grid"><div className="field"><label>Default calendar convention</label><select defaultValue="Calendar days"><option>Calendar days</option><option>Working days</option></select></div><div className="field"><label>Progress measurement basis</label><select defaultValue="Approved weighted quantities"><option>Approved weighted quantities</option><option>Verified quantities only</option></select></div><div className="field"><label>Document retention</label><select defaultValue="Project contract period + 10 years"><option>Project contract period + 10 years</option><option>Project contract period + 7 years</option></select></div><div className="field"><label>Notification lead time</label><select defaultValue="7 calendar days"><option>7 calendar days</option><option>14 calendar days</option><option>30 calendar days</option></select></div></div></div><div className="modal-foot"><button type="submit" className="primary">Save configuration</button></div></form></>; }

function UserManagement({ roles, organizationId }: { roles: SessionRole[]; organizationId: string }) {
  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const assignableRoles = isSuperAdmin ? sessionRoles : sessionRoles.filter((role) => !adminRoles.includes(role));
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [organizations, setOrganizations] = useState<ManagedOrganization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(organizationId);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("icpcas-api-token");
    if (!apiBaseUrl || !token) {
      setError("Sign in through the live API to manage user accounts.");
      return () => { active = false; };
    }
    Promise.all([getUsers(token), getOrganizations(token)])
      .then(([loadedUsers, loadedOrganizations]) => {
        if (!active) return;
        setUsers(loadedUsers);
        setOrganizations(loadedOrganizations);
        setSelectedOrganizationId((current) => current || organizationId || loadedOrganizations[0]?._id || "");
      })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Unable to load user accounts."); });
    return () => { active = false; };
  }, [organizationId]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    const token = window.localStorage.getItem("icpcas-api-token");
    if (!token) {
      setError("Your session has expired. Sign in again to register a user.");
      return;
    }
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    try {
      await createUser(token, {
        fullName: String(form.get("fullName") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || ""),
        organizationId: isSuperAdmin ? String(form.get("organizationId") || "") : organizationId,
        roles: [String(form.get("role") || "ENGINEER")],
      });
      setUsers(await getUsers(token));
      formElement.reset();
      setMessage("User account registered. Share the temporary password securely.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to register this user.");
    } finally {
      setBusy(false);
    }
  };

  return <><div className="page-header"><div><p className="eyebrow">Administrator controls</p><h1 className="page-title">User Management</h1><p className="page-subtitle">Only administrators can register accounts and assign roles.</p></div></div>
    {!apiBaseUrl && <section className="card"><div className="empty"><ShieldCheck size={30}/><p>Connect the live API to register users. Sample mode cannot create accounts.</p></div></section>}
    {apiBaseUrl && <><form className="card" onSubmit={submit}><div className="card-head"><div><h2 className="card-title">Register a user</h2><p className="card-meta">New accounts are created by an administrator; there is no public sign-up.</p></div></div><div className="modal-body"><div className="form-grid"><div className="field"><label>Full name</label><input name="fullName" minLength={2} maxLength={120} required /></div><div className="field"><label>Work email</label><input name="email" type="email" required /></div><div className="field"><label>Temporary password</label><input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /><span className="subcopy">At least 12 characters. Share it through a secure channel.</span></div><div className="field"><label>Assigned role</label><select name="role" defaultValue="ENGINEER" required>{assignableRoles.map((role) => <option key={role} value={role}>{role.replaceAll("_", " ")}</option>)}</select></div>{isSuperAdmin && <div className="field full"><label>Organization</label><select name="organizationId" value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)} required>{organizations.map((organization) => <option key={organization._id} value={organization._id}>{organization.name} ({organization.code})</option>)}</select></div>}</div>{error && <p role="alert" style={{ color: "#c44646", fontSize: 12, marginBottom: 0 }}>{error}</p>}{message && <p role="status" style={{ color: "#147757", fontSize: 12, marginBottom: 0 }}>{message}</p>}</div><div className="modal-foot"><button type="submit" className="primary" disabled={busy || !apiBaseUrl}>{busy ? "Registering…" : "Register user"}</button></div></form><section className="card" style={{ marginTop: 16 }}><div className="card-head"><div><h2 className="card-title">Registered accounts</h2><p className="card-meta">Account and role assignments in your authorized scope.</p></div></div>{error && users.length === 0 ? <div className="empty">{error}</div> : <div className="table-scroll"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{users.map((user) => <tr key={user._id}><td><strong>{user.fullName}</strong></td><td>{user.email}</td><td>{user.roles.map((role) => role.replaceAll("_", " ")).join(", ")}</td><td><span className={`badge ${user.isActive ? "green" : "gray"}`}>{user.isActive ? "Active" : "Inactive"}</span></td></tr>)}{users.length === 0 && <tr><td colSpan={4}>No registered accounts found.</td></tr>}</tbody></table></div>}</section></>}
  </>;
}

function SignIn({ onSignIn, initialError = "" }: { onSignIn: (roles: SessionRole[], apiToken?: string, organizationId?: string, profileName?: string) => void; initialError?: string }) {
  const [role, setRole] = useState<SessionRole>("ENGINEER");
  const [email, setEmail] = useState(apiBaseUrl ? "" : "abel.mekonnen@pes.example");
  const [password, setPassword] = useState(apiBaseUrl ? "" : "sample-only");
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setError("");
    if (!apiBaseUrl) return onSignIn([role], undefined, "", "Sample user");
    setBusy(true);
    try {
      const session = await loginWithApi(email, password);
      const roles = session.user.roles.filter((assignedRole): assignedRole is SessionRole => sessionRoles.includes(assignedRole as SessionRole));
      if (roles.length === 0) throw new Error("This account has no recognized role. Contact an administrator.");
      window.localStorage.setItem("icpcas-api-token", session.token);
      onSignIn(roles, session.token, session.user.organizationId, session.user.fullName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  };
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "linear-gradient(145deg, #081b36, #193d70)" }}><section style={{ width: "min(430px,100%)", background: "#fff", padding: 33, borderRadius: 13, boxShadow: "0 20px 60px #02091866" }}><div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 28 }}><div className="brandmark">IC</div><div><strong style={{ color: "#13233f", fontFamily: "Manrope" }}>ICPCAS</strong><span style={{ display: "block", fontSize: 10, color: "#7b889b", marginTop: 2 }}>PROMINENT ENGINEERING SOLUTIONS</span></div></div><h1 style={{ margin: 0, color: "#172640", fontFamily: "Manrope", fontSize: 23 }}>Welcome back</h1><p style={{ color: "#6f7c90", fontSize: 13, lineHeight: 1.5, marginBottom: 22 }}>{apiBaseUrl ? "Sign in with your authorized account." : "Select a sample role to explore authorized pilot workflows."}</p>{!apiBaseUrl && <div className="field"><label>Sample role</label><select value={role} onChange={(e) => setRole(e.target.value as SessionRole)}>{["ENGINEER", "CONTRACTOR", "EMPLOYER", "PROJECT_MANAGER", "READ_ONLY_AUDITOR"].map((r) => <option key={r}>{r}</option>)}</select></div>}<div className="field" style={{ marginTop: 14 }}><label>Work email</label><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" /></div><div className="field" style={{ marginTop: 14 }}><label>Password</label><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" /></div>{error && <p role="alert" style={{ color: "#c44646", fontSize: 11, margin: "10px 0 0" }}>{error}</p>}<button className="primary" style={{ width: "100%", justifyContent: "center", marginTop: 21 }} onClick={submit} disabled={busy}>{busy ? "Signing in…" : apiBaseUrl ? "Sign in" : "Enter sample workspace"}</button><p style={{ color: "#8b95a4", fontSize: 10, lineHeight: 1.45, marginTop: 16 }}>{apiBaseUrl ? "Your session is issued by the secure API. Project access remains enforced server-side." : "Development interface only. Configure NEXT_PUBLIC_API_URL to use live API authentication."}</p></section></main>;
}

function Modal({ title, children, onClose, onSubmit, submitLabel = "Save controlled record", busy = false }: { title: string; children: React.ReactNode; onClose: () => void; onSubmit?: (event: FormEvent<HTMLFormElement>) => void; submitLabel?: string; busy?: boolean }) { return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title"><form className="modal" onSubmit={(event) => { event.preventDefault(); if (onSubmit) onSubmit(event); else onClose(); }}><div className="modal-head"><h2 id="modal-title">{title}</h2><button type="button" className="close" onClick={onClose} aria-label="Close dialog"><X size={18}/></button></div><div className="modal-body">{children}</div><div className="modal-foot"><button type="button" className="ghost" onClick={onClose} disabled={busy}>Cancel</button><button type="submit" className="primary" disabled={busy}>{busy ? "Creating…" : onSubmit ? submitLabel : "Close record"}</button></div></form></div>; }

export default function Home() {
  const [view, setView] = useState<View>("Dashboard"); const [signedIn, setSignedIn] = useState(false); const [sessionChecked, setSessionChecked] = useState(false); const [sessionError, setSessionError] = useState(""); const [roles, setRoles] = useState<SessionRole[]>(["ENGINEER"]); const [organizationId, setOrganizationId] = useState(""); const [profileName, setProfileName] = useState("Sample user"); const [notices, setNotices] = useState(false); const [modal, setModal] = useState<"add" | "detail" | "project" | "project-create" | null>(null); const [selected, setSelected] = useState<RegistryItem | null>(null); const [toast, setToast] = useState(""); const [project, setProject] = useState(pilotProject);
  const [authorizedProjects, setAuthorizedProjects] = useState<ManagedProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectOrganizations, setProjectOrganizations] = useState<ManagedOrganization[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectBusy, setProjectBusy] = useState(false);
  const [organizationBusy, setOrganizationBusy] = useState(false);
  const [organizationDraft, setOrganizationDraft] = useState({ name: "", code: "", type: "CONTRACTOR" as ManagedOrganization["type"] });
  const [projectPartyIds, setProjectPartyIds] = useState({ employer: "", contractor: "", engineer: "" });
  const [records, setRecords] = useState<Record<string, RegistryItem[]>>(initialRecords);
  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const savedRecords = window.localStorage.getItem("icpcas-phase1-records");
        const savedSession = window.localStorage.getItem("icpcas-signed-in");
        if (savedRecords) setRecords(JSON.parse(savedRecords));
        if (!savedSession) return;

        const parsed = JSON.parse(savedSession) as { roles?: unknown; role?: unknown; profileName?: unknown; organizationId?: unknown };
        if (apiBaseUrl) {
          const token = window.localStorage.getItem("icpcas-api-token");
          if (!token) throw new Error("Your saved session has expired. Sign in again.");
          const user = await getCurrentUser(token);
          const currentRoles = user.roles.filter((role): role is SessionRole => sessionRoles.includes(role as SessionRole));
          if (currentRoles.length === 0) throw new Error("This account has no recognized role. Contact an administrator.");
          if (!active) return;
          setRoles(currentRoles);
          setOrganizationId(user.organizationId);
          setProfileName(user.fullName);
          setSignedIn(true);
          window.localStorage.setItem("icpcas-signed-in", JSON.stringify({ roles: currentRoles, organizationId: user.organizationId, profileName: user.fullName, apiToken: true }));
        } else {
          const storedRoles: unknown[] = Array.isArray(parsed.roles) ? parsed.roles : [parsed.role];
          const restoredRoles = storedRoles.filter((role): role is SessionRole => typeof role === "string" && sessionRoles.includes(role as SessionRole));
          if (!active) return;
          if (restoredRoles.length > 0) {
            setRoles(restoredRoles);
            setOrganizationId(typeof parsed.organizationId === "string" ? parsed.organizationId : "");
            setProfileName(typeof parsed.profileName === "string" ? parsed.profileName : "Sample user");
            setSignedIn(true);
          }
        }
      } catch (error) {
        window.localStorage.removeItem("icpcas-signed-in");
        window.localStorage.removeItem("icpcas-api-token");
        if (active) {
          setSignedIn(false);
          setSessionError(error instanceof Error ? error.message : "Unable to restore the saved session.");
        }
      } finally {
        if (active) setSessionChecked(true);
      }
    };
    void restoreSession();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!signedIn || !apiBaseUrl) return;
    const token = window.localStorage.getItem("icpcas-api-token");
    if (!token) return;
    let active = true;
    setProjectLoading(true);
    Promise.all([
      getProjects(token),
      roles.some((role) => adminRoles.includes(role)) ? getOrganizations(token) : Promise.resolve([] as ManagedOrganization[]),
    ]).then(([loadedProjects, organizations]) => {
      if (!active) return;
      setAuthorizedProjects(loadedProjects);
      setSelectedProjectId((current) => loadedProjects.some((item) => item._id === current) ? current : loadedProjects[0]?._id || "");
      setProjectOrganizations(organizations);
      setProjectError("");
    }).catch((error: unknown) => {
      if (active) setProjectError(error instanceof Error ? error.message : "Unable to load authorized projects.");
    }).finally(() => {
      if (active) setProjectLoading(false);
    });
    return () => { active = false; };
  }, [signedIn, roles]);
  useEffect(() => { if (signedIn) window.localStorage.setItem("icpcas-phase1-records", JSON.stringify(records)); }, [records, signedIn]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 3300); return () => window.clearTimeout(timer); }, [toast]);
  const activeRecords = useMemo(() => records[view] ?? [], [records, view]);
  const activeManagedProject = authorizedProjects.find((item) => item._id === selectedProjectId);
  const activeProjectName = apiBaseUrl
    ? activeManagedProject?.name || ""
    : project.name;
  const projectForDisplay = activeManagedProject ? {
    name: activeManagedProject.name,
    code: activeManagedProject.code,
    location: activeManagedProject.location,
    length: activeManagedProject.lengthKm === undefined ? "Not specified" : `${activeManagedProject.lengthKm} km`,
    employer: projectOrganizations.find((item) => item._id === activeManagedProject.employerOrganizationId)?.name || activeManagedProject.employerOrganizationId,
    contractor: projectOrganizations.find((item) => item._id === activeManagedProject.contractorOrganizationId)?.name || activeManagedProject.contractorOrganizationId,
    engineer: projectOrganizations.find((item) => item._id === activeManagedProject.engineerOrganizationId)?.name || activeManagedProject.engineerOrganizationId,
  } : project;
  const signIn = (newRoles: SessionRole[], apiToken?: string, newOrganizationId = "", newProfileName = "Sample user") => {
    setRoles(newRoles);
    setOrganizationId(newOrganizationId);
    setProfileName(newProfileName);
    setSignedIn(true);
    window.localStorage.setItem("icpcas-signed-in", JSON.stringify({ roles: newRoles, organizationId: newOrganizationId, profileName: newProfileName, apiToken: Boolean(apiToken) }));
  };
  const signOut = () => {
    const token = window.localStorage.getItem("icpcas-api-token");
    if (apiBaseUrl && token) void logoutWithApi(token).catch((error: unknown) => setToast(error instanceof Error ? `Signed out locally; server session revocation failed: ${error.message}` : "Signed out locally; server session revocation failed."));
    setSignedIn(false);
    setRoles(["ENGINEER"]);
    setOrganizationId("");
    setProfileName("Sample user");
    window.localStorage.removeItem("icpcas-signed-in");
    window.localStorage.removeItem("icpcas-api-token");
    setView("Dashboard");
    setAuthorizedProjects([]);
    setSelectedProjectId("");
  };
  const canView = (nextView: View) => roles.some((role) => roleViews[role].has(nextView));
  const navigate = (nextView: View) => { if (canView(nextView)) setView(nextView); };
  const primaryRole = roles[0] || "ENGINEER";
  const canManageProjects = roles.some((role) => adminRoles.includes(role));
  const openProjectCreate = () => {
    setProjectError("");
    setProjectPartyIds({ employer: "", contractor: "", engineer: "" });
    setOrganizationDraft({ name: "", code: "", type: "CONTRACTOR" });
    setModal("project-create");
  };
  const createRecord = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const title = String(form.get("title") || "Untitled controlled record"); const reference = String(form.get("reference") || `TM-${Math.floor(Math.random() * 9000 + 1000)}`); const newRecord: RegistryItem = { id: `${view.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`, title, reference, status: "Draft", owner: primaryRole.replaceAll("_", " "), due: "Not submitted" }; setRecords((current) => ({ ...current, [view]: [newRecord, ...(current[view] ?? [])] })); setModal(null); setToast("Draft record saved locally in this sample workspace."); };
  const saveProject = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); setProject((current) => ({ ...current, name: String(form.get("projectName") || current.name), location: String(form.get("location") || current.location), length: `${String(form.get("length") || current.length.replace(" km", ""))} km` })); setModal(null); setToast("Project record updated locally in the sample workspace."); };
  const submitProjectCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProjectError("");
    if (!canManageProjects) {
      setProjectError("Only a Super Admin or Organization Admin can add a project.");
      return;
    }
    if (!apiBaseUrl) {
      setProjectError("Project creation requires a live API session. Sample mode cannot authorize projects.");
      return;
    }
    const token = window.localStorage.getItem("icpcas-api-token");
    if (!token) {
      setProjectError("Your session has expired. Sign in again to add a project.");
      return;
    }
    const form = new FormData(event.currentTarget);
    setProjectBusy(true);
    try {
      const code = String(form.get("code") || "").trim();
      const employerOrganizationId = String(form.get("employerOrganizationId") || "");
      const contractorOrganizationId = String(form.get("contractorOrganizationId") || "");
      const engineerOrganizationId = String(form.get("engineerOrganizationId") || "");
      if (!roles.includes("SUPER_ADMIN") && ![employerOrganizationId, contractorOrganizationId, engineerOrganizationId].includes(organizationId)) {
        setProjectError("Your organization must be one of the project parties to create this project.");
        return;
      }
      await createProject(token, {
        name: String(form.get("name") || "").trim(),
        code,
        location: String(form.get("location") || "").trim(),
        ...(String(form.get("lengthKm") || "") ? { lengthKm: Number(form.get("lengthKm")) } : {}),
        employerOrganizationId,
        contractorOrganizationId,
        engineerOrganizationId,
      });
      const updatedProjects = await getProjects(token);
      setAuthorizedProjects(updatedProjects);
      const createdProject = updatedProjects.find((item) => item.code.toLowerCase() === code.toLowerCase());
      if (!createdProject) throw new Error("Project was created, but is not available in your authorized project list.");
      setSelectedProjectId(createdProject._id);
      setModal(null);
      setView("Projects");
      setToast(`Project ${createdProject.code} added and authorized for your account.`);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : "Unable to add this project.");
    } finally {
      setProjectBusy(false);
    }
  };
  const addProjectOrganization = async () => {
    setProjectError("");
    if (!roles.includes("SUPER_ADMIN")) {
      setProjectError("Only a Super Admin can register organizations.");
      return;
    }
    const token = window.localStorage.getItem("icpcas-api-token");
    if (!token) {
      setProjectError("Your session has expired. Sign in again to register an organization.");
      return;
    }
    if (organizationDraft.name.trim().length < 2 || organizationDraft.code.trim().length < 2) {
      setProjectError("Enter an organization name and a code of at least two characters.");
      return;
    }
    setOrganizationBusy(true);
    try {
      const created = await createOrganization(token, {
        ...organizationDraft,
        name: organizationDraft.name.trim(),
        code: organizationDraft.code.trim(),
      });
      const organizations = await getOrganizations(token);
      setProjectOrganizations(organizations);
      setProjectPartyIds((current) => ({
        ...current,
        ...(created.type === "EMPLOYER" ? { employer: created._id } : {}),
        ...(created.type === "CONTRACTOR" ? { contractor: created._id } : {}),
        ...(created.type === "CONSULTANT" ? { engineer: created._id } : {}),
      }));
      setOrganizationDraft({ name: "", code: "", type: "CONTRACTOR" });
      setToast(`${created.name} added as a project organization.`);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : "Unable to register this organization.");
    } finally {
      setOrganizationBusy(false);
    }
  };
  const exportSample = () => { const rows = ["Module,Record,Reference,Status,Responsible party,Deadline / event"]; Object.entries(records).forEach(([module, values]) => values.forEach((record) => rows.push([module, record.title, record.reference, record.status, record.owner, record.due].map((value) => `\"${value.replaceAll('"', '""')}\"`).join(",")))); const blob = new Blob([rows.join("\n")], { type: "text/csv" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "icpcas-sample-project-status.csv"; anchor.click(); URL.revokeObjectURL(url); setToast("Sample status CSV downloaded."); };
  if (!sessionChecked) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "#fff", background: "#081b36" }}>Checking session…</main>;
  if (!signedIn) return <SignIn onSignIn={signIn} initialError={sessionError} />;
  const renderView = () => {
    if (!canView(view)) return <Dashboard setView={navigate} profileName={profileName} />;
    if (view === "Dashboard") return <Dashboard setView={navigate} profileName={profileName} />;
    if (view === "Projects") return <ProjectView project={projectForDisplay} onEdit={apiBaseUrl ? undefined : () => setModal("project")} managed={Boolean(activeManagedProject)} />;
    if (view === "Audit Logs") return <AuditLog />;
    if (view === "Reports") return <Reports onExport={exportSample} />;
    if (view === "Settings") return <SettingsPanel onSave={() => setToast("Configuration saved locally in the sample workspace.")} />;
    if (view === "User Management") return <UserManagement roles={roles} organizationId={organizationId} />;
    if (openViews.includes(view)) return <Registry view={view} records={activeRecords} onAdd={() => setModal("add")} onViewRecord={(record) => { setSelected(record); setModal("detail"); }} />;
    return <Placeholder view={view} />;
  };
  const initials = profileName.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
  const projectOrganizationsByType = {
    employer: projectOrganizations.filter((item) => item.type === "EMPLOYER"),
    contractor: projectOrganizations.filter((item) => item.type === "CONTRACTOR"),
    engineer: projectOrganizations.filter((item) => item.type === "CONSULTANT"),
  };
  const canCreateProjects = canManageProjects && Boolean(apiBaseUrl);
  return <div className="shell">
    <Sidebar view={view} setView={navigate} onSignOut={signOut} roles={roles} profileName={profileName} projectName={activeProjectName} />
    <main className="main">
      <header className="topbar">
        <div className="crumb">Workspace <span style={{ margin: "0 6px", color: "#b0b7c2" }}>/</span> <strong>{view}</strong></div>
        <div className="top-actions">
          {apiBaseUrl ? <select className="project-select" aria-label="Active project" value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} disabled={projectLoading || authorizedProjects.length === 0}>
            {projectLoading && <option value="">Loading authorized projects…</option>}
            {!projectLoading && authorizedProjects.length === 0 && <option value="">No authorized projects</option>}
            {authorizedProjects.map((item) => <option key={item._id} value={item._id}>{item.code} · {item.name}</option>)}
          </select> : <select className="project-select" aria-label="Active project" value={project.code} onChange={() => undefined}><option value={project.code}>{project.code} · {project.name}</option></select>}
          {canCreateProjects && <button className="project-add" onClick={openProjectCreate} disabled={projectLoading} title="Create and authorize a project"><Plus size={14} /> Add authorized project</button>}
          <button className="icon-btn" aria-label="Notifications" onClick={() => setNotices(!notices)}><Bell size={16}/><span className="notice-dot" /></button>
          <div className="avatar" title={roles.map((role) => role.replaceAll("_", " ")).join(", ")}>{initials}</div>
        </div>
        {projectError && modal !== "project-create" && <div className="project-error" role="alert">{projectError}</div>}
        {notices && <div className="notification-panel"><h3>Notifications <button className="linkish" style={{ float: "right" }} onClick={() => setNotices(false)}>Mark read</button></h3><div className="notify"><strong>Employer decision is awaited</strong><span>EOT Claim No. 07 · 1 open item</span></div><div className="notify"><strong>Recovery programme due</strong><span>Instruction PES/TM/059/26</span></div><div className="notify"><strong>One staff record requires verification</strong><span>Actual commencement has not been confirmed</span></div></div>}
      </header>
      <div className="page">{renderView()}</div>
    </main>
    {modal === "add" && <Modal title={`New ${view === "EOT Claims" ? "EOT claim" : "controlled record"}`} onClose={() => setModal(null)} onSubmit={createRecord}><div className="form-grid"><div className="field full"><label>Record title</label><input required name="title" placeholder="Enter a clear, controlled title" autoFocus /></div><div className="field"><label>Reference number</label><input name="reference" placeholder="e.g. PES/TM/062/26" /></div><div className="field"><label>Project</label><select defaultValue="TM-RUP-01"><option value="TM-RUP-01">TM-RUP-01 · Tepi–Mizan</option></select></div><div className="field full"><label>Submission note</label><textarea placeholder="Summarize the purpose and supporting record." /></div></div></Modal>}
    {modal === "project" && <Modal title="Edit project record" onClose={() => setModal(null)} onSubmit={saveProject}><div className="form-grid"><div className="field full"><label>Project name</label><input name="projectName" required defaultValue={project.name} /></div><div className="field"><label>Location</label><input name="location" required defaultValue={project.location} /></div><div className="field"><label>Project length (km)</label><input name="length" required type="number" min="0" step="0.01" defaultValue={project.length.replace(" km", "")} /></div><div className="field full"><label>Data governance note</label><textarea readOnly value="This browser-only edit is for evaluating the workspace. Official project changes must be sent to the authorized API and audited." /></div></div></Modal>}
    {modal === "project-create" && <Modal title="Add authorized project" onClose={() => { setModal(null); setProjectError(""); }} onSubmit={submitProjectCreate} submitLabel="Create project" busy={projectBusy || organizationBusy}>
      <div className="form-grid">
        <div className="field full"><label>Project name</label><input name="name" minLength={3} maxLength={180} required /></div>
        <div className="field"><label>Project code</label><input name="code" minLength={2} maxLength={30} required placeholder="e.g. TM-RUP-02" /></div>
        <div className="field"><label>Location</label><input name="location" minLength={2} maxLength={180} required /></div>
        <div className="field"><label>Length (km, optional)</label><input name="lengthKm" type="number" min="0" step="0.01" /></div>
        <div className="field"><label>Employer</label><select name="employerOrganizationId" value={projectPartyIds.employer} onChange={(event) => setProjectPartyIds((current) => ({ ...current, employer: event.target.value }))} required><option value="" disabled>Select employer</option>{projectOrganizationsByType.employer.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.code})</option>)}</select></div>
        <div className="field"><label>Contractor</label><select name="contractorOrganizationId" value={projectPartyIds.contractor} onChange={(event) => setProjectPartyIds((current) => ({ ...current, contractor: event.target.value }))} required><option value="" disabled>Select contractor</option>{projectOrganizationsByType.contractor.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.code})</option>)}</select></div>
        <div className="field"><label>Consultant / Engineer</label><select name="engineerOrganizationId" value={projectPartyIds.engineer} onChange={(event) => setProjectPartyIds((current) => ({ ...current, engineer: event.target.value }))} required><option value="" disabled>Select consultant</option>{projectOrganizationsByType.engineer.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.code})</option>)}</select></div>
        {roles.includes("SUPER_ADMIN") && <div className="field full" style={{ borderTop: "1px solid #edf0f4", paddingTop: 14 }}>
          <label>Add a missing project organization</label>
          <div className="form-grid">
            <div className="field"><label>Organization name</label><input value={organizationDraft.name} onChange={(event) => setOrganizationDraft((current) => ({ ...current, name: event.target.value }))} minLength={2} maxLength={160} /></div>
            <div className="field"><label>Organization code</label><input value={organizationDraft.code} onChange={(event) => setOrganizationDraft((current) => ({ ...current, code: event.target.value }))} minLength={2} maxLength={20} /></div>
            <div className="field"><label>Organization type</label><select value={organizationDraft.type} onChange={(event) => setOrganizationDraft((current) => ({ ...current, type: event.target.value as ManagedOrganization["type"] }))}><option value="CONTRACTOR">Contractor</option><option value="EMPLOYER">Employer</option><option value="CONSULTANT">Consultant / Engineer</option></select></div>
            <div className="field" style={{ alignContent: "end" }}><button type="button" className="ghost" onClick={() => void addProjectOrganization()} disabled={organizationBusy || projectBusy}><Plus size={14} />{organizationBusy ? "Adding organization…" : "Add organization"}</button></div>
          </div>
        </div>}
        <p className="field full subcopy">Organization Admins can create projects only when their organization is one of the three participating parties.</p>
        {projectError && <p className="field full" role="alert" style={{ color: "#c44646", fontSize: 12 }}>{projectError}</p>}
      </div>
    </Modal>}
    {modal === "detail" && selected && <Modal title={selected.title} onClose={() => setModal(null)}><div className="form-grid"><div className="field"><label>Reference</label><input value={selected.reference} readOnly /></div><div className="field"><label>Workflow status</label><input value={selected.status} readOnly /></div><div className="field"><label>Responsible party</label><input value={selected.owner} readOnly /></div><div className="field"><label>Deadline / event</label><input value={selected.due} readOnly /></div><div className="field full"><label>Controlled record note</label><textarea value={selected.detail || "No additional note has been recorded."} readOnly /></div></div></Modal>}
    {toast && <div className="toast"><Check size={15}/>{toast}</div>}
  </div>;
}
