import { resolveDirectDatabaseUrl } from "@/lib/database-url";

export function bootstrapServerEnv() {
  if (!process.env.DIRECT_URL?.trim()) {
    const directUrl = resolveDirectDatabaseUrl();
    if (directUrl) {
      process.env.DIRECT_URL = directUrl;
    }
  }
}
