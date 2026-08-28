import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import { AdminError, assertSuperAdmin } from "@/domains/admin/auth";
import {
  saveCategoryRoutes,
  getCategoryRouteMap,
} from "@/domains/departments/routes";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";

export type AdminDepartmentRow = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CategoryRoutingRow = {
  category: ComplaintCategory;
  label: string;
  departmentId: string;
};

function parseDepartmentName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : "";
  if (name.length < 2 || name.length > 80) {
    throw new AdminError("Department name must be between 2 and 80 characters.");
  }
  return name;
}

export function parseDepartmentCode(value: unknown) {
  const code = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[a-z0-9-]{2,32}$/.test(code)) {
    throw new AdminError(
      "Department code must be 2–32 lowercase letters, numbers, or hyphens.",
    );
  }
  return code;
}

function parseDepartmentDescription(value: unknown) {
  if (value == null || value === "") {
    return null;
  }
  const description = typeof value === "string" ? value.trim() : "";
  if (description.length > 500) {
    throw new AdminError("Department description must be 500 characters or fewer.");
  }
  return description || null;
}

export async function listAdminDepartments(actor: AuthUser) {
  assertSuperAdmin(actor);

  const rows = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      description: true,
      isActive: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listCategoryRouting(actor: AuthUser): Promise<CategoryRoutingRow[]> {
  assertSuperAdmin(actor);
  const routes = await getCategoryRouteMap();

  return COMPLAINT_CATEGORIES.map((category) => ({
    category,
    label: COMPLAINT_CATEGORY_LABELS[category],
    departmentId: routes.get(category)?.id ?? "",
  }));
}

export async function updateCategoryRouting(
  actor: AuthUser,
  assignments: Array<{ category: unknown; departmentId: unknown }>,
) {
  assertSuperAdmin(actor);

  await saveCategoryRoutes(
    assignments.map((assignment) => {
      const category =
        typeof assignment.category === "string"
          ? (assignment.category as ComplaintCategory)
          : null;
      if (!category || !COMPLAINT_CATEGORIES.includes(category)) {
        throw new AdminError("Please choose a valid category.");
      }
      const departmentId =
        typeof assignment.departmentId === "string" &&
        assignment.departmentId.trim()
          ? assignment.departmentId.trim()
          : null;
      return { category, departmentId };
    }),
  );
}

export async function createAdminDepartment(
  actor: AuthUser,
  input: { name: unknown; code: unknown; description?: unknown },
) {
  assertSuperAdmin(actor);

  const name = parseDepartmentName(input.name);
  const code = parseDepartmentCode(input.code);
  const description = parseDepartmentDescription(input.description);

  const existing = await prisma.department.findFirst({
    where: { OR: [{ name }, { code }] },
    select: { id: true },
  });
  if (existing) {
    throw new AdminError("A department with that name or code already exists.");
  }

  await prisma.department.create({
    data: { name, code, description, isActive: true },
    select: { id: true },
  });
}

export async function updateAdminDepartment(
  actor: AuthUser,
  departmentId: string,
  input: {
    name: unknown;
    code: unknown;
    description?: unknown;
    isActive: unknown;
  },
) {
  assertSuperAdmin(actor);

  const name = parseDepartmentName(input.name);
  const code = parseDepartmentCode(input.code);
  const description = parseDepartmentDescription(input.description);
  const isActive =
    input.isActive === true ||
    input.isActive === "true" ||
    input.isActive === "on";

  const existing = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true },
  });
  if (!existing) {
    throw new AdminError("Department not found.");
  }

  const conflict = await prisma.department.findFirst({
    where: {
      OR: [{ name }, { code }],
      NOT: { id: departmentId },
    },
    select: { id: true },
  });
  if (conflict) {
    throw new AdminError("A department with that name or code already exists.");
  }

  await prisma.department.update({
    where: { id: departmentId },
    data: { name, code, description, isActive },
  });
}

export async function listActiveDepartmentsForSelect(actor: AuthUser) {
  assertSuperAdmin(actor);
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });
}

export async function listActiveDepartmentsForCitizen() {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });
}
