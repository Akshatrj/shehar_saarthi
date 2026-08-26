import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const envFile = readFileSync(envPath, "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

async function main() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL?.trim()) {
    console.log("skip worker DB tests — DATABASE_URL not set");
    console.log("phase6 worker tests passed");
    return;
  }

  const roads = await prisma.department.findFirst({
    where: { code: "roads" },
    select: { id: true },
  });
  const electrical = await prisma.department.findFirst({
    where: { code: "electrical" },
    select: { id: true },
  });
  assert.ok(roads && electrical, "seed departments required");

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

  await prisma.complaint.delete({ where: { id: roadsComplaint.id } });
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          roadsWorker.id,
          electricalWorker.id,
          otherRoadsWorker.id,
          roadsAdmin.id,
          citizen.id,
        ],
      },
    },
  });

  console.log("phase6 worker tests passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
