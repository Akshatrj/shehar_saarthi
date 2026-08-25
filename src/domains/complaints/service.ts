import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import type { ComplaintCategory, ComplaintStatus } from "@/domains/complaints/types";
import type { CitizenComplaintSummary } from "@/domains/complaints/constants";
import { serviceTypeForCategory } from "@/domains/complaints/categories";
import { parseComplaintCategory, CategoryRoutingError } from "@/domains/complaints/routing";
import { refreshComplaintRoutingRecommendation } from "@/domains/routing/orchestrator";
import { uploadComplaintImage } from "@/domains/storage/blob";
import {
  ComplaintValidationError,
  validateComplaintDescription,
  validateComplaintImage,
  validateCoordinate,
} from "@/domains/complaints/validation";

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
