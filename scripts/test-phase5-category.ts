import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  changeCitizenCategory,
  confirmCitizenCategory,
  CategoryConfirmationError,
} from "@/domains/complaints/category-confirmation";
import {
  CategoryRoutingError,
  parseComplaintCategory,
  parseDepartmentId,
  resolveDepartmentIdForRouting,
} from "@/domains/complaints/routing";
import type { AuthUser } from "@/lib/rbac";
import {
  beginDepartmentTest,
  createTestDepartment,
  finishDepartmentTest,
  loadEnvLocal,
} from "./test-fixtures";

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
  const id = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
  assert.equal(parseDepartmentId(id), id);

  assertThrows(
    () => parseComplaintCategory("ALIEN"),
    CategoryRoutingError,
    "valid category",
  );
  assertThrows(
    () => parseDepartmentId("not-a-department"),
    CategoryRoutingError,
    "valid department",
  );
}

async function testRoutingRules() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.log("skip routing DB tests — DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const harness = await beginDepartmentTest(prisma);
  try {
    const primary = await createTestDepartment(harness, {
      categories: ["POTHOLE"],
    });
    const otherDesk = await createTestDepartment(harness, {
      categories: ["OTHER"],
    });

    const potholeDept = await resolveDepartmentIdForRouting({
      category: "POTHOLE",
    });
    assert.equal(potholeDept.id, primary.id);

    await assert.rejects(
      () =>
        resolveDepartmentIdForRouting({
          category: "POTHOLE",
          departmentId: otherDesk.id,
        }),
      CategoryRoutingError,
    );

    const other = await resolveDepartmentIdForRouting({
      category: "OTHER",
      departmentId: otherDesk.id,
    });
    assert.equal(other.id, otherDesk.id);
  } finally {
    await finishDepartmentTest(harness);
  }
}

async function testComplaintFlows() {
  loadEnvLocal();
  if (!process.env.DATABASE_URL) {
    console.log("skip category-confirmation DB tests — DATABASE_URL not set");
    return;
  }

  const { prisma } = await import("@/lib/db");
  const harness = await beginDepartmentTest(prisma);
  try {
    const potholeDept = await createTestDepartment(harness, {
      categories: ["POTHOLE"],
    });
    const otherDept = await createTestDepartment(harness, {
      categories: ["OTHER"],
    });
    const garbageDept = await createTestDepartment(harness, {
      categories: ["GARBAGE"],
    });

    const owner: AuthUser = {
      id: randomUUID(),
      email: `owner-${randomUUID()}@test.local`,
      name: "Owner",
      role: "CITIZEN",
      departmentId: null,
      isActive: true,
    };
    const other: AuthUser = {
      id: randomUUID(),
      email: `other-${randomUUID()}@test.local`,
      name: "Other",
      role: "CITIZEN",
      departmentId: null,
      isActive: true,
    };

    const ownerRow = await prisma.user.create({
      data: {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: "CITIZEN",
        isActive: true,
      },
    });
    harness.userIds.push(ownerRow.id);
    const otherRow = await prisma.user.create({
      data: {
        id: other.id,
        email: other.email,
        name: other.name,
        role: "CITIZEN",
        isActive: true,
      },
    });
    harness.userIds.push(otherRow.id);

    const complaint = await prisma.complaint.create({
      data: {
        publicRef: `SS-P5-${Date.now()}`,
        citizenId: owner.id,
        description: "A deep pothole blocking the lane.",
        imageUrl: "https://example.public.blob.vercel-storage.com/test.jpg",
        latitude: 28.6139,
        longitude: 77.209,
        status: "SUBMITTED",
        aiCategory: "POTHOLE",
      },
    });
    harness.complaintIds.push(complaint.id);

    await confirmCitizenCategory(owner, complaint.id);
    const routed = await prisma.complaint.findUnique({
      where: { id: complaint.id },
      include: { department: true },
    });
    assert.equal(routed?.status, "ROUTED");
    assert.equal(routed?.category, "POTHOLE");
    assert.equal(routed?.departmentId, potholeDept.id);

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
    harness.complaintIds.push(manualComplaint.id);

    await changeCitizenCategory(owner, manualComplaint.id, "OTHER", otherDept.id);
    const manualRouted = await prisma.complaint.findUnique({
      where: { id: manualComplaint.id },
    });
    assert.equal(manualRouted?.category, "OTHER");
    assert.equal(manualRouted?.departmentId, otherDept.id);

    await assert.rejects(
      () => changeCitizenCategory(owner, manualComplaint.id, "GARBAGE"),
      CategoryConfirmationError,
    );

    const changeComplaint = await prisma.complaint.create({
      data: {
        publicRef: `SS-P5C-${Date.now()}`,
        citizenId: owner.id,
        description: "Garbage pile on the street corner.",
        imageUrl: "https://example.public.blob.vercel-storage.com/test3.jpg",
        latitude: 28.6139,
        longitude: 77.209,
        status: "SUBMITTED",
      },
    });
    harness.complaintIds.push(changeComplaint.id);

    await changeCitizenCategory(owner, changeComplaint.id, "GARBAGE");
    const changed = await prisma.complaint.findUnique({
      where: { id: changeComplaint.id },
    });
    assert.equal(changed?.departmentId, garbageDept.id);
  } finally {
    await finishDepartmentTest(harness);
  }
}

async function main() {
  testParsing();
  await testRoutingRules();
  await testComplaintFlows();
  console.log("phase5 category tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
