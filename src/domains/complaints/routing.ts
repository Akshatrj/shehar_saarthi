import { prisma } from "@/lib/db";
import {
  DEPARTMENT_SLUGS,
  departmentSlugForCategory,
  type DepartmentSlug,
} from "@/domains/complaints/categories";
import {
  COMPLAINT_CATEGORIES,
  type ComplaintCategory,
} from "@/domains/complaints/types";

export class CategoryRoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CategoryRoutingError";
  }
}

export function parseComplaintCategory(value: unknown): ComplaintCategory {
  if (typeof value !== "string") {
    throw new CategoryRoutingError("Please choose a valid category.");
  }
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  if (!COMPLAINT_CATEGORIES.includes(normalized as ComplaintCategory)) {
    throw new CategoryRoutingError("Please choose a valid category.");
  }
  return normalized as ComplaintCategory;
}

export function parseDepartmentSlug(value: unknown): DepartmentSlug {
  if (typeof value !== "string") {
    throw new CategoryRoutingError("Please choose a valid department.");
  }
  const normalized = value.trim().toLowerCase();
  if (!DEPARTMENT_SLUGS.includes(normalized as DepartmentSlug)) {
    throw new CategoryRoutingError("Please choose a valid department.");
  }
  return normalized as DepartmentSlug;
}

export async function resolveDepartmentIdForRouting(input: {
  category: ComplaintCategory;
  manualDepartmentSlug?: string | null;
}) {
  const mappedSlug = departmentSlugForCategory(input.category);
  const slug =
    input.category === "OTHER"
      ? parseDepartmentSlug(input.manualDepartmentSlug)
      : mappedSlug;

  if (!slug) {
    throw new CategoryRoutingError(
      "Please choose a department for the Other category.",
    );
  }

  if (input.category !== "OTHER" && input.manualDepartmentSlug) {
    const clientSlug = parseDepartmentSlug(input.manualDepartmentSlug);
    if (clientSlug !== mappedSlug) {
      throw new CategoryRoutingError(
        "Department cannot be overridden for this category.",
      );
    }
  }

  const department = await prisma.department.findFirst({
    where: { slug, isActive: true },
    select: { id: true, name: true, slug: true },
  });

  if (!department) {
    throw new CategoryRoutingError("The selected department is not available.");
  }

  return department;
}
