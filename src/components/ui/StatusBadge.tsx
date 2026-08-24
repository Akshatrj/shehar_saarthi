import type { ComplaintStatus } from "@/domains/complaints/types";
import { COMPLAINT_STATUS_LABELS } from "@/domains/complaints/types";
import { cn } from "@/lib/cn";
import { statusBadgeClass } from "@/lib/tokens";

type StatusBadgeProps = {
  status: ComplaintStatus;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        statusBadgeClass[status],
        className,
      )}
    >
      {COMPLAINT_STATUS_LABELS[status]}
    </span>
  );
}
