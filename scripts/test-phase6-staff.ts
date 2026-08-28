import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import {
  completeWorkerComplaint,
  getWorkerComplaintDetail,
  listWorkerComplaints,
  requireWorkerContext,
  startComplaintProgress,
} from "@/domains/complaints/worker-service";
import {
  assignComplaintToWorker,
  requireDepartmentAdminContext,
} from "@/domains/complaints/department-admin-service";
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
    console.log("skip worker DB tests — DATABASE_URL not set");
    console.log("phase6 worker tests passed");
    return;
  }

  const harness = await beginDepartmentTest(prisma);
  try {
  const roads = await createTestDepartment(harness, { categories: ["POTHOLE"] });
  const electrical = await createTestDepartment(harness, {
    categories: ["BROKEN_STREETLIGHT"],
  });

  const roadsWorker: AuthUser = {
    id: randomUUID(),
    email: `worker-roads-${randomUUID()}@test.local`,
    name: "Roads Worker",
    role: "WORKER",
    departmentId: roads.id,
    isActive: true,
  };
  const electricalWorker: AuthUser = {
    id: randomUUID(),
    email: `worker-electrical-${randomUUID()}@test.local`,
    name: "Electrical Worker",
    role: "WORKER",
    departmentId: electrical.id,
    isActive: true,
  };
  const otherRoadsWorker: AuthUser = {
    id: randomUUID(),
    email: `worker-roads-b-${randomUUID()}@test.local`,
    name: "Other Roads Worker",
    role: "WORKER",
    departmentId: roads.id,
    isActive: true,
  };
  const roadsAdmin: AuthUser = {
    id: randomUUID(),
    email: `roads-admin-${randomUUID()}@test.local`,
    name: "Roads Admin",
    role: "DEPARTMENT_ADMIN",
    departmentId: roads.id,
    isActive: true,
  };

  await prisma.user.createMany({
    data: [
      {
        id: roadsWorker.id,
        email: roadsWorker.email,
        name: roadsWorker.name,
        role: "WORKER",
        departmentId: roads.id,
        isActive: true,
      },
      {
        id: electricalWorker.id,
        email: electricalWorker.email,
        name: electricalWorker.name,
        role: "WORKER",
        departmentId: electrical.id,
        isActive: true,
      },
      {
        id: otherRoadsWorker.id,
        email: otherRoadsWorker.email,
        name: otherRoadsWorker.name,
        role: "WORKER",
        departmentId: roads.id,
        isActive: true,
      },
      {
        id: roadsAdmin.id,
        email: roadsAdmin.email,
        name: roadsAdmin.name,
        role: "DEPARTMENT_ADMIN",
        departmentId: roads.id,
        isActive: true,
      },
    ],
  });

  const citizen = await prisma.user.create({
    data: {
      email: `citizen-${randomUUID()}@test.local`,
      name: "Test Citizen",
      role: "CITIZEN",
      isActive: true,
    },
    select: { id: true },
  });

  const roadsComplaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-T-${Math.floor(Math.random() * 900000 + 100000)}`,
      citizenId: citizen.id,
      departmentId: roads.id,
      description: "Worker phase test",
      imageUrl: "https://example.com/photo.jpg",
      latitude: 28.61,
      longitude: 77.2,
      status: "ROUTED",
      category: "POTHOLE",
    },
    select: { id: true },
  });
  harness.complaintIds.push(roadsComplaint.id);
  harness.userIds.push(
    roadsWorker.id,
    electricalWorker.id,
    otherRoadsWorker.id,
    roadsAdmin.id,
    citizen.id,
  );

  const roadsContext = requireWorkerContext(roadsWorker);
  const electricalContext = requireWorkerContext(electricalWorker);
  const otherRoadsContext = requireWorkerContext(otherRoadsWorker);
  const adminContext = requireDepartmentAdminContext(roadsAdmin);

  assert.equal(
    (await listWorkerComplaints(roadsContext, {})).complaints.some(
      (complaint) => complaint.id === roadsComplaint.id,
    ),
    false,
  );
  assert.equal(
    await getWorkerComplaintDetail(electricalContext, roadsComplaint.id),
    null,
  );
  assert.equal(
    await getWorkerComplaintDetail(otherRoadsContext, roadsComplaint.id),
    null,
  );

  await assignComplaintToWorker(
    adminContext,
    roadsComplaint.id,
    roadsWorker.id,
  );

  assert.ok(
    (await listWorkerComplaints(roadsContext, {})).complaints.some(
      (complaint) => complaint.id === roadsComplaint.id,
    ),
  );
  assert.equal(
    (await listWorkerComplaints(otherRoadsContext, {})).complaints.some(
      (complaint) => complaint.id === roadsComplaint.id,
    ),
    false,
  );
  assert.equal(
    await getWorkerComplaintDetail(otherRoadsContext, roadsComplaint.id),
    null,
  );

  await startComplaintProgress(roadsContext, roadsComplaint.id);
  await completeWorkerComplaint(roadsContext, roadsComplaint.id);
  } finally {
    await finishDepartmentTest(harness);
  }

  console.log("phase6 worker tests passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
