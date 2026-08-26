import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import type { ComplaintCategory, ComplaintStatus } from "@/domains/complaints/types";
import type { CitizenComplaintSummary } from "@/domains/complaints/constants";
import { serviceTypeForCategory } from "@/domains/complaints/categories";
import { parseComplaintCategory, CategoryRoutingError } from "@/domains/complaints/routing";
import { refreshComplaintRoutingRecommendation } from "@/domains/routing/orchestrator";
import {
  ComplaintValidationError,
  validateComplaintDescription,
  validateComplaintImage,
  validateCoordinate,
  validateOptionalContactPhone,
} from "@/domains/complaints/validation";
import { deleteComplaintImage, uploadComplaintImage } from "@/domains/storage/blob";
import { assertValidTransition } from "@/domains/complaints/transitions";

export class ComplaintServiceError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "VALIDATION_ERROR") {
    super(message);
    this.name = "ComplaintServiceError";
    this.status = status;
    this.code = code;
  }
}

function mapSummary(row: {
  id: string;
  publicRef: string;
  description: string;
  imageUrl: string;
  status: ComplaintStatus;
  category: ComplaintCategory | null;
  createdAt: Date;
}): CitizenComplaintSummary {
  return {
    id: row.id,
    publicRef: row.publicRef,
    description: row.description,
    imageUrl: row.imageUrl,
    status: row.status,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
  };
}

async function nextPublicRef() {
  const year = new Date().getUTCFullYear();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    const publicRef = `SS-${year}-${suffix}`;
    const existing = await prisma.complaint.findUnique({
      where: { publicRef },
      select: { id: true },
    });
    if (!existing) {
      return publicRef;
    }
  }
  throw new ComplaintServiceError(
    "Could not allocate a complaint reference. Please try again.",
    503,
    "SERVICE_UNAVAILABLE",
  );
}

export async function createCitizenComplaint(
  actor: AuthUser,
  input: {
    photo: File;
    description: unknown;
    latitude: unknown;
    longitude: unknown;
    category: unknown;
    phone?: unknown;
  },
) {
  if (actor.role !== "CITIZEN") {
    throw new ComplaintServiceError(
      "Only citizens can submit complaints from this endpoint.",
      403,
      "FORBIDDEN",
    );
  }

  if (!(input.photo instanceof File) || input.photo.size === 0) {
    throw new ComplaintValidationError("Please add a photograph of the problem.");
  }

  const bytes = Buffer.from(await input.photo.arrayBuffer());
  const mimeType = validateComplaintImage(bytes, input.photo.type);
  const description = validateComplaintDescription(input.description);
  const latitude = validateCoordinate(input.latitude, "latitude");
  const longitude = validateCoordinate(input.longitude, "longitude");
  const contactPhone = validateOptionalContactPhone(input.phone);

  let category: ComplaintCategory;
  try {
    category = parseComplaintCategory(input.category);
  } catch (error) {
    if (error instanceof CategoryRoutingError) {
      throw new ComplaintValidationError(error.message);
    }
    throw error;
  }

  const imageUrl = await uploadComplaintImage({
    citizenId: actor.id,
    bytes,
    mimeType,
  });

  const publicRef = await nextPublicRef();

  const complaint = await prisma.$transaction(async (tx) => {
    const created = await tx.complaint.create({
      data: {
        publicRef,
        citizenId: actor.id,
        description,
        contactPhone,
        imageUrl,
        latitude,
        longitude,
        status: "SUBMITTED",
        category,
        departmentId: null,
        serviceType: serviceTypeForCategory(category),
        routingStatus: "UNASSIGNED",
        aiCategory: null,
        aiDescription: null,
      },
      select: {
        id: true,
        publicRef: true,
        description: true,
        imageUrl: true,
        status: true,
        category: true,
        createdAt: true,
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: created.id,
        actorId: actor.id,
        action: "SUBMITTED",
        oldStatus: null,
        newStatus: "SUBMITTED",
        metadata: JSON.stringify({ category }),
      },
    });

    return created;
  });

  try {
    await refreshComplaintRoutingRecommendation(complaint.id);
  } catch (error) {
    console.error("initial routing recommendation failed", {
      complaintId: complaint.id,
      error,
    });
  }

  return mapSummary(complaint);
}

export async function listCitizenComplaints(actor: AuthUser) {
  const rows = await prisma.complaint.findMany({
    where: { citizenId: actor.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      status: true,
      category: true,
      createdAt: true,
    },
  });

  return rows.map(mapSummary);
}

export async function getCitizenComplaint(actor: AuthUser, complaintId: string) {
  const row = await prisma.complaint.findFirst({
    where: { id: complaintId, citizenId: actor.id },
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      status: true,
      category: true,
      createdAt: true,
    },
  });

  return row ? mapSummary(row) : null;
}

