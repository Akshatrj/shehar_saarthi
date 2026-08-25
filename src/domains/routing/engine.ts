import { prisma } from "@/lib/db";
import {
  CATEGORY_TO_DEPARTMENT_SLUG,
  departmentSlugForCategory,
  serviceTypeForCategory,
} from "@/domains/complaints/categories";
import type { ComplaintCategory, ServiceType } from "@/domains/complaints/types";
import type {
  RankedDepartmentRecommendation,
  RoutingRecommendationResult,
} from "@/domains/routing/types";

type DepartmentCandidate = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  workloadScore: number;
  supportedCategories: ComplaintCategory[];
};

/**
 * Routing score weights:
 * - Category capability: required gate
 * - Primary mapping match: 100 (department code matches category default)
 * - Workload: up to 50 (lower workload preferred)
 */
const WEIGHTS = {
  primaryMapping: 100,
  workloadMax: 50,
} as const;

function supportsCategory(
  department: DepartmentCandidate,
  category: ComplaintCategory,
): boolean {
  if (department.supportedCategories.length > 0) {
    return department.supportedCategories.includes(category);
  }
  const slug = departmentSlugForCategory(category);
  return slug === department.code;
}

function scoreDepartment(input: {
  department: DepartmentCandidate;
  category: ComplaintCategory;
}): RankedDepartmentRecommendation | null {
  const categoryMatch = supportsCategory(input.department, input.category);
  if (!categoryMatch || !input.department.isActive) {
    return null;
  }

  const mappedSlug = departmentSlugForCategory(input.category);
  const primaryMappingScore =
    mappedSlug === input.department.code ? WEIGHTS.primaryMapping : 0;

  const workloadScore = Math.max(
    0,
    WEIGHTS.workloadMax - Math.min(input.department.workloadScore, 50),
  );

  const score = primaryMappingScore + workloadScore;

  const reasonParts = [
    `${input.department.name} supports ${input.category.replaceAll("_", " ").toLowerCase()} complaints.`,
  ];
  if (primaryMappingScore > 0) {
    reasonParts.push("Primary department for this complaint type.");
  }
  if (input.department.workloadScore > 0) {
    reasonParts.push(`Current workload score: ${input.department.workloadScore}.`);
  }

  return {
    departmentId: input.department.id,
    departmentName: input.department.name,
    departmentCode: input.department.code,
    distanceKm: null,
    inJurisdiction: null,
    categoryMatch,
    workloadScore: input.department.workloadScore,
    score,
    reason: reasonParts.join(" "),
    recommended: false,
  };
}

export function rankDepartmentsForComplaint(input: {
  category: ComplaintCategory;
  departments: DepartmentCandidate[];
  confidence?: number;
}): RoutingRecommendationResult {
  const serviceType = serviceTypeForCategory(input.category);

  const ranked = input.departments
    .map((department) =>
      scoreDepartment({
        department,
        category: input.category,
      }),
    )
    .filter((item): item is RankedDepartmentRecommendation => item !== null)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) {
    ranked[0] = { ...ranked[0], recommended: true };
  }

  const top = ranked[0] ?? null;
  const defaultSlug = CATEGORY_TO_DEPARTMENT_SLUG[input.category];

  let reason = "No suitable department found. Manual assignment required.";
  if (top) {
    reason = top.reason;
  } else if (defaultSlug) {
    reason = `No active department matched routing rules for ${input.category}. Expected department code: ${defaultSlug}.`;
  }

  return {
    category: input.category,
    serviceType,
    confidence: input.confidence ?? 0.75,
    recommendedDepartmentId: top?.departmentId ?? null,
    recommendedDepartmentName: top?.departmentName ?? null,
    recommendedDepartmentCode: top?.departmentCode ?? null,
    distanceKm: null,
    reason,
    ranked,
    locationAvailable: false,
  };
}

export async function loadActiveDepartmentCandidates() {
  const rows = await prisma.department.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
      workloadScore: true,
      supportedCategories: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    code: row.code,
    isActive: row.isActive,
    workloadScore: row.workloadScore,
    supportedCategories: row.supportedCategories,
  }));
}

export async function recommendRoutingForComplaint(input: {
  complaintId: string;
  category: ComplaintCategory;
  latitude: number;
  longitude: number;
  confidence?: number;
  aiAnalyzed?: boolean;
}) {
  const departments = await loadActiveDepartmentCandidates();
  const recommendation = rankDepartmentsForComplaint({
    category: input.category,
    departments,
    confidence: input.confidence,
  });

  const routingStatus = input.aiAnalyzed
    ? recommendation.recommendedDepartmentId
      ? "ROUTING_RECOMMENDED"
      : "AI_ANALYZED"
    : recommendation.recommendedDepartmentId
      ? "ROUTING_RECOMMENDED"
      : "UNASSIGNED";

  await prisma.$transaction(async (tx) => {
    await tx.complaint.update({
      where: { id: input.complaintId },
      data: {
        serviceType: recommendation.serviceType as ServiceType,
        recommendedDepartmentId: recommendation.recommendedDepartmentId,
        recommendedDepartmentName: recommendation.recommendedDepartmentName,
        recommendedDistanceKm: null,
        routingReason: recommendation.reason,
        routingConfidence: recommendation.confidence,
        rankedRecommendations: recommendation.ranked,
        routingStatus,
      },
    });

    await tx.complaintHistory.create({
      data: {
        complaintId: input.complaintId,
        action: "ROUTING_RECOMMENDED",
        oldStatus: "SUBMITTED",
        newStatus: "SUBMITTED",
        metadata: JSON.stringify({
          category: recommendation.category,
          recommendedDepartmentId: recommendation.recommendedDepartmentId,
          recommendedDepartmentCode: recommendation.recommendedDepartmentCode,
          reason: recommendation.reason,
          confidence: recommendation.confidence,
        }),
      },
    });
  });

  return recommendation;
}

export function effectiveRoutingCategory(input: {
  citizenCategory: ComplaintCategory | null;
  aiCategory: ComplaintCategory | null;
  aiConfidence: number | null;
  lowConfidenceThreshold?: number;
}): ComplaintCategory | null {
  const threshold = input.lowConfidenceThreshold ?? 0.65;
  if (
    input.aiCategory &&
    input.aiConfidence !== null &&
    input.aiConfidence >= threshold
  ) {
    return input.aiCategory;
  }
  return input.citizenCategory ?? input.aiCategory;
}
