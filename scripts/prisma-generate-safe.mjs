import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const clientIndex = join(
  process.cwd(),
  "node_modules",
  ".prisma",
  "client",
  "index.js",
);

function clientLooksReady() {
  return existsSync(clientIndex);
}

function isEngineLockError(output) {
  return /EPERM|operation not permitted|query_engine-windows\.dll\.node/i.test(
    output,
  );
}

try {
  execSync("npx prisma generate", {
    stdio: ["inherit", "pipe", "pipe"],
    encoding: "utf8",
  });
} catch (error) {
  const err = error ?? {};
  const output = [err.message, err.stdout, err.stderr].filter(Boolean).join("\n");

  if (clientLooksReady() && isEngineLockError(output)) {
    console.warn(
      "prisma generate skipped: query engine file is locked (stop `next dev` to regenerate), using existing Prisma client.",
    );
    process.exit(0);
  }

  if (err.stdout) process.stdout.write(err.stdout);
  if (err.stderr) process.stderr.write(err.stderr);
  process.exit(err.status ?? 1);
}
