import { COMPLAINT_STATUSES, COMPLAINT_STATUS_LABELS } from "@/domains/complaints/types";
import { STATUS_CHART_COLORS } from "@/domains/admin/chart-data";
import { LazyComplaintsMap } from "@/components/maps/LazyComplaintsMap";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { MapComplaintPin } from "@/domains/complaints/dashboard-analytics";
import { cn } from "@/lib/cn";

type ComplaintsMapSectionProps = {
  title: string;
  description: string;
  complaints: MapComplaintPin[];
  detailPathPrefix: string;
  mapTotalCount: number;
  mapTruncated: boolean;
};

export function ComplaintsMapSection({
  title,
  description,
  complaints,
  detailPathPrefix,
  mapTotalCount,
  mapTruncated,
}: ComplaintsMapSectionProps) {
  return (
    <Card className="p-5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <LazyComplaintsMap
        complaints={complaints}
        detailPathPrefix={detailPathPrefix}
        mapTotalCount={mapTotalCount}
        mapTruncated={mapTruncated}
      />
      <ul className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        {COMPLAINT_STATUSES.map((status) => (
          <li key={status} className="inline-flex items-center gap-2">
            <span
              className={cn("inline-block h-2.5 w-2.5 rounded-full")}
              style={{ backgroundColor: STATUS_CHART_COLORS[status] }}
              aria-hidden
            />
            {COMPLAINT_STATUS_LABELS[status]}
          </li>
        ))}
      </ul>
    </Card>
  );
}
