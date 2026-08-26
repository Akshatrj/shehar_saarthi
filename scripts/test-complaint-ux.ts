import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  COMPULSORY_MESSAGE,
  hasWizardProgress,
  validateWizardStep,
} from "@/domains/complaints/wizard-validation";
import {
  ComplaintValidationError,
  validateOptionalContactPhone,
} from "@/domains/complaints/validation";
import type { AuthUser } from "@/lib/rbac";

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

const emptyWizard = {
  photo: null,
  category: null,
  description: "",
  latitude: "",
  longitude: "",
  phone: "",
};

function testPhoneValidation() {
  assert.equal(validateOptionalContactPhone(""), null);
  assert.equal(validateOptionalContactPhone(null), null);
  assert.equal(validateOptionalContactPhone("9876543210"), "9876543210");
  assert.equal(validateOptionalContactPhone("+919876543210"), "+919876543210");
  assert.equal(validateOptionalContactPhone("98765 43210"), "9876543210");

  try {
    validateOptionalContactPhone("12345");
    assert.fail("expected invalid phone to throw");
  } catch (error) {
    assert.ok(error instanceof ComplaintValidationError);
  }

  try {
    validateOptionalContactPhone("919876543210");
    assert.fail("expected 12-digit without plus to throw");
  } catch (error) {
    assert.ok(error instanceof ComplaintValidationError);
  }
}

function testRequiredFieldBlocking() {
  const step1 = validateWizardStep(1, emptyWizard);
  assert.equal(step1.form, COMPULSORY_MESSAGE);
  assert.ok(step1.category);

  const step2 = validateWizardStep(2, {
    ...emptyWizard,
    category: "POTHOLE",
  });
  assert.equal(step2.form, COMPULSORY_MESSAGE);
  assert.ok(step2.photo);
  assert.ok(step2.description);

  const step2WithPhoto = validateWizardStep(2, {
    ...emptyWizard,
    category: "POTHOLE",
    photo: { size: 1200 },
    description: "Broken road near the ward office gate.",
    phone: "not-a-phone",
  });
  assert.equal(step2WithPhoto.form, undefined);
  assert.ok(step2WithPhoto.phone);

  const step3 = validateWizardStep(3, {
    ...emptyWizard,
    category: "POTHOLE",
    photo: { size: 1200 },
    description: "Broken road near the ward office gate.",
  });
  assert.equal(step3.form, COMPULSORY_MESSAGE);
  assert.ok(step3.latitude);
  assert.ok(step3.longitude);

  const complete = validateWizardStep(3, {
    photo: { size: 1200 },
    category: "POTHOLE",
    description: "Broken road near the ward office gate.",
    latitude: "28.6139",
    longitude: "77.2090",
    phone: "",
  });
  assert.deepEqual(complete, {});

  assert.equal(hasWizardProgress(emptyWizard), false);
  assert.equal(
    hasWizardProgress({ ...emptyWizard, phone: "9876543210" }),
    true,
  );
}

