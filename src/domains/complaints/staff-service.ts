import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import {
  STAFF_PAGE_SIZE,
  type StaffComplaintDetail,
  type StaffComplaintListItem,
  type StaffComplaintStats,
} from "@/domains/complaints/constants";
import {
  COMPLAINT_STATUSES,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import { assertValidTransition } from "@/domains/complaints/transitions";

export class StaffComplaintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StaffComplaintError";
  }
}

export type StaffContext = {
  staffId: string;
  departmentId: string;
};

export function requireStaffContext(actor: AuthUser): StaffContext {
  if (actor.role !== "STAFF") {
    throw new StaffComplaintError("Staff access is required.");
  }
  if (!actor.departmentId) {
    throw new StaffComplaintError(
      "Your account is not linked to a department yet.",
    );
  }
  return {
    staffId: actor.id,
    departmentId: actor.departmentId,
  };
}

export function parseStaffStatusFilter(value: unknown): ComplaintStatus | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  if (!COMPLAINT_STATUSES.includes(normalized as ComplaintStatus)) {
    throw new StaffComplaintError("Invalid status filter.");
  }
  return normalized as ComplaintStatus;
}

export function parseStaffPage(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export async function getStaffComplaintStats(
  departmentId: string,
): Promise<StaffComplaintStats> {
  const [total, routed, assigned, inProgress, completed] = await Promise.all([
    prisma.complaint.count({ where: { departmentId } }),
    prisma.complaint.count({ where: { departmentId, status: "ROUTED" } }),
    prisma.complaint.count({ where: { departmentId, status: "ASSIGNED" } }),
    prisma.complaint.count({
      where: { departmentId, status: "IN_PROGRESS" },
    }),
    prisma.complaint.count({ where: { departmentId, status: "COMPLETED" } }),
  ]);

  return { total, routed, assigned, inProgress, completed };
}

export async function listStaffComplaints(
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
    skip: (page - 1) * STAFF_PAGE_SIZE,
    take: STAFF_PAGE_SIZE + 1,
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

  const hasMore = rows.length > STAFF_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, STAFF_PAGE_SIZE) : rows;

  const complaints: StaffComplaintListItem[] = pageRows.map((row) => ({
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

export async function getStaffComplaintDetail(
  departmentId: string,
  complaintId: string,
): Promise<StaffComplaintDetail | null> {
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
      status: true,
      latitude: true,
      longitude: true,
      locationLabel: true,
      createdAt: true,
      department: {
        select: { id: true, name: true, slug: true },
      },
      assignedWorker: {
        select: { id: true, name: true },
      },
      history: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          fromStatus: true,
          toStatus: true,
          note: true,
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
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      note: entry.note,
      createdAt: entry.createdAt.toISOString(),
      actor: entry.actor,
    })),
  };
}

export async function assignComplaintToSelf(
  staff: StaffContext,
  complaintId: string,
) {
  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: { id: complaintId, departmentId: staff.departmentId },
      select: { id: true, status: true },
    });

    if (!complaint) {
      throw new StaffComplaintError("Complaint not found.");
    }

    if (complaint.status !== "ROUTED") {
      throw new StaffComplaintError(
        "Only routed complaints can be assigned to yourself.",
      );
    }

    assertValidTransition(complaint.status, "ASSIGNED");

    await tx.complaint.update({
      where: { id: complaint.id },
      data: {
        assignedWorkerId: staff.staffId,
        status: "ASSIGNED",
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: staff.staffId,
        action: "ASSIGNED_TO_SELF",
        fromStatus: "ROUTED",
        toStatus: "ASSIGNED",
      },
    });
  });
}

export async function startComplaintProgress(
  staff: StaffContext,
  complaintId: string,
) {
  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: { id: complaintId, departmentId: staff.departmentId },
      select: { id: true, status: true, assignedWorkerId: true },
    });

    if (!complaint) {
      throw new StaffComplaintError("Complaint not found.");
    }

    if (complaint.status !== "ASSIGNED") {
      throw new StaffComplaintError(
        "Only assigned complaints can be marked in progress.",
      );
    }

    if (complaint.assignedWorkerId !== staff.staffId) {
      throw new StaffComplaintError(
        "Only the assigned worker can update this complaint.",
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
        actorId: staff.staffId,
        action: "STARTED_PROGRESS",
        fromStatus: "ASSIGNED",
        toStatus: "IN_PROGRESS",
      },
    });
  });
}

export async function completeStaffComplaint(
  staff: StaffContext,
  complaintId: string,
) {
  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: { id: complaintId, departmentId: staff.departmentId },
      select: { id: true, status: true, assignedWorkerId: true },
    });

    if (!complaint) {
      throw new StaffComplaintError("Complaint not found.");
    }

    if (complaint.status !== "IN_PROGRESS") {
      throw new StaffComplaintError(
        "Only in-progress complaints can be marked completed.",
      );
    }

    if (complaint.assignedWorkerId !== staff.staffId) {
      throw new StaffComplaintError(
        "Only the assigned worker can update this complaint.",
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
        actorId: staff.staffId,
        action: "MARKED_COMPLETED",
        fromStatus: "IN_PROGRESS",
        toStatus: "COMPLETED",
      },
    });
  });
}
