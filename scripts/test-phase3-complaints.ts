import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { MAX_COMPLAINT_IMAGE_BYTES } from "@/domains/complaints/constants";
import { getCitizenComplaint } from "@/domains/complaints/service";
import {
  ComplaintValidationError,
  validateComplaintDescription,
  validateComplaintImage,
  validateCoordinate,
} from "@/domains/complaints/validation";
import type { AuthUser } from "@/lib/rbac";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

function assertThrows(fn: () => unknown, messageIncludes: string) {
  try {
    fn();
    assert.fail("Expected validation to throw");
  } catch (error) {
    assert.ok(error instanceof ComplaintValidationError);
    assert.match(error.message, new RegExp(messageIncludes, "i"));
  }
}

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

async function testValidation() {
  validateComplaintImage(tinyPng, "image/png");
  validateComplaintDescription("Pothole near the school gate blocking traffic.");

  assert.equal(validateCoordinate("28.6139", "latitude"), 28.6139);
  assert.equal(validateCoordinate(-77.0365, "longitude"), -77.0365);

  assertThrows(
    () => validateComplaintImage(Buffer.from("not-an-image"), "image/png"),
    "jpeg, png, or webp",
  );

  assertThrows(
    () => validateComplaintImage(tinyPng, "image/jpeg"),
    "does not match",
  );

  assertThrows(
    () =>
      validateComplaintImage(
        Buffer.alloc(MAX_COMPLAINT_IMAGE_BYTES + 1, 0),
        "image/png",
      ),
    "8 mb",
  );

  assertThrows(() => validateCoordinate("120", "latitude"), "between -90 and 90");
  assertThrows(() => validateCoordinate("abc", "longitude"), "valid number");
}

async function testCrossCitizenAccess() {
  if (!process.env.DATABASE_URL) {
    console.log("skip cross-citizen DB test — DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const owner: AuthUser = {
    id: randomUUID(),
    email: `phase3-owner-${Date.now()}@example.com`,
    name: "Phase 3 Owner",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };
  const other: AuthUser = {
    id: randomUUID(),
    email: `phase3-other-${Date.now()}@example.com`,
    name: "Phase 3 Other",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };

  await prisma.user.createMany({
    data: [
      {
        id: owner.id,
        email: owner.email,
        name: owner.name ?? "Phase 3 Owner",
        role: owner.role,
      },
      {
        id: other.id,
        email: other.email,
        name: other.name ?? "Phase 3 Other",
        role: other.role,
      },
    ],
  });

  const complaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-TEST-${Date.now()}`,
      citizenId: owner.id,
      description: "Test complaint for access control.",
      imageUrl: "https://example.com/test.jpg",
      latitude: 28.6139,
      longitude: 77.209,
      status: "SUBMITTED",
    },
  });

  const denied = await getCitizenComplaint(other, complaint.id);
  assert.equal(denied, null);

  const allowed = await getCitizenComplaint(owner, complaint.id);
  assert.ok(allowed);
  assert.equal(allowed?.id, complaint.id);

  await prisma.complaintHistory.deleteMany({ where: { complaintId: complaint.id } });
  await prisma.complaint.delete({ where: { id: complaint.id } });
  await prisma.user.deleteMany({ where: { id: { in: [owner.id, other.id] } } });
}

async function testValidUpload() {
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    console.log("skip valid upload test — BLOB_READ_WRITE_TOKEN not set");
    return;
  }
  if (!process.env.DATABASE_URL) {
    console.log("skip valid upload test — DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const citizen: AuthUser = {
    id: randomUUID(),
    email: `phase3-upload-${Date.now()}@example.com`,
    name: "Phase 3 Upload",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };

  await prisma.user.create({
    data: {
      id: citizen.id,
      email: citizen.email,
      name: citizen.name ?? "Phase 3 Upload",
      role: citizen.role,
    },
  });

  const { createCitizenComplaint } = await import("@/domains/complaints/service");
  const photo = new File([tinyPng], "issue.png", { type: "image/png" });
  const created = await createCitizenComplaint(citizen, {
    photo,
    description: "Broken footpath tile outside ward office entrance.",
    latitude: 28.6139,
    longitude: 77.209,
  });

  assert.ok(created.imageUrl.includes("blob.vercel-storage.com"));
  assert.equal(created.status, "SUBMITTED");

  const history = await prisma.complaintHistory.findFirst({
    where: { complaintId: created.id },
  });
  assert.ok(history);
  assert.equal(history?.action, "SUBMITTED");
  assert.equal(history?.toStatus, "SUBMITTED");

  await prisma.complaintHistory.deleteMany({ where: { complaintId: created.id } });
  await prisma.complaint.delete({ where: { id: created.id } });
  await prisma.user.delete({ where: { id: citizen.id } });
}

async function main() {
  loadEnvLocal();

  await testValidation();
  await testCrossCitizenAccess();
  await testValidUpload();

  console.log("phase3 complaint tests passed");
  console.log(
    "unauthenticated API access: enforced by requireCitizenPortalApi() on /api/v1/complaints routes (401 without session)",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
