import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  assignComplaintToWorker,
  closeDepartmentComplaint,
  createDepartmentWorker,
  DepartmentAdminError,
  listDepartmentAdminComplaints,
  requireDepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";
import { getDashboardAnalytics } from "@/domains/complaints/dashboard-analytics";
import type { AuthUser } from "@/lib/rbac";

import {
  beginDepartmentTest,
  createTestDepartment,
  finishDepartmentTest,
  loadEnvLocal,
} from "./test-fixtures";

async function main() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL?.trim()) {
    console.log("skip dept admin DB tests — DATABASE_URL not set");
    console.log("phase7 department admin tests passed");
    return;
  }

  const harness = await beginDepartmentTest(prisma);
  try {
  const roads = await createTestDepartment(harness, { categories: ["POTHOLE"] });
  const parks = await createTestDepartment(harness, { categories: ["FALLEN_TREE"] });

  const admin: AuthUser = {
    id: randomUUID(),
    email: `dept-admin-${randomUUID()}@test.local`,
    name: "Roads Admin",
    role: "DEPARTMENT_ADMIN",
    departmentId: roads.id,
    isActive: true,
  };
  const worker = await prisma.user.create({
    data: {
      email: `worker-assign-${randomUUID()}@test.local`,
      name: "Assign Worker",
      role: "WORKER",
      departmentId: roads.id,
      isActive: true,
    },
    select: { id: true },
  });
  await prisma.user.create({
    data: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "DEPARTMENT_ADMIN",
      departmentId: roads.id,
      isActive: true,
    },
  });
  harness.userIds.push(admin.id, worker.id);

  const citizen = await prisma.user.create({
    data: {
      email: `citizen-dept-${randomUUID()}@test.local`,
      name: "Citizen",
      role: "CITIZEN",
      isActive: true,
    },
    select: { id: true },
  });

  const complaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-D-${Math.floor(Math.random() * 900000 + 100000)}`,
      citizenId: citizen.id,
      departmentId: roads.id,
      description: "Dept admin test",
      imageUrl: "https://example.com/photo.jpg",
      latitude: 28.61,
      longitude: 77.2,
      status: "ROUTED",
      category: "POTHOLE",
    },
    select: { id: true },
  });
  harness.complaintIds.push(complaint.id);

  const adminContext = requireDepartmentAdminContext(admin);

  const createdWorker = await createDepartmentWorker(adminContext, {
    name: "Desk Added Worker",
    email: `desk-worker-${randomUUID()}@test.local`,
    password: "citygate1",
    confirmPassword: "citygate1",
  });
  assert.equal(createdWorker.role, "WORKER");
  assert.equal(createdWorker.departmentId, roads.id);
  harness.userIds.push(createdWorker.id);

  try {
    await createDepartmentWorker(adminContext, {
      name: "Duplicate",
      email: createdWorker.email,
      password: "citygate1",
      confirmPassword: "citygate1",
    });
    assert.fail("expected duplicate email to fail");
  } catch (error) {
    assert.ok(error instanceof DepartmentAdminError);
  }

  try {
    await createDepartmentWorker(adminContext, {
      name: "A",
      email: `short-${randomUUID()}@test.local`,
      password: "citygate1",
      confirmPassword: "citygate1",
    });
    assert.fail("expected short name to fail");
  } catch (error) {
    assert.ok(error instanceof DepartmentAdminError);
  }

  const parksComplaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-P-${Math.floor(Math.random() * 900000 + 100000)}`,
      citizenId: citizen.id,
      departmentId: parks.id,
      description: "Parks only pin",
      imageUrl: "https://example.com/parks.jpg",
      latitude: 28.62,
      longitude: 77.21,
      status: "ROUTED",
      category: "FALLEN_TREE",
    },
    select: { id: true },
  });
  harness.complaintIds.push(parksComplaint.id);
  harness.userIds.push(admin.id, worker.id, citizen.id);

  await assignComplaintToWorker(adminContext, complaint.id, worker.id);
  try {
    await assignComplaintToWorker(adminContext, complaint.id, worker.id);
    assert.fail("expected assigning the same worker again to fail");
  } catch (error) {
    assert.ok(error instanceof DepartmentAdminError);
  }

  await assignComplaintToWorker(adminContext, complaint.id, createdWorker.id);
  const reassigned = await prisma.complaint.findUnique({
    where: { id: complaint.id },
    select: { assignedWorkerId: true, status: true },
  });
  assert.equal(reassigned?.assignedWorkerId, createdWorker.id);
  assert.equal(reassigned?.status, "ASSIGNED");

  await prisma.complaint.update({
    where: { id: complaint.id },
    data: { status: "IN_PROGRESS" },
  });
  await assignComplaintToWorker(adminContext, complaint.id, worker.id);
  const afterProgressReassign = await prisma.complaint.findUnique({
    where: { id: complaint.id },
    select: { assignedWorkerId: true, status: true },
  });
  assert.equal(afterProgressReassign?.assignedWorkerId, worker.id);
  assert.equal(afterProgressReassign?.status, "ASSIGNED");

  await prisma.complaint.update({
    where: { id: complaint.id },
    data: { status: "COMPLETED" },
  });

  try {
    await assignComplaintToWorker(adminContext, complaint.id, createdWorker.id);
    assert.fail("expected completed complaints to reject reassignment");
  } catch (error) {
    assert.ok(error instanceof DepartmentAdminError);
  }

  await closeDepartmentComplaint(adminContext, complaint.id);

  const list = await listDepartmentAdminComplaints(roads.id, {});
  assert.ok(list.complaints.some((row) => row.id === complaint.id));

  const roadsMap = await getDashboardAnalytics({ departmentId: roads.id });
  assert.ok(roadsMap.mapComplaints.every((pin) => pin.departmentId === roads.id));
  assert.ok(roadsMap.mapComplaints.some((pin) => pin.id === complaint.id));
  assert.equal(
    roadsMap.mapComplaints.some((pin) => pin.id === parksComplaint.id),
    false,
  );

  await prisma.complaint.deleteMany({
    where: { id: { in: [complaint.id, parksComplaint.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [admin.id, worker.id, citizen.id, createdWorker.id] } },
  });
  } finally {
    await finishDepartmentTest(harness);
  }

  console.log("phase7 department admin tests passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
