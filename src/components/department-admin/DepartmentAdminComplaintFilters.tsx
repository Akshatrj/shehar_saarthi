import Link from "next/link";
import { COMPLAINT_STATUSES, COMPLAINT_STATUS_LABELS } from "@/domains/complaints/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { controlClassName } from "@/components/ui/Field";

export function DepartmentAdminComplaintFilters({
  currentStatus,
}: {
  currentStatus?: string;
}) {
  return (
    <form className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" method="get">
      <div className="ss-filter-field">
        <label htmlFor="status" className="text-label font-medium text-navy">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus ?? ""}
          className={cn(controlClassName, "border-line")}
        >
          <option value="">All statuses</option>
          {COMPLAINT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {COMPLAINT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm" className="w-full sm:w-auto">
        Apply filter
      </Button>
      {currentStatus ? (
        <Link href="/department-admin" className="text-small font-medium text-brand">
          Clear
        </Link>
      ) : null}
    </form>
  );
}
