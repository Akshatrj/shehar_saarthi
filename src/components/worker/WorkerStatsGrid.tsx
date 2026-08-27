import { CircleCheck, Loader, UserCheck } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { WorkerComplaintStats } from "@/domains/complaints/constants";

export function WorkerStatsGrid({ stats }: { stats: WorkerComplaintStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Assigned" value={stats.assigned} icon={UserCheck} tone="brand" />
      <StatCard label="In progress" value={stats.inProgress} icon={Loader} />
      <StatCard label="Completed" value={stats.completed} icon={CircleCheck} tone="success" />
    </div>
  );
}
