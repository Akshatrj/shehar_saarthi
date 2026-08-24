import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const BLOCKED = new Set([
  ".env",
  ".env.local",
  ".env.development.local",
  ".env.production.local",
  ".env.test.local",
]);

function isBlocked(path) {
  if (BLOCKED.has(path)) {
    return true;
  }
  return path.startsWith(".env.") && path.endsWith(".local");
}

if (!existsSync(".git")) {
  console.log("verify-no-secrets: no git repo yet — nothing to check.");
  process.exit(0);
}

let tracked = [];
try {
  tracked = execSync("git ls-files", { encoding: "utf8" })
    .split(/\r?\n/)
    .filter(Boolean);
} catch {
  console.error("verify-no-secrets: could not read git index.");
  process.exit(1);
}

const hits = tracked.filter(isBlocked);
if (hits.length > 0) {
  console.error("Blocked: secret env files are tracked by git:");
  for (const file of hits) {
    console.error(`  - ${file}`);
  }
  console.error("Run: git rm --cached <file>   then commit the removal.");
  process.exit(1);
}

console.log("verify-no-secrets: OK (no secret env files tracked).");
