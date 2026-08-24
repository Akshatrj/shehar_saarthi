import { Card } from "@/components/ui/Card";
import type { StaffComplaintStats } from "@/domains/complaints/constants";

const statItems: Array<{
  key: keyof StaffComplaintStats;
  label: string;
}> = [
  { key: "total", label: "Total" },
  { key: "routed", label: "Routed" },
  { key: "assigned", label: "Assigned" },
  { key: "inProgress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

export function StaffStatsGrid({ stats }: { stats: StaffComplaintStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {statItems.map((item) => (
        <Card key={item.key} className="p-4">
          <p className="text-small text-muted">{item.label}</p>
          <p className="mt-1 text-h2 text-navy">{stats[item.key]}</p>
        </Card>
      ))}
    </div>
  );
}
