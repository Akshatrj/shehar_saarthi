export function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ""
  );
}

export function resolveDirectDatabaseUrl() {
  return (
    process.env.DIRECT_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    resolveDatabaseUrl()
  );
}

export function prismaDatasourceUrl(raw: string) {
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.toLowerCase();
    if (host.includes("-pooler.") || host.includes("pooler.")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
    if (process.env.VERCEL) {
      parsed.searchParams.set("connection_limit", "1");
      if (!parsed.searchParams.has("sslmode")) {
        parsed.searchParams.set("sslmode", "require");
      }
    }
    if (!parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "3");
    }
    return parsed.toString();
  } catch {
    return raw;
  }
}
