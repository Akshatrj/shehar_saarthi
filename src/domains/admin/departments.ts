import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import { AdminError, assertSuperAdmin } from "@/domains/admin/auth";

export type AdminDepartmentRow = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
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

export async function listAdminDepartments(actor: AuthUser) {
  assertSuperAdmin(actor);

  const rows = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createAdminDepartment(
  actor: AuthUser,
  input: { name: unknown; code: unknown },
) {
  assertSuperAdmin(actor);

  const name = parseDepartmentName(input.name);
  const code = parseDepartmentCode(input.code);

  const existing = await prisma.department.findFirst({
    where: { OR: [{ name }, { code }] },
    select: { id: true },
  });
  if (existing) {
    throw new AdminError("A department with that name or code already exists.");
  }

  return prisma.department.create({
    data: { name, code, isActive: true },
    select: { id: true },
  }).then(() => undefined);
}

export async function updateAdminDepartment(
  actor: AuthUser,
  departmentId: string,
  input: { name: unknown; code: unknown; isActive: unknown },
) {
  assertSuperAdmin(actor);

  const name = parseDepartmentName(input.name);
  const code = parseDepartmentCode(input.code);
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
    data: { name, code, isActive },
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
