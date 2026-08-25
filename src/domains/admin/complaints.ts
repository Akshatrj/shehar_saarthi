import { prisma } from "@/lib/db";

import type { AuthUser } from "@/lib/rbac";

import {

  COMPLAINT_CATEGORIES,

  COMPLAINT_STATUSES,

  ROUTING_STATUS_LABELS,

  type ComplaintCategory,

  type ComplaintStatus,

  type RoutingStatus,

} from "@/domains/complaints/types";

import { AdminError, ADMIN_PAGE_SIZE, assertSuperAdmin } from "@/domains/admin/auth";

import { assertValidTransition } from "@/domains/complaints/transitions";

import type { RankedDepartmentRecommendation } from "@/domains/routing/types";



export type AdminComplaintRow = {

  id: string;

  publicRef: string;

  description: string;

  category: string | null;

  status: string;

  routingStatus: string;

  createdAt: string;

  department: { id: string; name: string; code: string } | null;

  recommendedDepartment: { id: string; name: string; code: string } | null;

  aiCategoryConfidence: number | null;

  requiresManualReview: boolean;

};



export type AdminComplaintDetail = AdminComplaintRow & {
  imageUrl: string;
  aiCategory: string | null;

  aiDescription: string | null;

  aiClassificationReason: string | null;

  recommendedDistanceKm: number | null;

  routingReason: string | null;

  routingConfidence: number | null;

  rankedRecommendations: RankedDepartmentRecommendation[];

  latitude: string;

  longitude: string;

  locationLabel: string | null;

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



function mapRankedRecommendations(value: unknown): RankedDepartmentRecommendation[] {

  if (!Array.isArray(value)) {

    return [];

  }

  return value as RankedDepartmentRecommendation[];

}



function mapAdminRow(row: {

  id: string;

  publicRef: string;

  description: string;

  category: ComplaintCategory | null;

  status: ComplaintStatus;

  routingStatus: RoutingStatus;

  createdAt: Date;

  aiCategoryConfidence: { toString(): string } | null;

  requiresManualReview: boolean;

  department: { id: string; name: string; code: string } | null;

  recommendedDepartment: { id: string; name: string; code: string } | null;

}): AdminComplaintRow {

  return {

    id: row.id,

    publicRef: row.publicRef,

    description: row.description,

    category: row.category,

    status: row.status,

    routingStatus: ROUTING_STATUS_LABELS[row.routingStatus],

    createdAt: row.createdAt.toISOString(),

    aiCategoryConfidence: row.aiCategoryConfidence

      ? Number(row.aiCategoryConfidence)

      : null,

    requiresManualReview: row.requiresManualReview,

    department: row.department,

    recommendedDepartment: row.recommendedDepartment,

  };

}



const complaintListSelect = {

  id: true,

  publicRef: true,

  description: true,
  category: true,

  status: true,

  routingStatus: true,

  createdAt: true,

  aiCategoryConfidence: true,

  requiresManualReview: true,

  department: {

    select: { id: true, name: true, code: true },

  },

  recommendedDepartment: {

    select: { id: true, name: true, code: true },

  },

} as const;



export async function listAdminComplaints(

  actor: AuthUser,

  input: {

    page?: number;

    departmentId?: string;

    status?: unknown;

    category?: unknown;

    awaitingRouting?: boolean;

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

    ...(input.awaitingRouting

      ? {

          status: "SUBMITTED" as const,

          departmentId: null,

        }

      : {}),

  };



  const rows = await prisma.complaint.findMany({

    where,

    orderBy: { createdAt: "desc" },

    skip: (page - 1) * ADMIN_PAGE_SIZE,

    take: ADMIN_PAGE_SIZE + 1,

    select: complaintListSelect,

  });



  const hasMore = rows.length > ADMIN_PAGE_SIZE;

  const pageRows = hasMore ? rows.slice(0, ADMIN_PAGE_SIZE) : rows;



  return {

    complaints: pageRows.map(mapAdminRow),

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

      ...complaintListSelect,
      imageUrl: true,
      aiCategory: true,

      aiDescription: true,

      aiClassificationReason: true,

      recommendedDistanceKm: true,

      routingReason: true,

      routingConfidence: true,

      rankedRecommendations: true,

      latitude: true,

      longitude: true,

      locationLabel: true,

      citizen: {

        select: { id: true, name: true, email: true },

      },

    },

  });



  if (!row) {

    return null;

  }



  return {

    ...mapAdminRow(row),

    imageUrl: row.imageUrl,

    aiCategory: row.aiCategory,

    aiDescription: row.aiDescription,

    aiClassificationReason: row.aiClassificationReason,

    recommendedDistanceKm: row.recommendedDistanceKm

      ? Number(row.recommendedDistanceKm)

      : null,

    routingReason: row.routingReason,

    routingConfidence: row.routingConfidence

      ? Number(row.routingConfidence)

      : null,

    rankedRecommendations: mapRankedRecommendations(row.rankedRecommendations),

    latitude: row.latitude.toString(),

    longitude: row.longitude.toString(),

    locationLabel: row.locationLabel,

    citizen: row.citizen,

  };

}



