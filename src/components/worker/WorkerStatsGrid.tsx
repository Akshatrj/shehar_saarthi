import { Card } from "@/components/ui/Card";
import type { WorkerComplaintStats } from "@/domains/complaints/constants";

const statItems: Array<{
  key: keyof WorkerComplaintStats;
  label: string;
}> = [
  { key: "assigned", label: "Assigned" },
  { key: "inProgress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

export function WorkerStatsGrid({ stats }: { stats: WorkerComplaintStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {statItems.map((item) => (
        <Card key={item.key} className="p-4">
          <p className="text-small text-muted">{item.label}</p>
          <p className="mt-1 text-h2 text-navy">{stats[item.key]}</p>
        </Card>
      ))}
    </div>
  );
}
