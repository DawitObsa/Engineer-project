export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  organizationId: string;
  roles: string[];
  projectIds: string[];
};

export async function apiRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  if (!apiBaseUrl) throw new Error("Live API URL is not configured");
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || "The request could not be completed");
  return body.data as T;
}

export async function loginWithApi(email: string, password: string) {
  return apiRequest<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function getCurrentUser(token: string) {
  return apiRequest<AuthUser>("/auth/me", {}, token);
}

export function logoutWithApi(token: string) {
  return apiRequest<void>("/auth/logout", { method: "POST" }, token);
}

export type ManagedUser = {
  _id: string;
  fullName: string;
  email: string;
  organizationId: string;
  roles: string[];
  isActive: boolean;
};

export type ManagedOrganization = { _id: string; name: string; code: string; type: "CONSULTANT" | "CONTRACTOR" | "EMPLOYER" };
export type ManagedProject = {
  _id: string;
  name: string;
  code: string;
  location: string;
  lengthKm?: number;
  employerOrganizationId: string;
  contractorOrganizationId: string;
  engineerOrganizationId: string;
};

export function getProjects(token: string) {
  return apiRequest<ManagedProject[]>("/projects", {}, token);
}

export function createProject(token: string, project: Omit<ManagedProject, "_id">) {
  return apiRequest<ManagedProject>("/projects", { method: "POST", body: JSON.stringify(project) }, token);
}

export function getUsers(token: string) {
  return apiRequest<ManagedUser[]>("/users", {}, token);
}

export function getOrganizations(token: string) {
  return apiRequest<ManagedOrganization[]>("/organizations", {}, token);
}

export function createOrganization(token: string, organization: { name: string; code: string; type: ManagedOrganization["type"] }) {
  return apiRequest<ManagedOrganization>("/organizations", { method: "POST", body: JSON.stringify(organization) }, token);
}

export function createUser(token: string, user: { fullName: string; email: string; password: string; organizationId: string; roles: string[] }) {
  return apiRequest<{ id: string }>("/users", { method: "POST", body: JSON.stringify({ ...user, projectIds: [] }) }, token);
}
