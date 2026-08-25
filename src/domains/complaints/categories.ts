import type { ComplaintCategory, ServiceType } from "@/domains/complaints/types";

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
 * Default category → department slug mapping used by the routing engine.
 * OTHER requires Super Admin manual assignment.
 */
export const CATEGORY_TO_DEPARTMENT_SLUG: Record<
  ComplaintCategory,
  DepartmentSlug | null
> = {
  POTHOLE: "roads",
  DAMAGED_ROAD: "roads",
  DAMAGED_FOOTPATH: "roads",
  ROAD_OBSTRUCTION: "roads",
  GARBAGE: "sanitation",
  OVERFLOWING_DUSTBIN: "sanitation",
  ILLEGAL_DUMPING: "sanitation",
  BLOCKED_DRAIN: "sanitation",
  OVERFLOWING_DRAIN: "sanitation",
  DAMAGED_DRAIN: "sanitation",
  BROKEN_STREETLIGHT: "electrical",
  FLICKERING_STREETLIGHT: "electrical",
  DARK_AREA: "electrical",
  WATER_LEAKAGE: "water",
  NO_WATER_SUPPLY: "water",
  CONTAMINATED_WATER: "water",
  FALLEN_TREE: "parks",
  OTHER: null,
};

export const CATEGORY_TO_SERVICE_TYPE: Record<ComplaintCategory, ServiceType> = {
  POTHOLE: "ROADS",
  DAMAGED_ROAD: "ROADS",
  DAMAGED_FOOTPATH: "ROADS",
  ROAD_OBSTRUCTION: "ROADS",
  BROKEN_STREETLIGHT: "STREET_LIGHTING",
  FLICKERING_STREETLIGHT: "STREET_LIGHTING",
  DARK_AREA: "STREET_LIGHTING",
  GARBAGE: "SANITATION",
  OVERFLOWING_DUSTBIN: "SANITATION",
  ILLEGAL_DUMPING: "SANITATION",
  BLOCKED_DRAIN: "DRAINAGE",
  OVERFLOWING_DRAIN: "DRAINAGE",
  DAMAGED_DRAIN: "DRAINAGE",
  WATER_LEAKAGE: "WATER",
  NO_WATER_SUPPLY: "WATER",
  CONTAMINATED_WATER: "WATER",
  FALLEN_TREE: "PARKS",
  OTHER: "OTHER",
};

export function departmentSlugForCategory(
  category: ComplaintCategory,
): DepartmentSlug | null {
  return CATEGORY_TO_DEPARTMENT_SLUG[category];
}

export function serviceTypeForCategory(category: ComplaintCategory): ServiceType {
  return CATEGORY_TO_SERVICE_TYPE[category];
}
