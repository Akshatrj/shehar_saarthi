import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  assertAdminAccessDenied,
  createAdminWorker,
  deleteAdminUser,
  listAdminUsers,
} from "@/domains/admin/users";
import { listAdminComplaints, overrideAdminComplaint } from "@/domains/admin/complaints";
import { listAdminDepartments } from "@/domains/admin/departments";
import { AdminError } from "@/domains/admin/auth";
import { verifyPassword } from "@/domains/auth/password";
import {
  createDepartmentWorker,
  listDepartmentWorkers,
  requireDepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";
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

  const roads = departments.find((department) => department.code === "roads");
  const parks = departments.find((department) => department.code === "parks");
  assert.ok(roads, "roads department required");
  assert.ok(parks, "parks department required");

  await assert.rejects(
    () =>
      createAdminWorker(citizen, {
        name: "Denied Worker",
        email: `denied-${randomUUID()}@test.local`,
        password: "citygate1",
        confirmPassword: "citygate1",
        departmentId: roads.id,
      }),
    /Super admin access is required/,
  );

  await assert.rejects(
    () =>
      createAdminWorker(admin, {
        name: "No Department",
        email: `nodept-${randomUUID()}@test.local`,
        password: "citygate1",
        confirmPassword: "citygate1",
        departmentId: "",
      }),
    (error: unknown) =>
      error instanceof AdminError &&
      error.message === "Workers must be linked to a department.",
  );

  const createdByAdmin = await createAdminWorker(admin, {
    name: "Super Added Worker",
    email: `super-worker-${randomUUID()}@test.local`,
    password: "citygate1",
    confirmPassword: "citygate1",
    departmentId: roads.id,
  });
  assert.equal(createdByAdmin.role, "WORKER");
  assert.equal(createdByAdmin.departmentId, roads.id);

  const stored = await prisma.user.findUnique({
    where: { id: createdByAdmin.id },
    select: { passwordHash: true, role: true, departmentId: true },
  });
  assert.equal(stored?.role, "WORKER");
  assert.equal(stored?.departmentId, roads.id);
  assert.ok(stored && stored.passwordHash);
  assert.equal(await verifyPassword("citygate1", stored.passwordHash), true);

  const roadsWorkers = await listDepartmentWorkers(roads.id);
  assert.ok(roadsWorkers.some((worker) => worker.id === createdByAdmin.id));

  const createdForParks = await createAdminWorker(admin, {
    name: "Parks Worker",
    email: `parks-worker-${randomUUID()}@test.local`,
    password: "citygate1",
    confirmPassword: "citygate1",
    departmentId: parks.id,
  });
  assert.equal(createdForParks.departmentId, parks.id);
  assert.equal(
    (await listDepartmentWorkers(roads.id)).some(
      (worker) => worker.id === createdForParks.id,
    ),
    false,
  );
  assert.ok(
    (await listDepartmentWorkers(parks.id)).some(
      (worker) => worker.id === createdForParks.id,
    ),
  );

  await assert.rejects(
    () =>
      createAdminWorker(admin, {
        name: "Mismatch",
        email: `mismatch-${randomUUID()}@test.local`,
        password: "citygate1",
        confirmPassword: "citygate2",
        departmentId: roads.id,
      }),
    (error: unknown) =>
      error instanceof AdminError && error.message === "Passwords do not match.",
  );

  const deptAdmin: AuthUser = {
    id: randomUUID(),
    email: `roads-admin-${randomUUID()}@test.local`,
    name: "Roads Admin",
    role: "DEPARTMENT_ADMIN",
    departmentId: roads.id,
    isActive: true,
  };
  const deptAdminContext = requireDepartmentAdminContext(deptAdmin);
  const createdByDeptAdmin = await createDepartmentWorker(deptAdminContext, {
    name: "Desk Added Worker",
    email: `desk-worker-${randomUUID()}@test.local`,
    password: "citygate1",
    confirmPassword: "citygate1",
  });
  assert.equal(createdByDeptAdmin.role, "WORKER");
  assert.equal(createdByDeptAdmin.departmentId, roads.id);
  assert.equal(createdByDeptAdmin.departmentId, createdByAdmin.departmentId);

  const listedAfterBoth = await listAdminUsers(admin, 1);
  assert.ok(listedAfterBoth.users.some((user) => user.id === createdByAdmin.id));
  assert.ok(
    listedAfterBoth.users.some((user) => user.id === createdByDeptAdmin.id),
  );

  try {
    await createAdminWorker(admin, {
      name: "Duplicate",
      email: createdByAdmin.email,
      password: "citygate1",
      confirmPassword: "citygate1",
      departmentId: parks.id,
    });
    assert.fail("expected duplicate email to fail");
  } catch (error) {
    assert.ok(error instanceof AdminError);
    assert.equal(
      error.message,
      "An account with this email already exists. Use a different email.",
    );
  }

  await prisma.user.deleteMany({
    where: {
      id: { in: [createdByAdmin.id, createdByDeptAdmin.id, createdForParks.id] },
    },
  });

  const workerToDelete = await createAdminWorker(admin, {
    name: "Delete Me Worker",
    email: `delete-worker-${randomUUID()}@test.local`,
    password: "citygate1",
    confirmPassword: "citygate1",
    departmentId: roads.id,
  });
  await deleteAdminUser(admin, workerToDelete.id);
  assert.equal(
    await prisma.user.findUnique({ where: { id: workerToDelete.id } }),
    null,
  );

  const deptAdminToDelete = await prisma.user.create({
    data: {
      name: "Delete Me Dept Admin",
      email: `delete-dept-admin-${randomUUID()}@test.local`,
      role: "DEPARTMENT_ADMIN",
      departmentId: roads.id,
      passwordHash: "test",
      isActive: true,
    },
    select: { id: true },
  });
  await deleteAdminUser(admin, deptAdminToDelete.id);
  assert.equal(
    await prisma.user.findUnique({ where: { id: deptAdminToDelete.id } }),
    null,
  );

  await assert.rejects(
    () => deleteAdminUser(citizen, workerToDelete.id),
    /Super admin access is required/,
  );

  await assert.rejects(
    () => deleteAdminUser(admin, admin.id),
    (error: unknown) =>
      error instanceof AdminError &&
      error.message === "You cannot delete your own account from here.",
  );

  const citizenWithComplaint = await prisma.user.create({
    data: {
      name: "Citizen With Complaint",
      email: `citizen-complaint-${randomUUID()}@test.local`,
      role: "CITIZEN",
      passwordHash: "test",
      isActive: true,
    },
    select: { id: true },
  });
  const complaint = await prisma.complaint.create({
    data: {
      publicRef: `TST-${randomUUID().slice(0, 8)}`,
      citizenId: citizenWithComplaint.id,
      description: "Test complaint for delete guard",
      latitude: 28.6139,
      longitude: 77.209,
      imageUrl: "https://example.com/test.jpg",
      status: "SUBMITTED",
    },
    select: { id: true },
  });

  await assert.rejects(
    () => deleteAdminUser(admin, citizenWithComplaint.id),
    (error: unknown) =>
      error instanceof AdminError &&
      /Cannot delete Citizen With Complaint because they have filed 1 complaint/.test(
        error.message,
      ),
  );

  await prisma.complaint.delete({ where: { id: complaint.id } });
  await prisma.user.delete({ where: { id: citizenWithComplaint.id } });

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

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
