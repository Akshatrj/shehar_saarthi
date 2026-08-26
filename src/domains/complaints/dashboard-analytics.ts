import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  buildTrendSeries,
  categoryChartData,
  departmentChartData,
  statusChartData,
  type ChartDatum,
  type TrendDatum,
} from "@/domains/admin/chart-data";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  COMPLAINT_STATUSES,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";

export const DASHBOARD_MAP_PIN_LIMIT = 250;

const TREND_DAYS_MS = 29 * 24 * 60 * 60 * 1000;

export type MapComplaintPin = {
  id: string;
  publicRef: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  category: ComplaintCategory | null;
  description: string;
  departmentId: string | null;
  departmentName: string | null;
};

export type DashboardAnalytics = {
  mapComplaints: MapComplaintPin[];
  mapTotalCount: number;
  mapTruncated: boolean;
  byStatus: ChartDatum[];
  byCategory: ChartDatum[];
  distribution: ChartDatum[];
  distributionTitle: string;
  distributionDescription: string;
  trend: TrendDatum[];
  totals: {
    complaints: number;
    open: number;
    resolved: number;
  };
};

function truncateDescription(value: string, max = 120) {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function trendStartDate() {
  return new Date(Date.now() - TREND_DAYS_MS);
}

async function resolveDistributionChart(
  scope: { departmentId?: string },
  groups: Array<{ departmentId?: string | null; assignedWorkerId?: string | null; _count: { _all: number } }>,
): Promise<{ data: ChartDatum[]; title: string; description: string }> {
  if (scope.departmentId) {
    const workerIds = groups
      .map((group) => group.assignedWorkerId)
      .filter((id): id is string => Boolean(id));

    const workers =
      workerIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: workerIds } },
            select: { id: true, name: true },
          })
        : [];

    const workerNameById = new Map(
      workers.map((worker) => [worker.id, worker.name || "Unnamed worker"]),
    );

    return {
      title: "Worker workload",
      description: "Active assignments split across department workers.",
      data: departmentChartData(
        groups
          .map((group) => ({
            label:
              workerNameById.get(group.assignedWorkerId ?? "") ??
              "Unknown worker",
            count: group._count._all,
          }))
          .sort((left, right) => right.count - left.count),
      ),
    };
  }

  const departmentIds = groups
    .map((group) => group.departmentId)
    .filter((id): id is string => Boolean(id));

  const departments =
    departmentIds.length > 0
      ? await prisma.department.findMany({
          where: { id: { in: departmentIds } },
          select: { id: true, name: true },
        })
      : [];

  const departmentNameById = new Map(
    departments.map((department) => [department.id, department.name]),
  );

  return {
    title: "Department workload",
    description: "Proportional split of routed complaints by department.",
    data: departmentChartData(
      groups
        .map((group) => ({
          label:
            departmentNameById.get(group.departmentId ?? "") ??
            "Unknown department",
          count: group._count._all,
        }))
        .sort((left, right) => right.count - left.count),
    ),
  };
}

export type DashboardAnalyticsScope = {
  departmentId?: string;
  assignedWorkerId?: string;
};

function resolveAnalyticsWhere(
  scope: DashboardAnalyticsScope,
): Prisma.ComplaintWhereInput {
  if (scope.assignedWorkerId) {
    return { assignedWorkerId: scope.assignedWorkerId };
  }
  if (scope.departmentId) {
    return { departmentId: scope.departmentId };
  }
  return {};
}

function resolveMapWhere(scope: DashboardAnalyticsScope): Prisma.ComplaintWhereInput {
  return resolveAnalyticsWhere(scope);
}

const mapComplaintSelect = {
  id: true,
  publicRef: true,
  latitude: true,
  longitude: true,
  status: true,
  category: true,
  description: true,
  departmentId: true,
  department: {
    select: { name: true },
  },
} as const;

