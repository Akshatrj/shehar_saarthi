import { AreaTrendChart } from "@/components/charts/AreaTrendChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { VerticalBarChart } from "@/components/charts/VerticalBarChart";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardAnalytics } from "@/domains/complaints/dashboard-analytics";

type PortalDashboardChartsProps = Pick<
  DashboardAnalytics,
  | "byStatus"
  | "byCategory"
  | "distribution"
  | "distributionTitle"
  | "distributionDescription"
  | "trend"
  | "totals"
>;

export function PortalDashboardCharts({
  byStatus,
  byCategory,
  distribution,
  distributionTitle,
  distributionDescription,
  trend,
  totals,
}: PortalDashboardChartsProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <CardHeader>
          <CardTitle>Complaint trend</CardTitle>
          <CardDescription>
            Daily volume from live database records over the last 30 days.
          </CardDescription>
        </CardHeader>
        <AreaTrendChart data={trend} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <CardHeader>
            <CardTitle>Pipeline mix</CardTitle>
            <CardDescription>
              Donut view of complaint status distribution.
            </CardDescription>
          </CardHeader>
          <DonutChart
            data={byStatus}
            centerLabel="Total"
            centerValue={totals.complaints}
          />
        </Card>

        <Card className="p-5">
          <CardHeader>
            <CardTitle>Issue categories</CardTitle>
            <CardDescription>
              Vertical bar chart of reported issue types.
            </CardDescription>
          </CardHeader>
          <VerticalBarChart data={byCategory} />
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader>
          <CardTitle>{distributionTitle}</CardTitle>
          <CardDescription>{distributionDescription}</CardDescription>
        </CardHeader>
        <StackedBarChart data={distribution} />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-line bg-brand-50/50 px-4 py-3">
            <p className="text-small text-muted">Total complaints</p>
            <p className="mt-1 text-h3 font-semibold text-navy">{totals.complaints}</p>
          </div>
          <div className="rounded-md border border-line bg-brand-50/50 px-4 py-3">
            <p className="text-small text-muted">Open pipeline</p>
            <p className="mt-1 text-h3 font-semibold text-navy">{totals.open}</p>
          </div>
          <div className="rounded-md border border-line bg-brand-50/50 px-4 py-3">
            <p className="text-small text-muted">Resolved / closed</p>
            <p className="mt-1 text-h3 font-semibold text-navy">{totals.resolved}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
