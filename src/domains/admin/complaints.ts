import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import { AdminError, ADMIN_PAGE_SIZE, assertSuperAdmin } from "@/domains/admin/auth";

export type AdminComplaintRow = {
  id: string;
  publicRef: string;
  description: string;
  imageUrl: string;
  category: string | null;
  status: string;
  createdAt: string;
  department: { id: string; name: string; code: string } | null;
};

export type AdminComplaintDetail = AdminComplaintRow & {
  aiCategory: string | null;
  aiDescription: string | null;
  citizen: { id: string; name: string; email: string };
};

function parseStatus(value: unknown): ComplaintStatus | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (!COMPLAINT_STATUSES.includes(normalized as ComplaintStatus)) {
    throw new AdminError("Invalid status filter.");
  }
  return normalized as ComplaintStatus;
}

function parseCategory(value: unknown): ComplaintCategory | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (!COMPLAINT_CATEGORIES.includes(normalized as ComplaintCategory)) {
    throw new AdminError("Invalid category filter.");
  }
  return normalized as ComplaintCategory;
}

function parseCategoryValue(value: unknown): ComplaintCategory {
  const category = parseCategory(value);
  if (!category) {
    throw new AdminError("Please choose a valid category.");
  }
  return category;
}

export async function listAdminComplaints(
  actor: AuthUser,
  input: {
    page?: number;
    departmentId?: string;
    status?: unknown;
    category?: unknown;
  },
) {
  assertSuperAdmin(actor);

  const page = input.page && input.page > 0 ? input.page : 1;
  const status = parseStatus(input.status);
  const category = parseCategory(input.category);

  const where = {
    ...(input.departmentId ? { departmentId: input.departmentId } : {}),
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
  };

  const rows = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE + 1,
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      category: true,
      status: true,
      createdAt: true,
      department: {
        select: { id: true, name: true, code: true },
      },
    },
  });

  const hasMore = rows.length > ADMIN_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, ADMIN_PAGE_SIZE) : rows;

  return {
    complaints: pageRows.map((row) => ({
      id: row.id,
      publicRef: row.publicRef,
      description: row.description,
      imageUrl: row.imageUrl,
      category: row.category,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      department: row.department,
    })),
    page,
    hasMore,
  };
}

export async function getAdminComplaintDetail(
  actor: AuthUser,
  complaintId: string,
): Promise<AdminComplaintDetail | null> {
  assertSuperAdmin(actor);

  const row = await prisma.complaint.findUnique({
    where: { id: complaintId },
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      category: true,
      aiCategory: true,
      aiDescription: true,
      status: true,
      createdAt: true,
      department: {
        select: { id: true, name: true, code: true },
      },
      citizen: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    publicRef: row.publicRef,
    description: row.description,
    imageUrl: row.imageUrl,
    category: row.category,
    aiCategory: row.aiCategory,
    aiDescription: row.aiDescription,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    department: row.department,
    citizen: row.citizen,
  };
}

export async function overrideAdminComplaint(
  actor: AuthUser,
  complaintId: string,
  input: { category?: unknown; departmentId?: unknown },
) {
  assertSuperAdmin(actor);

  const hasCategory = input.category !== undefined && input.category !== "";
  const hasDepartment =
    input.departmentId !== undefined && input.departmentId !== "";

  if (!hasCategory && !hasDepartment) {
    throw new AdminError("Provide a category and/or department to override.");
  }

  const category = hasCategory ? parseCategoryValue(input.category) : undefined;
  let departmentId: string | null | undefined;
  if (hasDepartment) {
    if (typeof input.departmentId !== "string" || !input.departmentId.trim()) {
      throw new AdminError("Please choose a valid department.");
    }
    const department = await prisma.department.findFirst({
      where: { id: input.departmentId.trim(), isActive: true },
      select: { id: true, name: true, code: true },
    });
    if (!department) {
      throw new AdminError("Please choose an active department.");
    }
    departmentId = department.id;
  }

  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findUnique({
      where: { id: complaintId },
      select: {
        id: true,
        status: true,
        category: true,
        departmentId: true,
      },
    });

    if (!complaint) {
      throw new AdminError("Complaint not found.");
    }

    const nextCategory = category ?? complaint.category;
    const nextDepartmentId =
      departmentId !== undefined ? departmentId : complaint.departmentId;

    if (
      nextCategory === complaint.category &&
      nextDepartmentId === complaint.departmentId
    ) {
      throw new AdminError("No changes were made.");
    }

    await tx.complaint.update({
      where: { id: complaint.id },
      data: {
        ...(category !== undefined ? { category } : {}),
        ...(departmentId !== undefined ? { departmentId } : {}),
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: actor.id,
        action: "ADMIN_OVERRIDE",
        oldStatus: complaint.status,
        newStatus: complaint.status,
        metadata: JSON.stringify({
          previousCategory: complaint.category,
          previousDepartmentId: complaint.departmentId,
          category: nextCategory,
          departmentId: nextDepartmentId,
        }),
      },
    });
  });
}
