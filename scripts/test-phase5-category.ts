import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  changeCitizenCategory,
  confirmCitizenCategory,
  CategoryConfirmationError,
} from "@/domains/complaints/category-confirmation";
import {
  CategoryRoutingError,
  parseComplaintCategory,
  parseDepartmentSlug,
  resolveDepartmentIdForRouting,
} from "@/domains/complaints/routing";
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

function assertThrows(
  fn: () => unknown,
  ErrorType: new (...args: never[]) => Error,
  messageIncludes: string,
) {
  try {
    fn();
    assert.fail("Expected error");
  } catch (error) {
    assert.ok(error instanceof ErrorType);
    assert.match(error.message, new RegExp(messageIncludes, "i"));
  }
}

function testParsing() {
  assert.equal(parseComplaintCategory("POTHOLE"), "POTHOLE");
  assert.equal(parseDepartmentSlug("roads"), "roads");

  assertThrows(
    () => parseComplaintCategory("ALIEN"),
    CategoryRoutingError,
    "valid category",
  );
  assertThrows(
    () => parseDepartmentSlug("fire"),
    CategoryRoutingError,
    "valid department",
  );
}

async function testRoutingRules() {
  if (!process.env.DATABASE_URL) {
    console.log("skip routing DB tests — DATABASE_URL not set");
    return;
  }

  const roads = await resolveDepartmentIdForRouting({
    category: "POTHOLE",
  });
  assert.equal(roads.code, "roads");

  await assert.rejects(
    () =>
      resolveDepartmentIdForRouting({
        category: "POTHOLE",
        manualDepartmentSlug: "electrical",
      }),
    CategoryRoutingError,
  );

  const other = await resolveDepartmentIdForRouting({
    category: "OTHER",
    manualDepartmentSlug: "sanitation",
  });
  assert.equal(other.code, "sanitation");
}

async function testComplaintFlows() {
  if (!process.env.DATABASE_URL) {
    console.log("skip complaint flow DB tests — DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const owner: AuthUser = {
    id: randomUUID(),
    email: `phase5-owner-${Date.now()}@example.com`,
    name: "Phase 5 Owner",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };
  const other: AuthUser = {
    id: randomUUID(),
    email: `phase5-other-${Date.now()}@example.com`,
    name: "Phase 5 Other",
    role: "CITIZEN",
    departmentId: null,
    isActive: true,
  };

  await prisma.user.createMany({
    data: [
      {
        id: owner.id,
        email: owner.email,
        name: owner.name ?? "Owner",
        role: owner.role,
      },
      {
        id: other.id,
        email: other.email,
        name: other.name ?? "Other",
        role: other.role,
      },
    ],
  });

  const complaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-P5-${Date.now()}`,
      citizenId: owner.id,
      description: "Large pothole near the market crossing.",
      imageUrl: "https://example.public.blob.vercel-storage.com/test.jpg",
      latitude: 28.6139,
      longitude: 77.209,
      status: "SUBMITTED",
      aiCategory: "POTHOLE",
      aiDescription: "Large damaged area of road is visible.",
    },
  });

  await confirmCitizenCategory(owner, complaint.id);

  const routed = await prisma.complaint.findUnique({
    where: { id: complaint.id },
    include: { department: true },
  });
  assert.equal(routed?.status, "ROUTED");
  assert.equal(routed?.category, "POTHOLE");
  assert.equal(routed?.department?.code, "roads");

  const history = await prisma.complaintHistory.findFirst({
    where: { complaintId: complaint.id, action: "CATEGORY_CONFIRMED" },
  });
  assert.ok(history);
  assert.match(history?.metadata ?? "", /AI_CONFIRMED/);

  await assert.rejects(
    () => confirmCitizenCategory(owner, complaint.id),
    CategoryConfirmationError,
  );

  await assert.rejects(
    () => confirmCitizenCategory(other, complaint.id),
    CategoryConfirmationError,
  );

  const manualComplaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-P5M-${Date.now()}`,
      citizenId: owner.id,
      description: "Miscellaneous civic issue.",
      imageUrl: "https://example.public.blob.vercel-storage.com/test2.jpg",
      latitude: 28.6139,
      longitude: 77.209,
      status: "SUBMITTED",
    },
  });

  await changeCitizenCategory(owner, manualComplaint.id, "OTHER", "parks");

  const manualRouted = await prisma.complaint.findUnique({
    where: { id: manualComplaint.id },
    include: { department: true },
  });
  assert.equal(manualRouted?.category, "OTHER");
  assert.equal(manualRouted?.department?.code, "parks");

  await assert.rejects(
    () => changeCitizenCategory(owner, manualComplaint.id, "GARBAGE"),
    CategoryConfirmationError,
  );

  await assert.rejects(
    () =>
      changeCitizenCategory(owner, manualComplaint.id, "GARBAGE", "electrical"),
    CategoryConfirmationError,
  );

  const changeComplaint = await prisma.complaint.create({
    data: {
      publicRef: `SS-P5C-${Date.now()}`,
      citizenId: owner.id,
      description: "Trash pile on corner.",
      imageUrl: "https://example.public.blob.vercel-storage.com/test3.jpg",
      latitude: 28.6139,
      longitude: 77.209,
      status: "SUBMITTED",
      aiCategory: "GARBAGE",
    },
  });

  await changeCitizenCategory(owner, changeComplaint.id, "GARBAGE");

  const changed = await prisma.complaint.findUnique({
    where: { id: changeComplaint.id },
    include: { department: true },
  });
  assert.equal(changed?.department?.code, "sanitation");

  const changedHistory = await prisma.complaintHistory.findFirst({
    where: { complaintId: changeComplaint.id, action: "CATEGORY_CHANGED" },
  });
  assert.ok(changedHistory);
  assert.match(changedHistory?.metadata ?? "", /USER_SELECTED/);

  await prisma.complaintHistory.deleteMany({
    where: {
      complaintId: {
        in: [complaint.id, manualComplaint.id, changeComplaint.id],
      },
    },
  });
  await prisma.complaint.deleteMany({
    where: {
      id: { in: [complaint.id, manualComplaint.id, changeComplaint.id] },
    },
  });
  await prisma.user.deleteMany({ where: { id: { in: [owner.id, other.id] } } });
}

async function main() {
  loadEnvLocal();
  testParsing();
  await testRoutingRules();
  await testComplaintFlows();
  console.log("phase5 category routing tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
