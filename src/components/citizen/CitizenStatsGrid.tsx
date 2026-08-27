import { CheckCircle2, ClipboardList, Clock3, Loader } from "lucide-react";
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
      <StatCard
        label="Total complaints"
        value={total}
        icon={ClipboardList}
        tone="brand"
      />
      <StatCard
        label="Pending"
        value={pending}
        hint="Submitted, routed, or assigned"
        icon={Clock3}
        tone="warning"
      />
      <StatCard
        label="In progress"
        value={stats.inProgress}
        icon={Loader}
      />
      <StatCard
        label="Resolved"
        value={resolved}
        hint="Completed or closed"
        icon={CheckCircle2}
        tone="success"
      />
    </div>
  );
}
