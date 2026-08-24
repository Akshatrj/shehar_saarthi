import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import type { CategoryRoutingMetadata } from "@/domains/complaints/constants";
import {
  parseComplaintCategory,
  resolveDepartmentIdForRouting,
} from "@/domains/complaints/routing";
import type { ComplaintCategory, ComplaintStatus } from "@/domains/complaints/types";
import { assertValidTransition } from "@/domains/complaints/transitions";

export class CategoryConfirmationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CategoryConfirmationError";
  }
}

function assertCitizenActor(actor: AuthUser) {
  if (actor.role !== "CITIZEN" && actor.role !== "SUPER_ADMIN") {
    throw new CategoryConfirmationError(
      "Only citizens can confirm complaint categories.",
    );
  }
}

function historyNote(metadata: CategoryRoutingMetadata) {
  return JSON.stringify(metadata);
}

async function loadOwnedComplaint(actor: AuthUser, complaintId: string) {
  const complaint = await prisma.complaint.findFirst({
    where: { id: complaintId, citizenId: actor.id },
    select: {
      id: true,
      status: true,
      category: true,
      aiCategory: true,
    },
  });

  if (!complaint) {
    throw new CategoryConfirmationError("Complaint not found.");
  }

  return complaint;
}

function assertSubmittedForRouting(complaint: { status: string }) {
  if (complaint.status !== "SUBMITTED") {
    throw new CategoryConfirmationError(
      "This complaint has already been routed and cannot be changed here.",
    );
  }
}

async function routeComplaint(input: {
  actor: AuthUser;
  complaintId: string;
  category: ComplaintCategory;
  manualDepartmentSlug?: string | null;
  historyAction: "CATEGORY_CONFIRMED" | "CATEGORY_CHANGED";
  routingMethod: CategoryRoutingMetadata["routingMethod"];
}) {
  const department = await resolveDepartmentIdForRouting({
    category: input.category,
    manualDepartmentSlug: input.manualDepartmentSlug,
  });

  await prisma.$transaction(async (tx) => {
    const current = await tx.complaint.findFirst({
      where: { id: input.complaintId, citizenId: input.actor.id },
      select: { id: true, status: true },
    });

    if (!current) {
      throw new CategoryConfirmationError("Complaint not found.");
    }

    if (current.status !== "SUBMITTED") {
      throw new CategoryConfirmationError(
        "This complaint has already been routed and cannot be changed here.",
      );
    }

    assertValidTransition(current.status as ComplaintStatus, "ROUTED");

    await tx.complaint.update({
      where: { id: input.complaintId },
      data: {
        category: input.category,
        departmentId: department.id,
        status: "ROUTED",
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: input.complaintId,
        actorId: input.actor.id,
        action: input.historyAction,
        fromStatus: "SUBMITTED",
        toStatus: "ROUTED",
        note: historyNote({
          category: input.category,
          routingMethod: input.routingMethod,
          departmentSlug: department.slug,
        }),
      },
    });
  });

  return department;
}

export async function confirmCitizenCategory(
  actor: AuthUser,
  complaintId: string,
) {
  assertCitizenActor(actor);

  const complaint = await loadOwnedComplaint(actor, complaintId);
  assertSubmittedForRouting(complaint);

  if (!complaint.aiCategory) {
    throw new CategoryConfirmationError(
      "No AI category suggestion is available to confirm.",
    );
  }

  if (complaint.aiCategory === "OTHER") {
    throw new CategoryConfirmationError(
      "AI suggested Other. Please choose a category and department manually.",
    );
  }

  await routeComplaint({
    actor,
    complaintId,
    category: complaint.aiCategory,
    historyAction: "CATEGORY_CONFIRMED",
    routingMethod: "AI_CONFIRMED",
  });
}

export async function changeCitizenCategory(
  actor: AuthUser,
  complaintId: string,
  categoryInput: unknown,
  departmentSlugInput?: unknown,
) {
  assertCitizenActor(actor);

  const complaint = await loadOwnedComplaint(actor, complaintId);
  assertSubmittedForRouting(complaint);

  const category = parseComplaintCategory(categoryInput);

  await routeComplaint({
    actor,
    complaintId,
    category,
    manualDepartmentSlug:
      category === "OTHER" ? (departmentSlugInput as string | undefined) : null,
    historyAction: "CATEGORY_CHANGED",
    routingMethod: "USER_SELECTED",
  });
}

