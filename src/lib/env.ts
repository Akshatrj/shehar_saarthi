import { z } from "zod";
import { resolveDatabaseUrl, resolveDirectDatabaseUrl } from "@/lib/database-url";

function authUrlFromEnv() {
  if (process.env.AUTH_URL) {
    return process.env.AUTH_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return undefined;
}

function googleClientId() {
  return (
    process.env.AUTH_GOOGLE_ID?.trim() ||
    process.env.GOOGLE_CLIENT_ID?.trim() ||
    undefined
  );
}

function googleClientSecret() {
  return (
    process.env.AUTH_GOOGLE_SECRET?.trim() ||
    process.env.GOOGLE_CLIENT_SECRET?.trim() ||
    undefined
  );
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  AUTH_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    AUTH_URL: authUrlFromEnv(),
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: googleClientId(),
    AUTH_GOOGLE_SECRET: googleClientSecret(),
    DATABASE_URL: resolveDatabaseUrl() || undefined,
    DIRECT_URL: resolveDirectDatabaseUrl() || undefined,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  });

  if (!parsed.success) {
    throw new Error("Invalid environment configuration.");
  }

  if (
    parsed.data.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    if (!parsed.data.AUTH_SECRET) {
      throw new Error("AUTH_SECRET must be set in production.");
    }
    if (!parsed.data.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set in production.");
    }
    if (!parsed.data.DIRECT_URL) {
      throw new Error("DIRECT_URL must be set in production.");
    }
    if (!parsed.data.AUTH_GOOGLE_ID || !parsed.data.AUTH_GOOGLE_SECRET) {
      throw new Error("AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET must be set in production.");
    }
  }

  return parsed.data;
}
