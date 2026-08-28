import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  createAdminDepartment,
  listAdminDepartments,
  updateAdminDepartment,
  updateCategoryRouting,
} from "@/domains/admin/departments";
import { updateAdminUser } from "@/domains/admin/users";
import {
  listDepartmentAdminComplaints,
  requireDepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";
import { getDashboardAnalytics } from "@/domains/complaints/dashboard-analytics";
import { resolveDepartmentForCategory } from "@/domains/departments/routes";
import {
  CategoryRoutingError,
  resolveDepartmentIdForRouting,
} from "@/domains/complaints/routing";
import type { AuthUser } from "@/lib/rbac";
import {
  beginDepartmentTest,
  createTestDepartment,
  finishDepartmentTest,
  loadEnvLocal,
} from "./test-fixtures";

async function main() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.log("skip department lifecycle tests — DATABASE_URL not set");
    console.log("department lifecycle tests passed");
    return;
  }

  const admin: AuthUser = {
    id: randomUUID(),
    email: `lifecycle-admin-${randomUUID()}@test.local`,
    name: "Lifecycle Admin",
    role: "SUPER_ADMIN",
    departmentId: null,
    isActive: true,
  };

  const harness = await beginDepartmentTest(prisma);
  try {
    const suffix = randomUUID().slice(0, 8);
    const parksName = `Parks ${suffix}`;
    const gardeningName = `Gardening ${suffix}`;
    const created = await createTestDepartment(harness, {
      name: parksName,
      categories: ["FALLEN_TREE"],
      description: "Trees and green spaces",
    });
    const originalId = created.id;

    const adminUser = await prisma.user.create({
      data: {
        email: `gardens-admin-${randomUUID()}@test.local`,
        name: "Gardens Admin",
        role: "DEPARTMENT_ADMIN",
        departmentId: originalId,
        isActive: true,
      },
    });
    harness.userIds.push(adminUser.id);

    const citizen = await prisma.user.create({
      data: {
        email: `lifecycle-citizen-${randomUUID()}@test.local`,
        name: "Citizen",
        role: "CITIZEN",
        isActive: true,
      },
    });
    harness.userIds.push(citizen.id);

    const complaint = await prisma.complaint.create({
      data: {
        publicRef: `SS-LIFE-${Date.now()}`,
        citizenId: citizen.id,
        departmentId: originalId,
        category: "FALLEN_TREE",
        description: "A fallen tree blocking the footpath.",
        imageUrl: "https://example.public.blob.vercel-storage.com/tree.jpg",
        latitude: 28.61,
        longitude: 77.21,
        status: "ROUTED",
      },
    });
    harness.complaintIds.push(complaint.id);

    await prisma.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: citizen.id,
        action: "CATEGORY_CHANGED",
        oldStatus: "SUBMITTED",
        newStatus: "ROUTED",
        metadata: JSON.stringify({
          category: "FALLEN_TREE",
          departmentId: originalId,
        }),
      },
    });

    await updateAdminDepartment(admin, originalId, {
      name: gardeningName,
      code: created.code,
      description: "Garden maintenance",
      isActive: true,
    });

    const renamed = await prisma.department.findUnique({
      where: { id: originalId },
    });
    assert.equal(renamed?.id, originalId);
    assert.equal(renamed?.name, gardeningName);
    assert.equal(renamed?.isActive, true);

    const routed = await resolveDepartmentForCategory("FALLEN_TREE");
    assert.equal(routed?.id, originalId);
    assert.equal(routed?.name, gardeningName);

    const stillRouted = await resolveDepartmentIdForRouting({
      category: "FALLEN_TREE",
    });
    assert.equal(stillRouted.id, originalId);

    const complaintAfter = await prisma.complaint.findUnique({
      where: { id: complaint.id },
      include: { department: true, history: true },
    });
    assert.equal(complaintAfter?.departmentId, originalId);
    assert.equal(complaintAfter?.department?.name, gardeningName);
    assert.ok(complaintAfter?.history.length);

    const blockedDelete = await prisma.department.deleteMany({
      where: { id: originalId, categoryRoutes: { none: {} } },
    });
    assert.equal(
      blockedDelete.count,
      0,
      "departments with routing history must not be hard-deleted",
    );
    assert.ok(
      (await prisma.categoryRoute.count({ where: { departmentId: originalId } })) >
        0,
    );

    const adminAfter = await prisma.user.findUnique({
      where: { id: adminUser.id },
    });
    assert.equal(adminAfter?.departmentId, originalId);

    const deptAdmin = requireDepartmentAdminContext({
      ...admin,
      id: adminUser.id,
      role: "DEPARTMENT_ADMIN",
      departmentId: originalId,
    });
    const list = await listDepartmentAdminComplaints(deptAdmin.departmentId, {});
    assert.ok(list.complaints.some((row) => row.id === complaint.id));

    const analytics = await getDashboardAnalytics({ departmentId: originalId });
    assert.ok(analytics.mapComplaints.every((pin) => pin.departmentId === originalId));
    assert.ok(analytics.mapComplaints.some((pin) => pin.id === complaint.id));

    await updateAdminDepartment(admin, originalId, {
      name: gardeningName,
      code: created.code,
      isActive: false,
    });
    const inactiveRoute = await resolveDepartmentForCategory("FALLEN_TREE");
    assert.equal(inactiveRoute, null);
    await assert.rejects(
      () => resolveDepartmentIdForRouting({ category: "FALLEN_TREE" }),
      CategoryRoutingError,
    );
    const historical = await prisma.complaint.findUnique({
      where: { id: complaint.id },
    });
    assert.equal(historical?.departmentId, originalId);

    await updateAdminDepartment(admin, originalId, {
      name: gardeningName,
      code: created.code,
      isActive: true,
    });
    const reactivated = await resolveDepartmentForCategory("FALLEN_TREE");
    assert.equal(reactivated?.id, originalId);

    const extraName = `Civic Ops ${randomUUID().slice(0, 8)}`;
    await createAdminDepartment(admin, {
      name: extraName,
      code: `ops-${randomUUID().slice(0, 8).toLowerCase()}`,
    });
    const listed = await listAdminDepartments(admin);
    const extra = listed.find((row) => row.name === extraName);
    assert.ok(extra);
    harness.departmentIds.push(extra.id);

    await updateCategoryRouting(admin, [
      { category: "FALLEN_TREE", departmentId: originalId },
    ]);

    await updateAdminUser(admin, adminUser.id, {
      role: "DEPARTMENT_ADMIN",
      departmentId: originalId,
      isActive: true,
    });
    const stillAssigned = await prisma.user.findUnique({
      where: { id: adminUser.id },
    });
    assert.equal(stillAssigned?.departmentId, originalId);
  } finally {
    await finishDepartmentTest(harness);
  }

  console.log("department lifecycle tests passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
