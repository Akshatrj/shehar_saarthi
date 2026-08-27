import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import type { AuthUser } from "@/lib/rbac";
import { validateRoleDepartmentRules } from "@/lib/rbac";
import {
  createWorkerAccount,
  WorkerAccountError,
} from "@/domains/auth/create-worker";
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
  if (normalized === "STAFF") {
    return "WORKER";
  }
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
        select: { id: true, name: true, code: true },
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
      department: row.department,
      isActive: row.isActive,
      createdAt: row.createdAt.toISOString(),
    })),
    page: safePage,
    hasMore,
  };
}

export async function createAdminWorker(
  actor: AuthUser,
  input: {
    name: unknown;
    email: unknown;
    password: unknown;
    confirmPassword: unknown;
    departmentId: unknown;
  },
) {
  assertSuperAdmin(actor);

  try {
    return await createWorkerAccount({
      name: String(input.name ?? ""),
      email: String(input.email ?? ""),
      password: String(input.password ?? ""),
      confirmPassword: String(input.confirmPassword ?? ""),
      departmentId: String(input.departmentId ?? ""),
    });
  } catch (error) {
    if (error instanceof WorkerAccountError) {
      throw new AdminError(error.message);
    }
    throw error;
  }
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

  if (userId === actor.id) {
    throw new AdminError("You cannot change your own role or account here.");
  }

  const role = parseRole(input.role);
  const isActive =
    input.isActive === true ||
    input.isActive === "true" ||
    input.isActive === "on";

  let departmentId: string | null = null;
  if (role === "WORKER" || role === "DEPARTMENT_ADMIN") {
    if (typeof input.departmentId !== "string" || !input.departmentId.trim()) {
      throw new AdminError("Workers and department admins must be linked to a department.");
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

  const ruleError = validateRoleDepartmentRules(role, departmentId);
  if (ruleError) {
    throw new AdminError(ruleError);
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

export async function deleteAdminUser(actor: AuthUser, userId: string) {
  assertSuperAdmin(actor);

  const trimmedId = userId.trim();
  if (!trimmedId) {
    throw new AdminError("User not found.");
  }

  if (trimmedId === actor.id) {
    throw new AdminError("You cannot delete your own account from here.");
  }

  const target = await prisma.user.findUnique({
    where: { id: trimmedId },
    select: {
      id: true,
      name: true,
      _count: {
        select: { complaints: true },
      },
    },
  });

  if (!target) {
    throw new AdminError("User not found.");
  }

  if (target._count.complaints > 0) {
    throw new AdminError(
      `Cannot delete ${target.name} because they have filed ${target._count.complaints} complaint(s). Municipal records must be preserved. Deactivate the account instead.`,
    );
  }

  try {
    await prisma.user.delete({
      where: { id: trimmedId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      throw new AdminError(
        "Cannot delete this user because related records still reference them. Deactivate the account instead.",
      );
    }
    throw error;
  }
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

export async function getAdminDashboardStats(actor: AuthUser) {
  assertSuperAdmin(actor);

  const [
    totalUsers,
    citizens,
    workers,
    departmentAdmins,
    departments,
    totalComplaints,
    openComplaints,
    completedComplaints,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CITIZEN" } }),
    prisma.user.count({ where: { role: "WORKER" } }),
    prisma.user.count({ where: { role: "DEPARTMENT_ADMIN" } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.complaint.count(),
    prisma.complaint.count({
      where: { status: { notIn: ["COMPLETED", "CLOSED"] } },
    }),
    prisma.complaint.count({
      where: { status: { in: ["COMPLETED", "CLOSED"] } },
    }),
  ]);

  return {
    totalUsers,
    citizens,
    workers,
    departmentAdmins,
    departments,
    totalComplaints,
    openComplaints,
    completedComplaints,
  };
}
