import "dotenv/config";

const required = ["MONGODB_URI", "JWT_SECRET"] as const;
export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  initialAdminToken: process.env.INITIAL_ADMIN_SETUP_TOKEN || "",
  fileStoragePath: process.env.FILE_STORAGE_PATH || "./data/private-files",
};

export function validateEnvironment() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}
