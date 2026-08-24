import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assignComplaintToSelf,
  completeStaffComplaint,
  getStaffComplaintDetail,
  listStaffComplaints,
  requireStaffContext,
  StaffComplaintError,
  startComplaintProgress,
} from "@/domains/complaints/staff-service";
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
  if (!process.env.DATABASE_URL) {
    console.log("skip phase6 staff tests — DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");

  const roadsDept = await prisma.department.findUnique({
    where: { slug: "roads" },
    select: { id: true },
  });
  const electricalDept = await prisma.department.findUnique({
    where: { slug: "electrical" },
    select: { id: true },
  });

  if (!roadsDept || !electricalDept) {
    throw new Error("Expected seeded departments.");
  }

  const roadsStaff: AuthUser = {
    id: randomUUID(),
    email: `roads-staff-${Date.now()}@example.com`,
    name: "Roads Staff",
    role: "STAFF",
    departmentId: roadsDept.id,
    isActive: true,
  };
  const electricalStaff: AuthUser = {
    id: randomUUID(),
    email: `electrical-staff-${Date.now()}@example.com`,
    name: "Electrical Staff",
    role: "STAFF",
    departmentId: electricalDept.id,
    isActive: true,
  };
  const citizenId = randomUUID();

  await prisma.user.createMany({
    data: [
      {
        id: roadsStaff.id,
        email: roadsStaff.email,
        name: roadsStaff.name,
        role: "STAFF",
        departmentId: roadsDept.id,
      },
      {
        id: electricalStaff.id,
        email: electricalStaff.email,
        name: electricalStaff.name,
        role: "STAFF",
        departmentId: electricalDept.id,
      },
      {
        id: citizenId,
        email: `phase6-citizen-${Date.now()}@example.com`,
        name: "Phase 6 Citizen",
        role: "CITIZEN",
      },
    ],
  });

  const electricalComplaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-ELEC-${Date.now()}`,
      citizenId,
      departmentId: electricalDept.id,
      description: "Broken streetlight on main road.",
      imageUrl: "https://example.public.blob.vercel-storage.com/electrical.jpg",
      latitude: 28.6139,
      longitude: 77.209,
      status: "ROUTED",
      category: "BROKEN_STREETLIGHT",
    },
  });

  const roadsComplaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-ROAD-${Date.now()}`,
      citizenId,
      departmentId: roadsDept.id,
      description: "Large pothole near crossing.",
      imageUrl: "https://example.public.blob.vercel-storage.com/roads.jpg",
      latitude: 28.6139,
      longitude: 77.209,
      status: "ROUTED",
      category: "POTHOLE",
    },
  });

  const roadsContext = requireStaffContext(roadsStaff);
  const electricalContext = requireStaffContext(electricalStaff);

  const crossAccess = await getStaffComplaintDetail(
    roadsContext.departmentId,
    electricalComplaint.id,
  );
  assert.equal(crossAccess, null);

  const roadsList = await listStaffComplaints(roadsContext.departmentId, {});
  assert.ok(roadsList.complaints.some((item) => item.id === roadsComplaint.id));
  assert.ok(
    !roadsList.complaints.some((item) => item.id === electricalComplaint.id),
  );

  await assignComplaintToSelf(roadsContext, roadsComplaint.id);

  const assigned = await prisma.complaint.findUnique({
    where: { id: roadsComplaint.id },
  });
  assert.equal(assigned?.status, "ASSIGNED");
  assert.equal(assigned?.assignedWorkerId, roadsStaff.id);

  await assert.rejects(
    () => assignComplaintToSelf(electricalContext, roadsComplaint.id),
    StaffComplaintError,
  );

  await startComplaintProgress(roadsContext, roadsComplaint.id);
  await completeStaffComplaint(roadsContext, roadsComplaint.id);

  const completed = await prisma.complaint.findUnique({
    where: { id: roadsComplaint.id },
  });
  assert.equal(completed?.status, "COMPLETED");

  await assert.rejects(
    () => startComplaintProgress(electricalContext, roadsComplaint.id),
    StaffComplaintError,
  );

  await prisma.complaintHistory.deleteMany({
    where: { complaintId: { in: [roadsComplaint.id, electricalComplaint.id] } },
  });
  await prisma.complaint.deleteMany({
    where: { id: { in: [roadsComplaint.id, electricalComplaint.id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [roadsStaff.id, electricalStaff.id, citizenId] } },
  });

  console.log("phase6 staff tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
