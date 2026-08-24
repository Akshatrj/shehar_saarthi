import { prisma } from "@/lib/db";
import type { AuthUser } from "@/lib/rbac";
import { buildCitizenTimeline } from "@/domains/complaints/timeline";
import {
  CITIZEN_PAGE_SIZE,
  type CitizenComplaintDetail,
  type CitizenComplaintStats,
  type CitizenComplaintSummary,
  type CitizenTimelineItem,
} from "@/domains/complaints/constants";
import type { ComplaintStatus } from "@/domains/complaints/types";

function mapSummary(row: {
  id: string;
  publicRef: string;
  description: string;
  imageUrl: string;
  status: ComplaintStatus;
  category: string | null;
  createdAt: Date;
}): CitizenComplaintSummary {
  return {
    id: row.id,
    publicRef: row.publicRef,
    description: row.description,
    imageUrl: row.imageUrl,
    status: row.status,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
  };
}

export function parseCitizenPage(value: unknown) {
  const parsed = typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
}

export async function getCitizenComplaintStats(
  citizenId: string,
): Promise<CitizenComplaintStats> {
  const [
    submitted,
    routed,
    assigned,
    inProgress,
    completed,
    closed,
  ] = await Promise.all([
    prisma.complaint.count({ where: { citizenId, status: "SUBMITTED" } }),
    prisma.complaint.count({ where: { citizenId, status: "ROUTED" } }),
    prisma.complaint.count({ where: { citizenId, status: "ASSIGNED" } }),
    prisma.complaint.count({ where: { citizenId, status: "IN_PROGRESS" } }),
    prisma.complaint.count({ where: { citizenId, status: "COMPLETED" } }),
    prisma.complaint.count({ where: { citizenId, status: "CLOSED" } }),
  ]);

  return { submitted, routed, assigned, inProgress, completed, closed };
}

export async function listCitizenComplaintsPage(
  actor: AuthUser,
  page = 1,
) {
  const safePage = page > 0 ? page : 1;
  const rows = await prisma.complaint.findMany({
    where: { citizenId: actor.id },
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * CITIZEN_PAGE_SIZE,
    take: CITIZEN_PAGE_SIZE + 1,
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      status: true,
      category: true,
      createdAt: true,
    },
  });

  const hasMore = rows.length > CITIZEN_PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, CITIZEN_PAGE_SIZE) : rows;

  return {
    complaints: pageRows.map(mapSummary),
    page: safePage,
    hasMore,
  };
}

export async function getCitizenComplaintDetail(
  actor: AuthUser,
  complaintId: string,
): Promise<CitizenComplaintDetail | null> {
  const row = await prisma.complaint.findFirst({
    where: { id: complaintId, citizenId: actor.id },
    select: {
      id: true,
      publicRef: true,
      description: true,
      imageUrl: true,
      status: true,
      category: true,
      aiCategory: true,
      aiDescription: true,
      latitude: true,
      longitude: true,
      locationLabel: true,
      createdAt: true,
      department: {
        select: { id: true, name: true, code: true },
      },
      history: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          action: true,
          oldStatus: true,
          newStatus: true,
          metadata: true,
          createdAt: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  const history = row.history.map((entry) => ({
    id: entry.id,
    action: entry.action,
    oldStatus: entry.oldStatus,
    newStatus: entry.newStatus,
    metadata: entry.metadata,
    createdAt: entry.createdAt.toISOString(),
  }));

  const timeline: CitizenTimelineItem[] = buildCitizenTimeline({
    history,
    aiCategory: row.aiCategory,
    aiDescription: row.aiDescription,
  });

  return {
    id: row.id,
    publicRef: row.publicRef,
    description: row.description,
    imageUrl: row.imageUrl,
    status: row.status,
    category: row.category,
    aiCategory: row.aiCategory,
    aiDescription: row.aiDescription,
    department: row.department,
    latitude: row.latitude.toString(),
    longitude: row.longitude.toString(),
    locationLabel: row.locationLabel,
    createdAt: row.createdAt.toISOString(),
    timeline,
  };
}
