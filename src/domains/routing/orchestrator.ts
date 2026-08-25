import { prisma } from "@/lib/db";
import { serviceTypeForCategory } from "@/domains/complaints/categories";
import {
  COMPLAINT_CATEGORIES,
  type ComplaintCategory,
} from "@/domains/complaints/types";
import {
  effectiveRoutingCategory,
  recommendRoutingForComplaint,
} from "@/domains/routing/engine";

export async function refreshComplaintRoutingRecommendation(
  complaintId: string,
  input?: { aiAnalyzed?: boolean },
) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    select: {
      id: true,
      category: true,
      aiCategory: true,
      aiCategoryConfidence: true,
      latitude: true,
      longitude: true,
      departmentId: true,
      status: true,
    },
  });

  if (!complaint || complaint.departmentId || complaint.status !== "SUBMITTED") {
    return null;
  }

  const category = effectiveRoutingCategory({
    citizenCategory: complaint.category,
    aiCategory: complaint.aiCategory,
    aiConfidence: complaint.aiCategoryConfidence
      ? Number(complaint.aiCategoryConfidence)
      : null,
  });

  if (!category) {
    return null;
  }

  return recommendRoutingForComplaint({
    complaintId: complaint.id,
    category,
    latitude: Number(complaint.latitude),
    longitude: Number(complaint.longitude),
    confidence: complaint.aiCategoryConfidence
      ? Number(complaint.aiCategoryConfidence)
      : 0.75,
    aiAnalyzed: input?.aiAnalyzed ?? Boolean(complaint.aiCategory),
  });
}

export function citizenSelectedCategory(value: unknown): ComplaintCategory {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Please choose a complaint category.");
  }
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  if (!COMPLAINT_CATEGORIES.includes(normalized as ComplaintCategory)) {
    throw new Error("Please choose a valid complaint category.");
  }
  return normalized as ComplaintCategory;
}

export { serviceTypeForCategory };
