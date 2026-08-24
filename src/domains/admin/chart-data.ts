import {
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  type ComplaintStatus,
} from "@/domains/complaints/types";

export const STATUS_CHART_COLORS: Record<ComplaintStatus, string> = {
  SUBMITTED: "#1565c0",
  ROUTED: "#5e35b1",
  ASSIGNED: "#f9a825",
  IN_PROGRESS: "#ef6c00",
  COMPLETED: "#2e7d32",
  CLOSED: "#546e7a",
};

export const CATEGORY_CHART_COLORS = [
  "#1565c0",
  "#00897b",
  "#6a1b9a",
  "#ef6c00",
  "#c62828",
  "#0277bd",
  "#558b2f",
  "#5d4037",
  "#78909c",
] as const;

export const DEPARTMENT_CHART_COLORS = [
  "#1e88e5",
  "#43a047",
  "#8e24aa",
  "#fb8c00",
  "#e53935",
  "#00acc1",
  "#7cb342",
  "#6d4c41",
] as const;

export type ChartDatum = {
  key: string;
  label: string;
  count: number;
  color: string;
};

export type TrendDatum = {
  date: string;
  label: string;
  count: number;
};

export function statusChartData(
  counts: Map<ComplaintStatus, number>,
): ChartDatum[] {
  return COMPLAINT_STATUSES.map((status) => ({
    key: status,
    label: COMPLAINT_STATUS_LABELS[status],
    count: counts.get(status) ?? 0,
    color: STATUS_CHART_COLORS[status],
  }));
}

export function categoryChartData(
  items: { label: string; count: number }[],
): ChartDatum[] {
  return items.map((item, index) => ({
    key: item.label,
    label: item.label,
    count: item.count,
    color: CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length]!,
  }));
}

export function departmentChartData(
  items: { label: string; count: number }[],
): ChartDatum[] {
  return items.map((item, index) => ({
    key: item.label,
    label: item.label,
    count: item.count,
    color: DEPARTMENT_CHART_COLORS[index % DEPARTMENT_CHART_COLORS.length]!,
  }));
}

export function buildTrendSeries(
  rows: { createdAt: Date }[],
  days = 30,
): TrendDatum[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = new Map<string, number>();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const key = day.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const row of rows) {
    const key = row.createdAt.toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => {
    const parsed = new Date(`${date}T00:00:00`);
    return {
      date,
      label: parsed.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      count,
    };
  });
}
