export const COMPLAINT_HISTORY_ACTIONS = [
  "SUBMITTED",
  "AI_CLASSIFIED",
  "ROUTING_RECOMMENDED",
  "AUTO_ROUTED",
  "MANUALLY_ROUTED",
  "CATEGORY_CONFIRMED",
  "CATEGORY_CHANGED",
  "ASSIGNED_TO_SELF",
  "ASSIGNED_TO_WORKER",
  "REASSIGNED_TO_WORKER",
  "STARTED_PROGRESS",
  "MARKED_COMPLETED",
  "CLOSED",
  "REOPENED_BY_CITIZEN",
  "ADMIN_OVERRIDE",
] as const;

export type ComplaintHistoryAction =
  (typeof COMPLAINT_HISTORY_ACTIONS)[number];

export const ROUTING_METHODS = [
  "AI_CONFIRMED",
  "USER_SELECTED",
  "ROUTING_ENGINE",
  "ADMIN_ACCEPTED",
  "ADMIN_MANUAL",
  "AUTO_ROUTE_ALL",
] as const;

export type RoutingMethod = (typeof ROUTING_METHODS)[number];

export type CategoryRoutingMetadata = {
  category: string;
  routingMethod: RoutingMethod;
  departmentId?: string;
  departmentCode?: string;
};

export const MAX_COMPLAINT_IMAGE_BYTES = 8 * 1024 * 1024;

export const ALLOWED_COMPLAINT_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedComplaintImageMime =
  (typeof ALLOWED_COMPLAINT_IMAGE_MIME)[number];

export type CitizenComplaintSummary = {
  id: string;
  publicRef: string;
  description: string;
  imageUrl: string;
  status: string;
  category: string | null;
  createdAt: string;
};

export type CitizenTimelineItem = {
  id: string;
  label: string;
  detail?: string;
  createdAt: string;
};

export type CitizenComplaintDetail = CitizenComplaintSummary & {
  contactPhone: string | null;
  aiCategory: string | null;
  aiDescription: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  } | null;
  latitude: string;
  longitude: string;
  locationLabel: string | null;
  timeline: CitizenTimelineItem[];
};

export const CITIZEN_PAGE_SIZE = 20;

export type CitizenComplaintStats = {
  submitted: number;
  routed: number;
  assigned: number;
  inProgress: number;
  completed: number;
  closed: number;
};

export const WORKER_PAGE_SIZE = 15;

export const WORKER_STATUS_FILTERS = [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CLOSED",
] as const;

export type WorkerComplaintStats = {
  assigned: number;
  inProgress: number;
  completed: number;
};

export type WorkerComplaintListItem = {
  id: string;
  publicRef: string;
  description: string;
  category: string | null;
  status: string;
  createdAt: string;
  assignedWorker: {
    id: string;
    name: string;
  } | null;
};

export type ComplaintHistoryItem = {
  id: string;
  action: string;
  oldStatus: string | null;
  newStatus: string;
  metadata: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
  } | null;
};

export type WorkerComplaintDetail = {
  id: string;
  publicRef: string;
  description: string;
  imageUrl: string;
  category: string | null;
  aiCategory: string | null;
  aiDescription: string | null;
  aiCategoryConfidence: number | null;
  evidenceConsistency: string | null;
  evidenceConfidence: number | null;
  evidenceReason: string | null;
  aiPriority: string | null;
  priorityScore: number | null;
  civicImpactScore: number | null;
  requiresManualReview: boolean;
  recommendedDepartmentName: string | null;
  recommendedAction: string | null;
  priorityReason: string | null;
  recurringProblem: boolean;
  status: string;
  latitude: string;
  longitude: string;
  locationLabel: string | null;
  contactPhone: string | null;
  createdAt: string;
  assignedWorkerId: string | null;
  department: {
    id: string;
    name: string;
    code: string;
  };
  assignedWorker: {
    id: string;
    name: string;
  } | null;
  history: ComplaintHistoryItem[];
};

export const DEPARTMENT_ADMIN_PAGE_SIZE = 15;

export type DepartmentAdminComplaintStats = {
  total: number;
  routed: number;
  assigned: number;
  inProgress: number;
  completed: number;
  closed: number;
};

export type DepartmentAdminComplaintListItem = WorkerComplaintListItem;

export type DepartmentAdminComplaintDetail = Omit<
  WorkerComplaintDetail,
  "assignedWorkerId"
>;

export type DepartmentWorkerRow = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
};
