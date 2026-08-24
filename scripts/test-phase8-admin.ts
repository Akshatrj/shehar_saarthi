import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  assertAdminAccessDenied,
  listAdminUsers,
} from "@/domains/admin/users";
import { listAdminComplaints, overrideAdminComplaint } from "@/domains/admin/complaints";
import { listAdminDepartments } from "@/domains/admin/departments";
import type { AuthUser } from "@/lib/rbac";

async function main() {
  const citizen: AuthUser = {
    id: randomUUID(),
    email: "citizen@example.com",
    name: "Citizen",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };
  const staff: AuthUser = {
    id: randomUUID(),
    email: "staff@example.com",
    name: "Staff",
    role: "WORKER",
    departmentId: randomUUID(),
    isActive: true,
  };
  const admin: AuthUser = {
    id: randomUUID(),
    email: "admin@example.com",
    name: "Admin",
    role: "SUPER_ADMIN",
    departmentId: null,
    isActive: true,
  };

  await assertAdminAccessDenied(citizen);
  await assertAdminAccessDenied(staff);

  if (!process.env.DATABASE_URL) {
    console.log("skip admin DB tests — DATABASE_URL not set");
    console.log("phase8 admin auth tests passed");
    return;
  }

  const users = await listAdminUsers(admin, 1);
  assert.ok(Array.isArray(users.users));

  const departments = await listAdminDepartments(admin);
  assert.ok(departments.length > 0);

  const complaints = await listAdminComplaints(admin, {});
  assert.ok(Array.isArray(complaints.complaints));

  if (complaints.complaints[0]) {
    const target = complaints.complaints[0];
    await assert.rejects(
      () => listAdminComplaints(citizen, {}),
      /Super admin access is required/,
    );
    await assert.rejects(
      () =>
        overrideAdminComplaint(citizen, target.id, {
          category: target.category ?? "OTHER",
        }),
      /Super admin access is required/,
    );
  }

  console.log("phase8 admin tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
