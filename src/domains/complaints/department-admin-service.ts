import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import {
  DEPARTMENT_ADMIN_PAGE_SIZE,
  type DepartmentAdminComplaintDetail,
  type DepartmentAdminComplaintListItem,
  type DepartmentAdminComplaintStats,
  type DepartmentWorkerRow,
} from "@/domains/complaints/constants";
import {
  COMPLAINT_STATUSES,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import { assertValidTransition } from "@/domains/complaints/transitions";

export class DepartmentAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DepartmentAdminError";
  }
}

export type DepartmentAdminContext = {
  adminId: string;
  departmentId: string;
};

export function requireDepartmentAdminContext(
  actor: AuthUser,
): DepartmentAdminContext {
  if (actor.role !== "DEPARTMENT_ADMIN") {
    throw new DepartmentAdminError("Department admin access is required.");
  }
  if (!actor.departmentId) {
    throw new DepartmentAdminError(
      "Your account is not linked to a department yet.",
    );
  }
  return {
    adminId: actor.id,
    departmentId: actor.departmentId,
  };
}

export function parseDepartmentAdminStatusFilter(
  value: unknown,
): ComplaintStatus | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (!COMPLAINT_STATUSES.includes(normalized as ComplaintStatus)) {
    throw new DepartmentAdminError("Invalid status filter.");
  }
  return normalized as ComplaintStatus;
}

export function parseDepartmentAdminPage(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export async function getDepartmentAdminStats(
  departmentId: string,
): Promise<DepartmentAdminComplaintStats> {
  const [total, routed, assigned, inProgress, completed, closed] = await Promise.all([
    prisma.complaint.count({ where: { departmentId } }),
    prisma.complaint.count({ where: { departmentId, status: "ROUTED" } }),
    prisma.complaint.count({ where: { departmentId, status: "ASSIGNED" } }),
    prisma.complaint.count({
      where: { departmentId, status: "IN_PROGRESS" },
    }),
    prisma.complaint.count({ where: { departmentId, status: "COMPLETED" } }),
    prisma.complaint.count({ where: { departmentId, status: "CLOSED" } }),
  ]);

  return { total, routed, assigned, inProgress, completed, closed };
}

export async function listDepartmentAdminComplaints(
  departmentId: string,
  input: { status?: ComplaintStatus; page?: number },
) {
  const page = input.page && input.page > 0 ? input.page : 1;
  const where = {
    departmentId,
    ...(input.status ? { status: input.status } : {}),
  };

  const rows = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * DEPARTMENT_ADMIN_PAGE_SIZE,
    take: DEPARTMENT_ADMIN_PAGE_SIZE + 1,
    select: {
      id: true,
      publicRef: true,
      description: true,
      category: true,
      status: true,
      createdAt: true,
      assignedWorker: {
        select: { id: true, name: true },
      },
    },
  });

  const hasMore = rows.length > DEPARTMENT_ADMIN_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, DEPARTMENT_ADMIN_PAGE_SIZE) : rows;

  const complaints: DepartmentAdminComplaintListItem[] = pageRows.map(
    (row) => ({
      id: row.id,
      publicRef: row.publicRef,
      description: row.description,
      category: row.category,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      assignedWorker: row.assignedWorker,
    }),
  );

  return { complaints, page, hasMore };
}

