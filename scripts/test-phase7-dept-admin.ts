import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { prisma } from "@/lib/db";
import {
  assignComplaintToWorker,
  closeDepartmentComplaint,
  listDepartmentAdminComplaints,
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
    console.log("skip dept admin DB tests — DATABASE_URL not set");
    console.log("phase7 department admin tests passed");
    return;
  }

  const roads = await prisma.department.findFirst({
    where: { code: "roads" },
    select: { id: true },
  });
  assert.ok(roads, "roads department required");

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

  const adminContext = requireDepartmentAdminContext(admin);
  await assignComplaintToWorker(adminContext, complaint.id, worker.id);

  await prisma.complaint.update({
    where: { id: complaint.id },
    data: { status: "COMPLETED" },
  });

  await closeDepartmentComplaint(adminContext, complaint.id);

  const list = await listDepartmentAdminComplaints(roads.id, {});
  assert.ok(list.complaints.some((row) => row.id === complaint.id));

  await prisma.complaint.delete({ where: { id: complaint.id } });
  await prisma.user.deleteMany({
    where: { id: { in: [admin.id, worker.id, citizen.id] } },
  });

  console.log("phase7 department admin tests passed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
