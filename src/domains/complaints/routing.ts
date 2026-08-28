import { prisma } from "@/lib/db";
import {
  resolveDepartmentForCategory,
  type RoutedDepartment,
} from "@/domains/departments/routes";
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

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export function parseDepartmentId(value: unknown): string {
  if (typeof value !== "string") {
    throw new CategoryRoutingError("Please choose a valid department.");
  }
  const id = value.trim();
  if (!UUID_PATTERN.test(id)) {
    throw new CategoryRoutingError("Please choose a valid department.");
  }
  return id;
}

export async function resolveDepartmentIdForRouting(input: {
  category: ComplaintCategory;
  departmentId?: string | null;
}): Promise<RoutedDepartment> {
  if (input.departmentId) {
    const departmentId = parseDepartmentId(input.departmentId);
    const department = await prisma.department.findFirst({
      where: { id: departmentId, isActive: true },
      select: { id: true, name: true, code: true, isActive: true },
    });
    if (!department) {
      throw new CategoryRoutingError("The selected department is not available.");
    }

    if (input.category !== "OTHER") {
      const mapped = await resolveDepartmentForCategory(input.category);
      if (mapped && mapped.id !== department.id) {
        throw new CategoryRoutingError(
          "Department cannot be overridden for this category.",
        );
      }
    }

    return department;
  }

  const mapped = await resolveDepartmentForCategory(input.category);
  if (!mapped) {
    throw new CategoryRoutingError(
      input.category === "OTHER"
        ? "Please choose a department for the Other category."
        : "No active department is configured for this complaint type.",
    );
  }

  return mapped;
}