function mapComplaintRows(
  mapRows: Array<{
    id: string;
    publicRef: string;
    latitude: unknown;
    longitude: unknown;
    status: ComplaintStatus;
    category: ComplaintCategory | null;
    description: string;
    departmentId: string | null;
    department: { name: string } | null;
  }>,
): MapComplaintPin[] {
  return mapRows.map((complaint) => ({
    id: complaint.id,
    publicRef: complaint.publicRef,
    latitude: Number(complaint.latitude),
    longitude: Number(complaint.longitude),
    status: complaint.status,
    category: complaint.category,
    description: truncateDescription(complaint.description),
    departmentId: complaint.departmentId,
    departmentName: complaint.department?.name ?? null,
  }));
}

export async function getComplaintMapAnalytics(
  where: Prisma.ComplaintWhereInput,
): Promise<
  Pick<DashboardAnalytics, "mapComplaints" | "mapTotalCount" | "mapTruncated">
> {
  const [totalComplaints, mapRows] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: DASHBOARD_MAP_PIN_LIMIT,
      select: mapComplaintSelect,
    }),
  ]);

  return {
    mapComplaints: mapComplaintRows(mapRows),
    mapTotalCount: totalComplaints,
    mapTruncated: totalComplaints > mapRows.length,
  };
}

async function loadDashboardAnalytics(
  scope: DashboardAnalyticsScope,
): Promise<DashboardAnalytics> {
  const where = resolveAnalyticsWhere(scope);
  const mapWhere = resolveMapWhere(scope);

  const trendWhere: Prisma.ComplaintWhereInput = {
    ...where,
    createdAt: { gte: trendStartDate() },
  };

  const [
    totalComplaints,
    mapData,
    statusGroups,
    categoryGroups,
    distributionGroups,
    recentComplaints,
  ] = await Promise.all([
    prisma.complaint.count({ where }),
    getComplaintMapAnalytics(mapWhere),
    prisma.complaint.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    prisma.complaint.groupBy({
      by: ["category"],
      where,
      _count: { _all: true },
    }),
    scope.departmentId
      ? prisma.complaint.groupBy({
          by: ["assignedWorkerId"],
          where: {
            departmentId: scope.departmentId,
            assignedWorkerId: { not: null },
          },
          _count: { _all: true },
        })
      : prisma.complaint.groupBy({
          by: ["departmentId"],
          where: { departmentId: { not: null } },
          _count: { _all: true },
        }),
    prisma.complaint.findMany({
      where: trendWhere,
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const statusCounts = new Map(
    statusGroups.map((group) => [group.status, group._count._all]),
  );

  const categoryCounts = new Map(
    categoryGroups.map((group) => [
      group.category ?? "UNCATEGORIZED",
      group._count._all,
    ]),
  );

  const categoryItems = [
    ...COMPLAINT_CATEGORIES.map((category) => ({
      label: COMPLAINT_CATEGORY_LABELS[category],
      count: categoryCounts.get(category) ?? 0,
    })),
    {
      label: "Uncategorized",
      count: categoryCounts.get("UNCATEGORIZED") ?? 0,
    },
  ].filter((item) => item.count > 0);

  const openCount = COMPLAINT_STATUSES.filter(
    (status) => status !== "COMPLETED" && status !== "CLOSED",
  ).reduce((sum, status) => sum + (statusCounts.get(status) ?? 0), 0);

  const resolvedCount =
    (statusCounts.get("COMPLETED") ?? 0) + (statusCounts.get("CLOSED") ?? 0);

  const distribution = await resolveDistributionChart(scope, distributionGroups);

  return {
    mapComplaints: mapData.mapComplaints,
    mapTotalCount: mapData.mapTotalCount,
    mapTruncated: mapData.mapTruncated,
    byStatus: statusChartData(statusCounts),
    byCategory: categoryChartData(categoryItems),
    distribution: distribution.data,
    distributionTitle: distribution.title,
    distributionDescription: distribution.description,
    trend: buildTrendSeries(recentComplaints),
    totals: {
      complaints: totalComplaints,
      open: openCount,
      resolved: resolvedCount,
    },
  };
}

export const getDashboardAnalytics = cache(loadDashboardAnalytics);
