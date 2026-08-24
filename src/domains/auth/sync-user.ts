import type { UserRole } from "@/domains/auth/types";
import { prisma } from "@/lib/db";

export type SyncedUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
  departmentId: string | null;
  isActive: boolean;
};

function superAdminEmail() {
  return process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

function isSuperAdminEmail(email: string) {
  const configured = superAdminEmail();
  return configured.length > 0 && email.toLowerCase() === configured;
}

function asUserRole(value: string): UserRole {
  if (value === "STAFF" || value === "SUPER_ADMIN" || value === "CITIZEN") {
    return value;
  }
  return "CITIZEN";
}

export async function syncGoogleUser(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<SyncedUser> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.name?.trim() || email.split("@")[0] || "Citizen";
  const promoteToSuperAdmin = isSuperAdminEmail(email);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const role = promoteToSuperAdmin ? "SUPER_ADMIN" : asUserRole(existing.role);
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: displayName,
        image: input.image ?? null,
        ...(promoteToSuperAdmin ? { role: "SUPER_ADMIN" as const } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        departmentId: true,
        isActive: true,
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      image: updated.image,
      role,
      departmentId: updated.departmentId,
      isActive: updated.isActive,
    };
  }

  const created = await prisma.user.create({
    data: {
      email,
      name: displayName,
      image: input.image ?? null,
      role: promoteToSuperAdmin ? "SUPER_ADMIN" : "CITIZEN",
      departmentId: null,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      departmentId: true,
      isActive: true,
    },
  });

  return created;
}

export async function loadUserById(id: string): Promise<SyncedUser | null> {
  const row = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      departmentId: true,
      isActive: true,
    },
  });

  if (!row) {
    return null;
  }

  const email = row.email.toLowerCase();
  const role = isSuperAdminEmail(email) ? "SUPER_ADMIN" : asUserRole(row.role);

  if (role === "SUPER_ADMIN" && row.role !== "SUPER_ADMIN") {
    await prisma.user.update({
      where: { id: row.id },
      data: { role: "SUPER_ADMIN" },
    });
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    image: row.image,
    role,
    departmentId: row.departmentId,
    isActive: row.isActive,
  };
}

export async function loadUserByEmail(email: string): Promise<SyncedUser | null> {
  const row = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true },
  });
  if (!row) {
    return null;
  }
  return loadUserById(row.id);
}
