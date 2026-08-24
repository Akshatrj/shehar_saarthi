import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import { USER_ROLES, type UserRole } from "@/domains/auth/types";
import { AdminError, ADMIN_PAGE_SIZE, assertSuperAdmin } from "@/domains/admin/auth";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: { id: string; name: string; code: string } | null;
  isActive: boolean;
  createdAt: string;
};

function parseRole(value: unknown): UserRole {
  if (typeof value !== "string") {
    throw new AdminError("Please choose a valid role.");
  }
  const normalized = value.trim().toUpperCase();
  if (!USER_ROLES.includes(normalized as UserRole)) {
    throw new AdminError("Please choose a valid role.");
  }
  return normalized as UserRole;
}

export async function listAdminUsers(actor: AuthUser, page = 1) {
  assertSuperAdmin(actor);
  const safePage = page > 0 ? page : 1;

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE + 1,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      department: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const hasMore = rows.length > ADMIN_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, ADMIN_PAGE_SIZE) : rows;

  return {
    users: pageRows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      department: row.department
        ? {
            id: row.department.id,
            name: row.department.name,
            code: row.department.slug,
          }
        : null,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
    })),
    page: safePage,
    hasMore,
  };
}

export async function updateAdminUser(
  actor: AuthUser,
  userId: string,
  input: {
    role: unknown;
    departmentId: unknown;
    isActive: unknown;
  },
) {
  assertSuperAdmin(actor);

  const role = parseRole(input.role);
  const isActive =
    input.isActive === true ||
    input.isActive === "true" ||
    input.isActive === "on";

  let departmentId: string | null = null;
  if (role === "STAFF") {
    if (typeof input.departmentId !== "string" || !input.departmentId.trim()) {
      throw new AdminError("Staff users must be linked to a department.");
    }
    const department = await prisma.department.findFirst({
      where: { id: input.departmentId.trim(), isActive: true },
      select: { id: true },
    });
    if (!department) {
      throw new AdminError("Please choose an active department.");
    }
    departmentId = department.id;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!existing) {
    throw new AdminError("User not found.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      departmentId,
      isActive,
    },
  });
}

export async function assertAdminAccessDenied(actor: AuthUser) {
  try {
    assertSuperAdmin(actor);
    throw new Error("Expected access to be denied.");
  } catch (error) {
    if (error instanceof AdminError) {
      return;
    }
    throw error;
  }
}
