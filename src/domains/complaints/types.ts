export const COMPLAINT_STATUSES = [
  "SUBMITTED",
  "ROUTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CLOSED",
] as const;

export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  SUBMITTED: "Received",
  ROUTED: "With department",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Work completed",
  CLOSED: "Closed",
};

export const COMPLAINT_CATEGORIES = [
  "POTHOLE",
  "DAMAGED_ROAD",
  "DAMAGED_FOOTPATH",
  "ROAD_OBSTRUCTION",
  "BROKEN_STREETLIGHT",
  "FLICKERING_STREETLIGHT",
  "DARK_AREA",
  "GARBAGE",
  "OVERFLOWING_DUSTBIN",
  "ILLEGAL_DUMPING",
  "WATER_LEAKAGE",
  "NO_WATER_SUPPLY",
  "CONTAMINATED_WATER",
  "BLOCKED_DRAIN",
  "OVERFLOWING_DRAIN",
  "DAMAGED_DRAIN",
  "FALLEN_TREE",
  "OTHER",
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  POTHOLE: "Pothole",
  DAMAGED_ROAD: "Damaged Road",
  DAMAGED_FOOTPATH: "Damaged Footpath",
  ROAD_OBSTRUCTION: "Road Obstruction",
  BROKEN_STREETLIGHT: "Broken Street Light",
  FLICKERING_STREETLIGHT: "Flickering Street Light",
  DARK_AREA: "Dark Area / No Street Lighting",
  GARBAGE: "Garbage Not Collected",
  OVERFLOWING_DUSTBIN: "Overflowing Dustbin",
  ILLEGAL_DUMPING: "Illegal Dumping",
  WATER_LEAKAGE: "Water Leakage",
  NO_WATER_SUPPLY: "No Water Supply",
  CONTAMINATED_WATER: "Contaminated Water",
  BLOCKED_DRAIN: "Blocked Drain",
  OVERFLOWING_DRAIN: "Overflowing Drain",
  DAMAGED_DRAIN: "Damaged Drain",
  FALLEN_TREE: "Fallen Tree",
  OTHER: "Other Civic Issue",
};

export const SERVICE_TYPES = [
  "ROADS",
  "STREET_LIGHTING",
  "SANITATION",
  "WATER",
  "DRAINAGE",
  "PARKS",
  "OTHER",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const ROUTING_STATUSES = [
  "UNASSIGNED",
  "AI_ANALYZED",
  "ROUTING_RECOMMENDED",
  "AUTO_ASSIGNED",
  "MANUALLY_ASSIGNED",
] as const;

export type RoutingStatus = (typeof ROUTING_STATUSES)[number];

export const ROUTING_STATUS_LABELS: Record<RoutingStatus, string> = {
  UNASSIGNED: "Unassigned",
  AI_ANALYZED: "AI analyzed",
  ROUTING_RECOMMENDED: "Routing recommended",
  AUTO_ASSIGNED: "Auto-assigned",
  MANUALLY_ASSIGNED: "Manually assigned",
};

export type ReportCategory = ComplaintCategory;

export const REPORT_CATEGORIES = COMPLAINT_CATEGORIES;
