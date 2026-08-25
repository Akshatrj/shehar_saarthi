import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import {
  WORKER_PAGE_SIZE,
  type WorkerComplaintDetail,
  type WorkerComplaintListItem,
  type WorkerComplaintStats,
} from "@/domains/complaints/constants";
import {
  COMPLAINT_STATUSES,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import { assertValidTransition } from "@/domains/complaints/transitions";

export class WorkerComplaintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkerComplaintError";
  }
}

export type WorkerContext = {
  workerId: string;
  departmentId: string;
};

export function requireWorkerContext(actor: AuthUser): WorkerContext {
  if (actor.role !== "WORKER") {
    throw new WorkerComplaintError("Worker access is required.");
  }
  if (!actor.departmentId) {
    throw new WorkerComplaintError(
      "Your account is not linked to a department yet.",
    );
  }
  return {
    workerId: actor.id,
    departmentId: actor.departmentId,
  };
}

export function parseWorkerStatusFilter(
  value: unknown,
): ComplaintStatus | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (!COMPLAINT_STATUSES.includes(normalized as ComplaintStatus)) {
    throw new WorkerComplaintError("Invalid status filter.");
  }
  return normalized as ComplaintStatus;
}

export function parseWorkerPage(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export async function getWorkerComplaintStats(
  workerId: string,
): Promise<WorkerComplaintStats> {
  const [assigned, inProgress, completed] = await Promise.all([
    prisma.complaint.count({
      where: { assignedWorkerId: workerId, status: "ASSIGNED" },
    }),
    prisma.complaint.count({
      where: { assignedWorkerId: workerId, status: "IN_PROGRESS" },
    }),
    prisma.complaint.count({
      where: { assignedWorkerId: workerId, status: "COMPLETED" },
    }),
  ]);

  return { assigned, inProgress, completed };
}

function workerComplaintWhere(worker: WorkerContext) {
  return {
    departmentId: worker.departmentId,
    OR: [
      { assignedWorkerId: worker.workerId },
      { status: "ROUTED" as const, assignedWorkerId: null },
    ],
  };
}

export async function listWorkerComplaints(
  worker: WorkerContext,
  input: { status?: ComplaintStatus; page?: number },
) {
  const page = input.page && input.page > 0 ? input.page : 1;
  const where = {
    ...workerComplaintWhere(worker),
    ...(input.status ? { status: input.status } : {}),
  };

  const rows = await prisma.complaint.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * WORKER_PAGE_SIZE,
    take: WORKER_PAGE_SIZE + 1,
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      category: true,
      status: true,
      createdAt: true,
      assignedWorker: {
        select: { id: true, name: true },
      },
    },
  });

  const hasMore = rows.length > WORKER_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, WORKER_PAGE_SIZE) : rows;

  const complaints: WorkerComplaintListItem[] = pageRows.map((row) => ({
    id: row.id,
    publicRef: row.publicRef,
    description: row.description,
    imageUrl: row.imageUrl,
    category: row.category,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    assignedWorker: row.assignedWorker,
  }));

  return { complaints, page, hasMore };
}

export async function getWorkerComplaintDetail(
  worker: WorkerContext,
  complaintId: string,
): Promise<WorkerComplaintDetail | null> {
  const row = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      ...workerComplaintWhere(worker),
    },
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
      assignedWorkerId: true,
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
    assignedWorkerId: row.assignedWorkerId,
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

export async function assignComplaintToSelf(
  worker: WorkerContext,
  complaintId: string,
) {
  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: {
        id: complaintId,
        departmentId: worker.departmentId,
        status: "ROUTED",
      },
      select: { id: true, status: true },
    });

    if (!complaint) {
      throw new WorkerComplaintError(
        "Only routed complaints in your department can be self-assigned.",
      );
    }

    assertValidTransition(complaint.status, "ASSIGNED");

    await tx.complaint.update({
      where: { id: complaint.id },
      data: {
        assignedWorkerId: worker.workerId,
        status: "ASSIGNED",
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: worker.workerId,
        action: "ASSIGNED_TO_SELF",
        oldStatus: "ROUTED",
        newStatus: "ASSIGNED",
      },
    });
  });
}

export async function startComplaintProgress(
  worker: WorkerContext,
  complaintId: string,
) {
  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: {
        id: complaintId,
        departmentId: worker.departmentId,
        assignedWorkerId: worker.workerId,
      },
      select: { id: true, status: true },
    });

    if (!complaint) {
      throw new WorkerComplaintError("Complaint not found.");
    }

    if (complaint.status !== "ASSIGNED") {
      throw new WorkerComplaintError(
        "Only assigned complaints can be marked in progress.",
      );
    }

    assertValidTransition(complaint.status, "IN_PROGRESS");

    await tx.complaint.update({
      where: { id: complaint.id },
      data: { status: "IN_PROGRESS" },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: worker.workerId,
        action: "STARTED_PROGRESS",
        oldStatus: "ASSIGNED",
        newStatus: "IN_PROGRESS",
      },
    });
  });
}

export async function completeWorkerComplaint(
  worker: WorkerContext,
  complaintId: string,
) {
  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: {
        id: complaintId,
        departmentId: worker.departmentId,
        assignedWorkerId: worker.workerId,
      },
      select: { id: true, status: true },
    });

    if (!complaint) {
      throw new WorkerComplaintError("Complaint not found.");
    }

    if (complaint.status !== "IN_PROGRESS") {
      throw new WorkerComplaintError(
        "Only in-progress complaints can be marked completed.",
      );
    }

    assertValidTransition(complaint.status, "COMPLETED");

    await tx.complaint.update({
      where: { id: complaint.id },
      data: { status: "COMPLETED" },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: worker.workerId,
        action: "MARKED_COMPLETED",
        oldStatus: "IN_PROGRESS",
        newStatus: "COMPLETED",
      },
    });
  });
}
