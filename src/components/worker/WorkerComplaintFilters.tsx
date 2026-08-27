import Link from "next/link";
import {
  COMPLAINT_STATUS_LABELS,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import { WORKER_STATUS_FILTERS } from "@/domains/complaints/constants";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { controlClassName } from "@/components/ui/Field";

type WorkerComplaintFiltersProps = {
  currentStatus?: string;
};

export function WorkerComplaintFilters({
  currentStatus,
}: WorkerComplaintFiltersProps) {
  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" method="get">
      <div className="ss-filter-field">
        <label htmlFor="status" className="text-label font-medium text-green-950">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus ?? ""}
          className={cn(controlClassName, "border-line")}
        >
          <option value="">All assigned</option>
          {WORKER_STATUS_FILTERS.map((status) => (
            <option key={status} value={status}>
              {COMPLAINT_STATUS_LABELS[status as ComplaintStatus]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm" className="w-full sm:w-auto">
        Apply filter
      </Button>
      {currentStatus ? (
        <Link href="/worker" className="text-small font-medium text-brand">
          Clear
        </Link>
      ) : null}
    </form>
  );
}
