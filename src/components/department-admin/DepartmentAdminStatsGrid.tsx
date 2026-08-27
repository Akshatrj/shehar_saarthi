import {
  CircleCheck,
  ClipboardList,
  FolderCheck,
  Loader,
  Route,
  UserCheck,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { DepartmentAdminComplaintStats } from "@/domains/complaints/constants";

export function DepartmentAdminStatsGrid({
  stats,
}: {
  stats: DepartmentAdminComplaintStats;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Total" value={stats.total} icon={ClipboardList} tone="brand" />
      <StatCard label="Routed" value={stats.routed} icon={Route} />
      <StatCard label="Assigned" value={stats.assigned} icon={UserCheck} />
      <StatCard label="In progress" value={stats.inProgress} icon={Loader} />
      <StatCard label="Completed" value={stats.completed} icon={CircleCheck} tone="success" />
      <StatCard label="Closed" value={stats.closed} icon={FolderCheck} />
    </div>
  );
}
