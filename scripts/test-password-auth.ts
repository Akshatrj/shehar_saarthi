import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hashPassword, validatePassword, verifyPassword } from "@/domains/auth/password";
import { validateRegisterFields } from "@/domains/auth/register";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const envFile = readFileSync(envPath, "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const eq = trimmed.indexOf("=");
      if (eq === -1) {
        continue;
      }
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional .env.local
  }
}

async function testPasswordHashing() {
  const stored = await hashPassword("correct-horse");
  assert.equal(await verifyPassword("correct-horse", stored), true);
  assert.equal(await verifyPassword("wrong-password", stored), false);
  assert.equal(await verifyPassword("correct-horse", "not-a-hash"), false);
}

function testPasswordRules() {
  assert.equal(validatePassword("short"), "Password must be at least 8 characters.");
  assert.equal(validatePassword("long-enough"), null);
  assert.equal(validatePassword("a".repeat(73)), "Password must be 72 characters or fewer.");
}

function testRegisterValidation() {
  const ok = validateRegisterFields({
    name: "  Riya  ",
    email: "Riya@Example.com",
    password: "citygate1",
    confirmPassword: "citygate1",
  });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.name, "Riya");
    assert.equal(ok.email, "riya@example.com");
  }

  assert.equal(
    validateRegisterFields({
      name: "A",
      email: "riya@example.com",
      password: "citygate1",
      confirmPassword: "citygate1",
    }).ok,
    false,
  );
  assert.equal(
    validateRegisterFields({
      name: "Riya",
      email: "not-an-email",
      password: "citygate1",
      confirmPassword: "citygate1",
    }).ok,
    false,
  );
  assert.equal(
    validateRegisterFields({
      name: "Riya",
      email: "riya@example.com",
      password: "citygate1",
      confirmPassword: "citygate2",
    }).ok,
    false,
  );
}

async function testSuperAdminEmailGuard() {
  const previous = process.env.SUPER_ADMIN_EMAIL;
  process.env.SUPER_ADMIN_EMAIL = "civic-admin@example.com";
  try {
    const { isSuperAdminEmail } = await import("@/domains/auth/sync-user");
    assert.equal(isSuperAdminEmail("civic-admin@example.com"), true);
    assert.equal(isSuperAdminEmail("CIVIC-ADMIN@example.com"), true);
    assert.equal(isSuperAdminEmail("other@example.com"), false);
  } finally {
    if (previous === undefined) {
      delete process.env.SUPER_ADMIN_EMAIL;
    } else {
      process.env.SUPER_ADMIN_EMAIL = previous;
    }
  }
}

async function testAuthorizePasswordUser() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.log("skip authorize: DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const { authorizeCredentials } = await import("@/domains/auth/credentials");
  const email = `pw-auth-${randomUUID()}@example.com`;
  const password = "citygate1";

  const created = await prisma.user.create({
    data: {
      name: "Password Test",
      email,
      passwordHash: await hashPassword(password),
      role: "CITIZEN",
      isActive: true,
    },
  });

  try {
    const matched = await authorizeCredentials({ email, password });
    assert.ok(matched);
    assert.equal(matched?.email, email);
    assert.equal(matched?.role, "CITIZEN");

    const rejected = await authorizeCredentials({
      email,
      password: "wrong-password",
    });
    assert.equal(rejected, null);
  } finally {
    await prisma.user.delete({ where: { id: created.id } });
  }
}

async function testGoogleSignInClearsPasswordHash() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.log("skip google-merge: DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const { authorizeCredentials } = await import("@/domains/auth/credentials");
  const { syncGoogleUser } = await import("@/domains/auth/sync-user");
  const email = `google-merge-${randomUUID()}@example.com`;
  const password = "citygate1";

  const created = await prisma.user.create({
    data: {
      name: "Unverified Registrar",
      email,
      passwordHash: await hashPassword(password),
      role: "CITIZEN",
      isActive: true,
    },
  });

  try {
    const before = await authorizeCredentials({ email, password });
    assert.ok(before, "password login should work before Google sync");

    await syncGoogleUser({
      email,
      name: "Google Owner",
      image: null,
    });

    const after = await authorizeCredentials({ email, password });
    assert.equal(
      after,
      null,
      "password login must fail after Google proves ownership",
    );

    const row = await prisma.user.findUnique({
      where: { id: created.id },
      select: { passwordHash: true, name: true },
    });
    assert.equal(row?.passwordHash, null);
    assert.equal(row?.name, "Google Owner");
  } finally {
    await prisma.user.delete({ where: { id: created.id } });
  }
}

async function main() {
  await testPasswordHashing();
  testPasswordRules();
  testRegisterValidation();
  await testSuperAdminEmailGuard();
  await testAuthorizePasswordUser();
  await testGoogleSignInClearsPasswordHash();
  console.log("password-auth tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
