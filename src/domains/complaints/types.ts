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
  "GARBAGE",
  "BLOCKED_DRAIN",
  "BROKEN_STREETLIGHT",
  "WATER_LEAKAGE",
  "FALLEN_TREE",
  "DAMAGED_FOOTPATH",
  "OTHER",
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  POTHOLE: "Pothole",
  DAMAGED_ROAD: "Damaged Road",
  GARBAGE: "Garbage",
  BLOCKED_DRAIN: "Blocked Drain",
  BROKEN_STREETLIGHT: "Broken Streetlight",
  WATER_LEAKAGE: "Water Leakage",
  FALLEN_TREE: "Fallen Tree",
  DAMAGED_FOOTPATH: "Damaged Footpath",
  OTHER: "Other",
};

export type ReportCategory = ComplaintCategory;

export const REPORT_CATEGORIES = COMPLAINT_CATEGORIES;
