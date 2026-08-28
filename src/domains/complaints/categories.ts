import type { ComplaintCategory, ServiceType } from "@/domains/complaints/types";

/**
 * Civic problem taxonomy — not department identity.
 * Department assignment comes from CategoryRoute (departmentId) in the database.
 */
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

export function serviceTypeForCategory(category: ComplaintCategory): ServiceType {
  return CATEGORY_TO_SERVICE_TYPE[category];
}
