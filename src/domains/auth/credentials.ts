import { timingSafeEqual } from "node:crypto";
import type { User } from "next-auth";
import {
  FOUNDATION_ACCOUNTS,
  isFoundationAuthEnabled,
  type FoundationAccount,
} from "@/lib/foundation-auth";
import { prisma } from "@/lib/db";
import { roleRequiresDepartment } from "@/lib/rbac";
import { verifyPassword } from "@/domains/auth/password";
import type { SyncedUser } from "@/domains/auth/sync-user";

function secretsEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    timingSafeEqual(leftBuffer, leftBuffer);
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function findFoundationAccount(
  email: string,
  password: string,
): FoundationAccount | null {
  const matchedEmail = FOUNDATION_ACCOUNTS.find((account) =>
    secretsEqual(account.email, email),
  );
  if (!matchedEmail || !secretsEqual(matchedEmail.password, password)) {
    return null;
  }
  return matchedEmail;
}

async function resolveDepartmentId(role: FoundationAccount["role"]) {
  if (!roleRequiresDepartment(role)) {
    return null;
  }

  const department = await prisma.department.findFirst({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true },
  });

  return department?.id ?? null;
}

async function upsertFoundationUser(
  account: FoundationAccount,
): Promise<SyncedUser | null> {
  const departmentId = await resolveDepartmentId(account.role);
  const existing = await prisma.user.findUnique({
    where: { email: account.email },
    select: { id: true, departmentId: true },
  });

  const assignedDepartmentId = existing?.departmentId ?? departmentId;
  if (roleRequiresDepartment(account.role) && !assignedDepartmentId) {
    return null;
  }

  const data = {
    name: account.name,
    role: account.role,
    departmentId: assignedDepartmentId,
    isActive: true,
  } as const;

  const row = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          departmentId: true,
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          email: account.email,
          ...data,
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

  return row;
}

function toAuthUser(synced: SyncedUser): User {
  return {
    id: synced.id,
    email: synced.email,
    name: synced.name,
    image: synced.image,
    role: synced.role,
    departmentId: synced.departmentId,
    isActive: synced.isActive,
  };
}

function parseCredentials(
  credentials: Partial<Record<"email" | "password", unknown>>,
) {
  const email =
    typeof credentials.email === "string"
      ? credentials.email.trim().toLowerCase()
      : "";
  const password =
    typeof credentials.password === "string" ? credentials.password : "";

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

async function authorizePasswordCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      departmentId: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user?.passwordHash || !user.isActive) {
    return null;
  }

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) {
    return null;
  }

  return toAuthUser(user);
}

export async function authorizeFoundationCredentials(
  credentials: Partial<Record<"email" | "password", unknown>>,
): Promise<User | null> {
  if (!isFoundationAuthEnabled()) {
    return null;
  }

  const parsed = parseCredentials(credentials);
  if (!parsed) {
    return null;
  }

  const account = findFoundationAccount(parsed.email, parsed.password);
  if (!account) {
    return null;
  }

  const synced = await upsertFoundationUser(account);
  if (!synced || !synced.isActive) {
    return null;
  }

  return toAuthUser(synced);
}

export async function authorizeCredentials(
  credentials: Partial<Record<"email" | "password", unknown>>,
): Promise<User | null> {
  const parsed = parseCredentials(credentials);
  if (!parsed) {
    return null;
  }

  const passwordUser = await authorizePasswordCredentials(
    parsed.email,
    parsed.password,
  );
  if (passwordUser) {
    return passwordUser;
  }

  return authorizeFoundationCredentials(parsed);
}
