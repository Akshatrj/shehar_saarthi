import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComplaintCategory, Prisma, PrismaClient } from "@prisma/client";

export function loadEnvLocal() {
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

export type DepartmentTestHarness = {
  prisma: PrismaClient;
  originalRoutes: Array<{ category: ComplaintCategory; departmentId: string }>;
  departmentIds: string[];
  userIds: string[];
  complaintIds: string[];
};

export async function beginDepartmentTest(
  prisma: PrismaClient,
): Promise<DepartmentTestHarness> {
  const testDepartments = await prisma.department.findMany({
    where: { code: { startsWith: "t-" } },
    select: { id: true, code: true },
  });
  const leftoverTestDeptIds = new Set(
    testDepartments
      .filter((row) => /^t-[a-f0-9]{12}$/.test(row.code))
      .map((row) => row.id),
  );
  const originalRoutes = (
    await prisma.categoryRoute.findMany({
      select: { category: true, departmentId: true },
    })
  ).filter((route) => !leftoverTestDeptIds.has(route.departmentId));
  return {
    prisma,
    originalRoutes,
    departmentIds: [],
    userIds: [],
    complaintIds: [],
  };
}

export async function createTestDepartment(
  harness: DepartmentTestHarness,
  input: {
    name?: string;
    categories?: ComplaintCategory[];
    isActive?: boolean;
    description?: string;
  } = {},
) {
  const suffix = randomUUID().replaceAll("-", "").slice(0, 12);
  const row = await harness.prisma.department.create({
    data: {
      name: input.name ?? `Test Department ${suffix}`,
      code: `t-${suffix}`,
      description: input.description ?? null,
      isActive: input.isActive ?? true,
      supportedCategories: input.categories ?? [],
    },
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
      description: true,
    },
  });
  harness.departmentIds.push(row.id);

  for (const category of input.categories ?? []) {
    await harness.prisma.categoryRoute.upsert({
      where: { category },
      create: { category, departmentId: row.id },
      update: { departmentId: row.id },
    });
  }

  return row;
}

function complaintCleanupWhere(
  harness: DepartmentTestHarness,
): Prisma.ComplaintWhereInput | null {
  const filters: Prisma.ComplaintWhereInput[] = [];
  if (harness.complaintIds.length) {
    filters.push({ id: { in: harness.complaintIds } });
  }
  if (harness.userIds.length) {
    filters.push({ citizenId: { in: harness.userIds } });
    filters.push({ assignedWorkerId: { in: harness.userIds } });
    filters.push({ routedById: { in: harness.userIds } });
  }
  if (harness.departmentIds.length) {
    filters.push({ departmentId: { in: harness.departmentIds } });
    filters.push({ recommendedDepartmentId: { in: harness.departmentIds } });
  }
  if (!filters.length) return null;
  return { OR: filters };
}

export async function finishDepartmentTest(harness: DepartmentTestHarness) {
  const { prisma } = harness;
  const complaintWhere = complaintCleanupWhere(harness);

  if (complaintWhere) {
    await prisma.complaintHistory.deleteMany({
      where: { complaint: complaintWhere },
    });
    await prisma.aiClassificationLog.deleteMany({
      where: { complaint: complaintWhere },
    });
    await prisma.complaint.deleteMany({ where: complaintWhere });
  }

  const userFilters: Prisma.UserWhereInput[] = [];
  if (harness.userIds.length) {
    userFilters.push({ id: { in: harness.userIds } });
  }
  if (harness.departmentIds.length) {
    userFilters.push({ departmentId: { in: harness.departmentIds } });
  }
  if (userFilters.length) {
    await prisma.user.deleteMany({ where: { OR: userFilters } });
  }

  await prisma.categoryRoute.deleteMany({});
  if (harness.originalRoutes.length) {
    await prisma.categoryRoute.createMany({
      data: harness.originalRoutes.map((route) => ({
        category: route.category,
        departmentId: route.departmentId,
      })),
    });
  }

  const existing = await prisma.categoryRoute.findMany({
    select: { category: true },
  });
  const routed = new Set(existing.map((row) => row.category));
  const departments = await prisma.department.findMany({
    where: { isActive: true, NOT: { code: { startsWith: "t-" } } },
    orderBy: { createdAt: "asc" },
    select: { id: true, supportedCategories: true },
  });
  for (const department of departments) {
    for (const category of department.supportedCategories) {
      if (routed.has(category)) continue;
      await prisma.categoryRoute.create({
        data: { category, departmentId: department.id },
      });
      routed.add(category);
    }
  }

  if (harness.departmentIds.length) {
    await prisma.department.deleteMany({
      where: { id: { in: harness.departmentIds } },
    });
  }
}
