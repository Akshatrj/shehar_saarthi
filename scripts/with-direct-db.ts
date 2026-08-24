import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

function loadOptionalEnv(file: string) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}

loadOptionalEnv(".env.local");
loadOptionalEnv(".env");

const databaseUrl =
  process.env.DIRECT_URL?.trim() ||
  process.env.DATABASE_URL_UNPOOLED?.trim() ||
  process.env.POSTGRES_URL_NON_POOLING?.trim() ||
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_URL?.trim() ||
  "";

if (!databaseUrl) {
  console.error(
    "Set DATABASE_URL to your Neon/Postgres URL before running Prisma commands.",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: tsx scripts/with-direct-db.ts prisma <command>");
  process.exit(1);
}

const bin = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(bin, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: databaseUrl,
    DIRECT_URL: databaseUrl,
  },
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
