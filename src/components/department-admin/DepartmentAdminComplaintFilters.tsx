import Link from "next/link";
import { COMPLAINT_STATUSES, COMPLAINT_STATUS_LABELS } from "@/domains/complaints/types";
import { cn } from "@/lib/cn";
import { controlClassName } from "@/components/ui/Field";

export function DepartmentAdminComplaintFilters({
  currentStatus,
}: {
  currentStatus?: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-3" method="get">
      <div className="flex min-w-[12rem] flex-col gap-1">
        <label htmlFor="status" className="text-label font-medium text-green-950">
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
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-md bg-orange px-4 text-small font-medium text-white"
      >
        Apply filter
      </button>
      {currentStatus ? (
        <Link href="/department-admin" className="text-small font-medium text-brand">
          Clear
        </Link>
      ) : null}
    </form>
  );
}
