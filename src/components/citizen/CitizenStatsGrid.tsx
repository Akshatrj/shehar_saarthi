import { Card } from "@/components/ui/Card";
import type { CitizenComplaintStats } from "@/domains/complaints/constants";

const statItems: Array<{
  key: keyof CitizenComplaintStats;
  label: string;
}> = [
  { key: "submitted", label: "Submitted" },
  { key: "routed", label: "Routed" },
  { key: "assigned", label: "Assigned" },
  { key: "inProgress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "closed", label: "Closed" },
];

export function CitizenStatsGrid({ stats }: { stats: CitizenComplaintStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {statItems.map((item) => (
        <Card key={item.key} className="p-4">
          <p className="text-small text-muted">{item.label}</p>
          <p className="mt-1 text-h2 text-navy">{stats[item.key]}</p>
        </Card>
      ))}
    </div>
  );
}