export function canCitizenCancelComplaint(status: ComplaintStatus | string) {
  return status !== "COMPLETED" && status !== "CLOSED";
}

export function canCitizenReopenComplaint(status: ComplaintStatus | string) {
  return status === "COMPLETED" || status === "CLOSED";
}

export function parseReopenReason(value: unknown) {
  const reason = typeof value === "string" ? value.trim() : "";
  if (reason.length < 12) {
    throw new ComplaintServiceError(
      "Explain what is still wrong in at least 12 characters.",
      400,
      "VALIDATION_ERROR",
    );
  }
  if (reason.length > 400) {
    throw new ComplaintServiceError(
      "Keep the reason to 400 characters or fewer.",
      400,
      "VALIDATION_ERROR",
    );
  }
  return reason;
}

export async function reopenCitizenComplaint(
  actor: AuthUser,
  complaintId: string,
  reasonInput: unknown,
) {
  if (actor.role !== "CITIZEN") {
    throw new ComplaintServiceError(
      "Only citizens can reopen their own complaints.",
      403,
      "FORBIDDEN",
    );
  }

  const reason = parseReopenReason(reasonInput);

  await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.findFirst({
      where: { id: complaintId, citizenId: actor.id },
      select: {
        id: true,
        status: true,
        departmentId: true,
        assignedWorkerId: true,
      },
    });

    if (!complaint) {
      throw new ComplaintServiceError("Complaint not found.", 404, "NOT_FOUND");
    }

    if (!canCitizenReopenComplaint(complaint.status)) {
      throw new ComplaintServiceError(
        "You can reopen a complaint after the work is marked completed.",
        403,
        "FORBIDDEN",
      );
    }

    if (!complaint.departmentId) {
      throw new ComplaintServiceError(
        "This complaint cannot be reopened until it has a department.",
        409,
        "CONFLICT",
      );
    }

    let nextStatus: "ASSIGNED" | "ROUTED" = "ROUTED";
    let assignedWorkerId: string | null = null;

    if (complaint.assignedWorkerId) {
      const worker = await tx.user.findFirst({
        where: {
          id: complaint.assignedWorkerId,
          role: "WORKER",
          isActive: true,
          departmentId: complaint.departmentId,
        },
        select: { id: true },
      });
      if (worker) {
        nextStatus = "ASSIGNED";
        assignedWorkerId = worker.id;
      }
    }

    assertValidTransition(complaint.status, nextStatus);

    await tx.complaint.update({
      where: { id: complaint.id },
      data: {
        status: nextStatus,
        assignedWorkerId,
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: complaint.id,
        actorId: actor.id,
        action: "REOPENED_BY_CITIZEN",
        oldStatus: complaint.status,
        newStatus: nextStatus,
        metadata: JSON.stringify({ reason }),
      },
    });
  });
}

export async function deleteComplaintAndStorage(complaintId: string) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    select: { id: true, imageUrl: true },
  });

  if (!complaint) {
    throw new ComplaintServiceError("Complaint not found.", 404, "NOT_FOUND");
  }

  await deleteComplaintImage(complaint.imageUrl);
  await prisma.complaint.delete({ where: { id: complaint.id } });
}

export async function cancelCitizenComplaint(actor: AuthUser, complaintId: string) {
  if (actor.role !== "CITIZEN") {
    throw new ComplaintServiceError(
      "Only citizens can cancel their own complaints from this endpoint.",
      403,
      "FORBIDDEN",
    );
  }

  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, citizenId: actor.id },
    select: { id: true, status: true },
  });

  if (!complaint) {
    throw new ComplaintServiceError("Complaint not found.", 404, "NOT_FOUND");
  }

  if (!canCitizenCancelComplaint(complaint.status)) {
    throw new ComplaintServiceError(
      "Completed or closed complaints cannot be cancelled.",
      403,
      "FORBIDDEN",
    );
  }

  await deleteComplaintAndStorage(complaint.id);
}

export async function getCitizenComplaintByImageUrl(
  actor: AuthUser,
  imageUrl: string,
) {
  return prisma.complaint.findFirst({
    where: { citizenId: actor.id, imageUrl },
    select: {
      id: true,
      status: true,
      category: true,
      imageUrl: true,
      description: true,
      latitude: true,
      longitude: true,
      locationLabel: true,
      aiRequestId: true,
      aiCategory: true,
      aiDescription: true,
      aiCategoryConfidence: true,
      evidenceConsistency: true,
      evidenceConfidence: true,
      aiPriority: true,
      priorityScore: true,
      civicImpactScore: true,
      requiresManualReview: true,
    },
  });
}