export async function getDepartmentAdminComplaintDetail(
  departmentId: string,
  complaintId: string,
): Promise<DepartmentAdminComplaintDetail | null> {
  const row = await prisma.complaint.findFirst({
    where: { id: complaintId, departmentId },
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      category: true,
      aiCategory: true,
      aiDescription: true,
      aiCategoryConfidence: true,
      evidenceConsistency: true,
      evidenceConfidence: true,
      evidenceReason: true,
      aiPriority: true,
      priorityScore: true,
      civicImpactScore: true,
      requiresManualReview: true,
      recommendedDepartmentName: true,
      recommendedAction: true,
      priorityReason: true,
      recurringProblem: true,
      status: true,
      latitude: true,
      longitude: true,
      locationLabel: true,
      createdAt: true,
      department: {
        select: { id: true, name: true, code: true },
      },
      assignedWorker: {
        select: { id: true, name: true },
      },
      history: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          oldStatus: true,
          newStatus: true,
          metadata: true,
          createdAt: true,
          actor: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!row || !row.department) {
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
    aiCategoryConfidence: row.aiCategoryConfidence
      ? Number(row.aiCategoryConfidence)
      : null,
    evidenceConsistency: row.evidenceConsistency,
    evidenceConfidence: row.evidenceConfidence
      ? Number(row.evidenceConfidence)
      : null,
    evidenceReason: row.evidenceReason,
    aiPriority: row.aiPriority,
    priorityScore: row.priorityScore,
    civicImpactScore: row.civicImpactScore,
    requiresManualReview: row.requiresManualReview,
    recommendedDepartmentName: row.recommendedDepartmentName,
    recommendedAction: row.recommendedAction,
    priorityReason: row.priorityReason,
    recurringProblem: row.recurringProblem,
    status: row.status,
    latitude: row.latitude.toString(),
    longitude: row.longitude.toString(),
    locationLabel: row.locationLabel,
    createdAt: row.createdAt.toISOString(),
    department: row.department,
    assignedWorker: row.assignedWorker,
    history: row.history.map((entry) => ({
      id: entry.id,
      action: entry.action,
      oldStatus: entry.oldStatus,
      newStatus: entry.newStatus,
      metadata: entry.metadata,
      createdAt: entry.createdAt.toISOString(),
      actor: entry.actor,
    })),
  };
}

export async function listDepartmentWorkers(
  departmentId: string,
): Promise<DepartmentWorkerRow[]> {
  const rows = await prisma.user.findMany({
    where: { departmentId, role: "WORKER" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function listActiveDepartmentWorkers(departmentId: string) {
  return prisma.user.findMany({
    where: { departmentId, role: "WORKER", isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function assignComplaintToWorker(
  admin: DepartmentAdminContext,
  complaintId: string,
  workerId: string,
) {
  const worker = await prisma.user.findFirst({
    where: {
      id: workerId,
      role: "WORKER",
      departmentId: admin.departmentId,
      isActive: true,
    },
    select: { id: true },
  });

  if (!worker) {
    throw new DepartmentAdminError("Please choose an active worker in your department.");
  }

  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: { id: complaintId, departmentId: admin.departmentId },
      select: { id: true, status: true },
    });

    if (!complaint) {
      throw new DepartmentAdminError("Complaint not found.");
    }

    if (complaint.status !== "ROUTED") {
      throw new DepartmentAdminError(
        "Only routed complaints can be assigned to a worker.",
      );
    }

    assertValidTransition(complaint.status, "ASSIGNED");

    await tx.complaint.update({
      where: { id: complaint.id },
      data: {
        assignedWorkerId: worker.id,
        status: "ASSIGNED",
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: admin.adminId,
        action: "ASSIGNED_TO_WORKER",
        oldStatus: "ROUTED",
        newStatus: "ASSIGNED",
        metadata: JSON.stringify({ workerId: worker.id }),
      },
    });
  });
}

export async function closeDepartmentComplaint(
  admin: DepartmentAdminContext,
  complaintId: string,
) {
  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: { id: complaintId, departmentId: admin.departmentId },
      select: { id: true, status: true },
    });

    if (!complaint) {
      throw new DepartmentAdminError("Complaint not found.");
    }

    if (complaint.status !== "COMPLETED") {
      throw new DepartmentAdminError(
        "Only completed complaints can be closed.",
      );
    }

    assertValidTransition(complaint.status, "CLOSED");

    await tx.complaint.update({
      where: { id: complaint.id },
      data: { status: "CLOSED" },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: admin.adminId,
        action: "CLOSED",
        oldStatus: "COMPLETED",
        newStatus: "CLOSED",
      },
    });
  });
}

export async function setDepartmentWorkerActive(
  admin: DepartmentAdminContext,
  workerId: string,
  isActive: boolean,
) {
  if (workerId === admin.adminId) {
    throw new DepartmentAdminError("You cannot deactivate your own account.");
  }

  const worker = await prisma.user.findFirst({
    where: {
      id: workerId,
      role: "WORKER",
      departmentId: admin.departmentId,
    },
    select: { id: true },
  });

  if (!worker) {
    throw new DepartmentAdminError("Worker not found in your department.");
  }

  await prisma.user.update({
    where: { id: worker.id },
    data: { isActive },
  });
}

export async function getDepartmentAdminDepartment(departmentId: string) {
  return prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true, name: true, code: true },
  });
}
