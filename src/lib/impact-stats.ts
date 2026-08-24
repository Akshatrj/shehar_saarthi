export const IMPACT_STATS_SOURCE = "placeholder" as const;

export type ImpactStat = {
  key: string;
  label: string;
  value: number;
  suffix?: string;
  format: "number" | "hours";
};

export const impactStats: ImpactStat[] = [
  {
    key: "issuesReported",
    label: "Issues reported",
    value: 12840,
    format: "number",
  },
  {
    key: "issuesResolved",
    label: "Issues resolved",
    value: 9102,
    format: "number",
  },
  {
    key: "medianFirstResponseHours",
    label: "Median first response",
    value: 36,
    suffix: "hrs",
    format: "hours",
  },
  {
    key: "wardsCovered",
    label: "Wards covered",
    value: 62,
    format: "number",
  },
];

export function formatImpactStat(stat: ImpactStat) {
  if (stat.format === "hours") {
    return `${stat.value} ${stat.suffix ?? "hrs"}`;
  }

  return new Intl.NumberFormat("en-IN").format(stat.value);
}
