import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { updateAdminUser } from "@/domains/admin/users";
import { loadUserById } from "@/domains/auth/sync-user";
import { portalPathForRole } from "@/lib/rbac";
import type { AuthUser } from "@/lib/rbac";
import {
  beginDepartmentTest,
  createTestDepartment,
  finishDepartmentTest,
} from "./test-fixtures";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("skip role sync tests — DATABASE_URL not set");
    return;
  }

  const superAdmin: AuthUser = {
    id: randomUUID(),
    email: "admin@example.com",
    name: "Admin",
    role: "SUPER_ADMIN",
    departmentId: null,
    isActive: true,
  };

  const harness = await beginDepartmentTest(prisma);
  try {
    const desk = await createTestDepartment(harness);

    const citizen = await prisma.user.create({
      data: {
        email: `role-sync-${randomUUID()}@test.local`,
        name: "Role Sync Citizen",
        role: "CITIZEN",
        passwordHash: "test",
        isActive: true,
      },
      select: { id: true },
    });
    harness.userIds.push(citizen.id);

    const initial = await loadUserById(citizen.id);
    assert.equal(initial?.role, "CITIZEN");
    assert.equal(portalPathForRole(initial!.role), "/citizen");

    await updateAdminUser(superAdmin, citizen.id, {
      role: "DEPARTMENT_ADMIN",
      departmentId: desk.id,
      isActive: true,
    });

    const promoted = await loadUserById(citizen.id);
    assert.equal(promoted?.role, "DEPARTMENT_ADMIN");
    assert.equal(promoted?.departmentId, desk.id);
    assert.equal(portalPathForRole(promoted!.role), "/department-admin");

    await updateAdminUser(superAdmin, citizen.id, {
      role: "WORKER",
      departmentId: desk.id,
      isActive: true,
    });

    const worker = await loadUserById(citizen.id);
    assert.equal(worker?.role, "WORKER");
    assert.equal(worker?.departmentId, desk.id);
    assert.equal(portalPathForRole(worker!.role), "/worker");

    await updateAdminUser(superAdmin, citizen.id, {
      role: "CITIZEN",
      departmentId: "",
      isActive: true,
    });

    const backToCitizen = await loadUserById(citizen.id);
    assert.equal(backToCitizen?.role, "CITIZEN");
    assert.equal(backToCitizen?.departmentId, null);
  } finally {
    await finishDepartmentTest(harness);
  }

  console.log("role sync tests passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