async function assignComplaintDepartment(input: {

  actor: AuthUser;

  complaintId: string;

  departmentId: string;

  routingMethod: "ADMIN_ACCEPTED" | "ADMIN_MANUAL" | "AUTO_ROUTE_ALL";

  manualReason?: string | null;

}) {

  const department = await prisma.department.findFirst({

    where: { id: input.departmentId, isActive: true },

    select: { id: true, name: true, code: true },

  });

  if (!department) {

    throw new AdminError("Please choose an active department.");

  }



  await prisma.$transaction(async (tx) => {

    const complaint = await tx.complaint.findUnique({

      where: { id: input.complaintId },

      select: {

        id: true,

        status: true,

        category: true,

        departmentId: true,

        recommendedDepartmentId: true,

        routingReason: true,

      },

    });



    if (!complaint) {

      throw new AdminError("Complaint not found.");

    }



    if (complaint.departmentId) {

      throw new AdminError("This complaint already has a department assignment.");

    }



    if (complaint.status !== "SUBMITTED") {

      throw new AdminError("Only submitted complaints can be routed.");

    }



    assertValidTransition(complaint.status, "ROUTED");



    const routingStatus =

      input.routingMethod === "AUTO_ROUTE_ALL"

        ? "AUTO_ASSIGNED"

        : input.routingMethod === "ADMIN_ACCEPTED"

          ? "MANUALLY_ASSIGNED"

          : "MANUALLY_ASSIGNED";



    await tx.complaint.update({

      where: { id: complaint.id },

      data: {

        departmentId: department.id,

        status: "ROUTED",

        routingStatus,

        routedAt: new Date(),

        routedById: input.actor.id,

        manualAssignmentReason: input.manualReason ?? null,

      },

    });



    await tx.complaintHistory.create({

      data: {

        complaintId: complaint.id,

        actorId: input.actor.id,

        action:

          input.routingMethod === "AUTO_ROUTE_ALL" ? "AUTO_ROUTED" : "MANUALLY_ROUTED",

        oldStatus: "SUBMITTED",

        newStatus: "ROUTED",

        metadata: JSON.stringify({

          departmentId: department.id,

          departmentCode: department.code,

          routingMethod: input.routingMethod,

          previousRecommendationId: complaint.recommendedDepartmentId,

          previousRoutingReason: complaint.routingReason,

          manualReason: input.manualReason ?? null,

        }),

      },

    });

  });

}



export async function acceptRoutingRecommendation(

  actor: AuthUser,

  complaintId: string,

) {

  assertSuperAdmin(actor);



  const complaint = await prisma.complaint.findUnique({

    where: { id: complaintId },

    select: {

      id: true,

      recommendedDepartmentId: true,

      departmentId: true,

      status: true,

    },

  });



  if (!complaint) {

    throw new AdminError("Complaint not found.");

  }



  if (!complaint.recommendedDepartmentId) {

    throw new AdminError(

      "No routing recommendation is available. Assign a department manually.",

    );

  }



  await assignComplaintDepartment({

    actor,

    complaintId,

    departmentId: complaint.recommendedDepartmentId,

    routingMethod: "ADMIN_ACCEPTED",

  });

}



export async function assignDepartmentManually(

  actor: AuthUser,

  complaintId: string,

  input: { departmentId: unknown; reason?: unknown },

) {

  assertSuperAdmin(actor);



  if (typeof input.departmentId !== "string" || !input.departmentId.trim()) {

    throw new AdminError("Please choose a valid department.");

  }



  const manualReason =

    typeof input.reason === "string" && input.reason.trim()

      ? input.reason.trim().slice(0, 500)

      : null;



  await assignComplaintDepartment({

    actor,

    complaintId,

    departmentId: input.departmentId.trim(),

    routingMethod: "ADMIN_MANUAL",

    manualReason,

  });

}



export async function autoRouteAllComplaints(actor: AuthUser) {

  assertSuperAdmin(actor);



  const eligible = await prisma.complaint.findMany({

    where: {

      status: "SUBMITTED",

      departmentId: null,

      recommendedDepartmentId: { not: null },

    },

    select: {

      id: true,

      recommendedDepartmentId: true,

    },

  });



  let routed = 0;

  const failed: { complaintId: string; reason: string }[] = [];



  for (const complaint of eligible) {

    try {

      await assignComplaintDepartment({

        actor,

        complaintId: complaint.id,

        departmentId: complaint.recommendedDepartmentId!,

        routingMethod: "AUTO_ROUTE_ALL",

      });

      routed += 1;

    } catch (error) {

      failed.push({

        complaintId: complaint.id,

        reason: error instanceof AdminError ? error.message : "Routing failed.",

      });

    }

  }



  const manualRequired = await prisma.complaint.count({

    where: {

      status: "SUBMITTED",

      departmentId: null,

    },

  });



  return {

    processed: eligible.length,

    routed,

    failed,

    manualRequired: manualRequired - routed,

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



/** @deprecated Use acceptRoutingRecommendation instead */

export async function routeAdminComplaintWithAi(

  actor: AuthUser,

  complaintId: string,

) {

  return acceptRoutingRecommendation(actor, complaintId);

}



export async function countAwaitingRouting(actor: AuthUser) {

  assertSuperAdmin(actor);

  return prisma.complaint.count({

    where: { status: "SUBMITTED", departmentId: null },

  });

}


