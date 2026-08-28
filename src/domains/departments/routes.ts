import { prisma } from "@/lib/db";
import type { ComplaintCategory } from "@/domains/complaints/types";
import { COMPLAINT_CATEGORIES } from "@/domains/complaints/types";

export type RoutedDepartment = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
};

export async function getCategoryRouteMap() {
  const rows = await prisma.categoryRoute.findMany({
    select: {
      category: true,
      department: {
        select: { id: true, name: true, code: true, isActive: true },
      },
    },
  });

  const map = new Map<ComplaintCategory, RoutedDepartment>();
  for (const row of rows) {
    map.set(row.category, row.department);
  }
  return map;
}

export async function resolveDepartmentForCategory(
  category: ComplaintCategory,
): Promise<RoutedDepartment | null> {
  const route = await prisma.categoryRoute.findUnique({
    where: { category },
    select: {
      department: {
        select: { id: true, name: true, code: true, isActive: true },
      },
    },
  });

  if (!route?.department.isActive) {
    return null;
  }

  return route.department;
}

export async function listDepartmentsForSelect(options?: { activeOnly?: boolean }) {
  return prisma.department.findMany({
    where: options?.activeOnly === false ? undefined : { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true, isActive: true },
  });
}

export async function syncSupportedCategoriesFromRoutes() {
  const routes = await prisma.categoryRoute.findMany({
    select: { category: true, departmentId: true },
  });

  const byDepartment = new Map<string, ComplaintCategory[]>();
  for (const route of routes) {
    const current = byDepartment.get(route.departmentId) ?? [];
    current.push(route.category);
    byDepartment.set(route.departmentId, current);
  }

  const departments = await prisma.department.findMany({
    select: { id: true },
  });

  await prisma.$transaction(
    departments.map((department) =>
      prisma.department.update({
        where: { id: department.id },
        data: {
          supportedCategories: byDepartment.get(department.id) ?? [],
        },
      }),
    ),
  );
}

export async function saveCategoryRoutes(
  assignments: Array<{ category: ComplaintCategory; departmentId: string | null }>,
) {
  const known = new Set<string>(COMPLAINT_CATEGORIES);

  await prisma.$transaction(async (tx) => {
    for (const assignment of assignments) {
      if (!known.has(assignment.category)) {
        continue;
      }

      if (!assignment.departmentId) {
        await tx.categoryRoute.deleteMany({
          where: { category: assignment.category },
        });
        continue;
      }

      const department = await tx.department.findUnique({
        where: { id: assignment.departmentId },
        select: { id: true },
      });
      if (!department) {
        continue;
      }

      await tx.categoryRoute.upsert({
        where: { category: assignment.category },
        create: {
          category: assignment.category,
          departmentId: assignment.departmentId,
        },
        update: { departmentId: assignment.departmentId },
      });
    }
  });

  await syncSupportedCategoriesFromRoutes();
}
