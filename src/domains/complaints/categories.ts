import type { ComplaintCategory } from "@/domains/complaints/types";

export const DEPARTMENT_SLUGS = [
  "roads",
  "sanitation",
  "electrical",
  "water",
  "parks",
] as const;

export type DepartmentSlug = (typeof DEPARTMENT_SLUGS)[number];

export const DEPARTMENT_NAMES: Record<DepartmentSlug, string> = {
  roads: "Roads",
  sanitation: "Sanitation",
  electrical: "Electrical",
  water: "Water",
  parks: "Parks",
};

/**
 * Maps a complaint category to a department slug.
 * OTHER requires manual department selection in later workflow phases.
 */
export const CATEGORY_TO_DEPARTMENT_SLUG: Record<
  ComplaintCategory,
  DepartmentSlug | null
> = {
  POTHOLE: "roads",
  DAMAGED_ROAD: "roads",
  GARBAGE: "sanitation",
  BLOCKED_DRAIN: "sanitation",
  BROKEN_STREETLIGHT: "electrical",
  WATER_LEAKAGE: "water",
  FALLEN_TREE: "parks",
  DAMAGED_FOOTPATH: "roads",
  OTHER: null,
};

export function departmentSlugForCategory(
  category: ComplaintCategory,
): DepartmentSlug | null {
  return CATEGORY_TO_DEPARTMENT_SLUG[category];
}