async function testDeleteAuthorization() {
  if (!process.env.DATABASE_URL) {
    console.log("skip delete auth DB tests — DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const {
    cancelCitizenComplaint,
    ComplaintServiceError,
    deleteComplaintAndStorage,
    reopenCitizenComplaint,
  } = await import("@/domains/complaints/service");
  const { deleteAdminComplaint } = await import("@/domains/admin/complaints");
  const {
    DepartmentAdminError,
    deleteDepartmentComplaint,
    requireDepartmentAdminContext,
  } = await import("@/domains/complaints/department-admin-service");

  const roads = await prisma.department.findFirst({
    where: { code: "roads" },
    select: { id: true },
  });
  const water = await prisma.department.findFirst({
    where: { code: "water" },
    select: { id: true },
  });
  assert.ok(roads, "roads department required");

  const owner: AuthUser = {
    id: randomUUID(),
    email: `ux-owner-${randomUUID()}@test.local`,
    name: "UX Owner",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };
  const other: AuthUser = {
    id: randomUUID(),
    email: `ux-other-${randomUUID()}@test.local`,
    name: "UX Other",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };
  const superAdmin: AuthUser = {
    id: randomUUID(),
    email: `ux-admin-${randomUUID()}@test.local`,
    name: "UX Admin",
    role: "SUPER_ADMIN",
    departmentId: null,
    isActive: true,
  };
  const deptAdmin: AuthUser = {
    id: randomUUID(),
    email: `ux-dept-${randomUUID()}@test.local`,
    name: "UX Dept Admin",
    role: "DEPARTMENT_ADMIN",
    departmentId: roads.id,
    isActive: true,
  };
  const otherDeptAdmin: AuthUser = {
    id: randomUUID(),
    email: `ux-dept-other-${randomUUID()}@test.local`,
    name: "UX Other Dept",
    role: "DEPARTMENT_ADMIN",
    departmentId: water?.id ?? roads.id,
    isActive: true,
  };

  await prisma.user.createMany({
    data: [
      { id: owner.id, email: owner.email, name: owner.name ?? "Owner", role: "CITIZEN" },
      { id: other.id, email: other.email, name: other.name ?? "Other", role: "CITIZEN" },
      {
        id: superAdmin.id,
        email: superAdmin.email,
        name: superAdmin.name ?? "Admin",
        role: "SUPER_ADMIN",
      },
      {
        id: deptAdmin.id,
        email: deptAdmin.email,
        name: deptAdmin.name ?? "Dept",
        role: "DEPARTMENT_ADMIN",
        departmentId: roads.id,
      },
      {
        id: otherDeptAdmin.id,
        email: otherDeptAdmin.email,
        name: otherDeptAdmin.name ?? "Other Dept",
        role: "DEPARTMENT_ADMIN",
        departmentId: otherDeptAdmin.departmentId,
      },
    ],
  });

  async function createComplaint(status: "SUBMITTED" | "COMPLETED" | "ROUTED") {
    return prisma.complaint.create({
      data: {
        publicRef: `SS-UX-${Math.floor(Math.random() * 900000 + 100000)}`,
        citizenId: owner.id,
        departmentId: status === "SUBMITTED" ? null : roads.id,
        description: "UX cancel/delete test complaint.",
        imageUrl: "https://example.com/ux-test.jpg",
        latitude: 28.6139,
        longitude: 77.209,
        status,
        category: "POTHOLE",
        contactPhone: "9876543210",
      },
      select: { id: true },
    });
  }

  const otherOwned = await createComplaint("SUBMITTED");
  await assert.rejects(
    () => cancelCitizenComplaint(other, otherOwned.id),
    (error: unknown) =>
      error instanceof ComplaintServiceError && error.status === 404,
  );
  const stillThere = await prisma.complaint.findUnique({
    where: { id: otherOwned.id },
    select: { id: true },
  });
  assert.ok(stillThere);

  const completed = await createComplaint("COMPLETED");
  await assert.rejects(
    () => cancelCitizenComplaint(owner, completed.id),
    (error: unknown) =>
      error instanceof ComplaintServiceError &&
      error.status === 403 &&
      /completed or closed/i.test(error.message),
  );

  await assert.rejects(
    () => reopenCitizenComplaint(owner, completed.id, "too short"),
    (error: unknown) =>
      error instanceof ComplaintServiceError && error.status === 400,
  );

  await reopenCitizenComplaint(
    owner,
    completed.id,
    "The pothole is still open and unsafe.",
  );
  const reopenedWithoutWorker = await prisma.complaint.findUnique({
    where: { id: completed.id },
    select: { status: true, assignedWorkerId: true },
  });
  assert.equal(reopenedWithoutWorker?.status, "ROUTED");
  assert.equal(reopenedWithoutWorker?.assignedWorkerId, null);

  await assert.rejects(
    () =>
      reopenCitizenComplaint(
        owner,
        completed.id,
        "The pothole is still open and unsafe.",
      ),
    (error: unknown) =>
      error instanceof ComplaintServiceError && error.status === 403,
  );

  const worker = await prisma.user.create({
    data: {
      email: `ux-worker-${randomUUID()}@test.local`,
      name: "UX Worker",
      role: "WORKER",
      departmentId: roads.id,
      isActive: true,
    },
    select: { id: true },
  });
  const closed = await prisma.complaint.create({
    data: {
      publicRef: `SS-UX-${Math.floor(Math.random() * 900000 + 100000)}`,
      citizenId: owner.id,
      departmentId: roads.id,
      assignedWorkerId: worker.id,
      description: "UX reopen closed complaint.",
      imageUrl: "https://example.com/ux-closed.jpg",
      latitude: 28.6139,
      longitude: 77.209,
      status: "CLOSED",
      category: "POTHOLE",
    },
    select: { id: true },
  });
  await reopenCitizenComplaint(
    owner,
    closed.id,
    "Work was marked done but the street is still dark.",
  );
  const reopenedClosed = await prisma.complaint.findUnique({
    where: { id: closed.id },
    select: { status: true, assignedWorkerId: true },
  });
  assert.equal(reopenedClosed?.status, "ASSIGNED");
  assert.equal(reopenedClosed?.assignedWorkerId, worker.id);

  const citizenCancellable = await createComplaint("SUBMITTED");
  await prisma.complaintHistory.create({
    data: {
      complaintId: citizenCancellable.id,
      actorId: owner.id,
      action: "SUBMITTED",
      oldStatus: null,
      newStatus: "SUBMITTED",
    },
  });
  await cancelCitizenComplaint(owner, citizenCancellable.id);
  assert.equal(
    await prisma.complaint.findUnique({ where: { id: citizenCancellable.id } }),
    null,
  );
  assert.equal(
    await prisma.complaintHistory.count({
      where: { complaintId: citizenCancellable.id },
    }),
    0,
  );

  const adminTarget = await createComplaint("COMPLETED");
  await assert.rejects(
    () => deleteAdminComplaint(owner, adminTarget.id),
    /Super admin access is required/,
  );
  await deleteAdminComplaint(superAdmin, adminTarget.id);
  assert.equal(
    await prisma.complaint.findUnique({ where: { id: adminTarget.id } }),
    null,
  );

  const deptTarget = await createComplaint("ROUTED");
  const deptContext = requireDepartmentAdminContext(deptAdmin);
  if (water && otherDeptAdmin.departmentId !== roads.id) {
    const foreignContext = requireDepartmentAdminContext(otherDeptAdmin);
    await assert.rejects(
      () => deleteDepartmentComplaint(foreignContext, deptTarget.id),
      (error: unknown) =>
        error instanceof DepartmentAdminError && /not found/i.test(error.message),
    );
  }
  await deleteDepartmentComplaint(deptContext, deptTarget.id);
  assert.equal(
    await prisma.complaint.findUnique({ where: { id: deptTarget.id } }),
    null,
  );

  await deleteComplaintAndStorage(otherOwned.id);
  await deleteComplaintAndStorage(completed.id).catch(() => undefined);
  await deleteComplaintAndStorage(closed.id).catch(() => undefined);

  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          owner.id,
          other.id,
          superAdmin.id,
          deptAdmin.id,
          otherDeptAdmin.id,
          worker.id,
        ],
      },
    },
  });
}

async function main() {
  loadEnvLocal();
  testPhoneValidation();
  testRequiredFieldBlocking();
  await testDeleteAuthorization();
  console.log("complaint UX tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
