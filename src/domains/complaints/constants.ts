export const COMPLAINT_HISTORY_ACTIONS = [
  "SUBMITTED",
  "CATEGORY_CONFIRMED",
  "CATEGORY_CHANGED",
  "ASSIGNED_TO_SELF",
  "STARTED_PROGRESS",
  "MARKED_COMPLETED",
  "ADMIN_OVERRIDE",
] as const;

export type ComplaintHistoryAction =
  (typeof COMPLAINT_HISTORY_ACTIONS)[number];

export const ROUTING_METHODS = ["AI_CONFIRMED", "USER_SELECTED"] as const;

export type RoutingMethod = (typeof ROUTING_METHODS)[number];

export type CategoryRoutingMetadata = {
  category: string;
  routingMethod: RoutingMethod;
  departmentSlug?: string;
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
  aiCategory: string | null;
  aiDescription: string | null;
  department: {
    id: string;
    name: string;
    slug: string;
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

export const STAFF_PAGE_SIZE = 15;

export type StaffComplaintStats = {
  total: number;
  routed: number;
  assigned: number;
  inProgress: number;
  completed: number;
};

export type StaffComplaintListItem = {
  id: string;
  publicRef: string;
  description: string;
  imageUrl: string;
  category: string | null;
  status: string;
  createdAt: string;
  assignedWorker: {
    id: string;
    name: string;
  } | null;
};

export type StaffComplaintHistoryItem = {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
  } | null;
};

export type StaffComplaintDetail = {
  id: string;
  publicRef: string;
  description: string;
  imageUrl: string;
  category: string | null;
  aiCategory: string | null;
  aiDescription: string | null;
  status: string;
  latitude: string;
  longitude: string;
  locationLabel: string | null;
  createdAt: string;
  department: {
    id: string;
    name: string;
    slug: string;
  };
  assignedWorker: {
    id: string;
    name: string;
  } | null;
  history: StaffComplaintHistoryItem[];
};
