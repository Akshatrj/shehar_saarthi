import { StatCard } from "@/components/ui/StatCard";
import type { CitizenComplaintStats } from "@/domains/complaints/constants";

export function CitizenStatsGrid({ stats }: { stats: CitizenComplaintStats }) {
  const total =
    stats.submitted +
    stats.routed +
    stats.assigned +
    stats.inProgress +
    stats.completed +
    stats.closed;

  const pending = stats.submitted + stats.routed + stats.assigned;
  const resolved = stats.completed + stats.closed;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total complaints" value={total} />
      <StatCard label="Pending" value={pending} hint="Submitted, routed, or assigned" />
      <StatCard label="In progress" value={stats.inProgress} />
      <StatCard label="Resolved" value={resolved} hint="Completed or closed" />
    </div>
  );
}
