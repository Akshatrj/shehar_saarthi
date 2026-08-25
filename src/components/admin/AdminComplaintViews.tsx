import Link from "next/link";
import { ChevronRight, Filter, Inbox } from "lucide-react";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_CATEGORY_LABELS,
  COMPLAINT_STATUSES,
  COMPLAINT_STATUS_LABELS,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";
import type { AdminComplaintRow } from "@/domains/admin/complaints";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { controlClassName } from "@/components/ui/Field";

type AdminComplaintFiltersProps = {
  departments: Array<{ id: string; name: string }>;
  current: {
    departmentId?: string;
    status?: string;
    category?: string;
    awaitingRouting?: boolean;
  };
};

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function categoryLabel(category: string | null) {
  if (!category) {
    return "—";
  }
  return COMPLAINT_CATEGORY_LABELS[category as ComplaintCategory] ?? category;
}

export function AdminComplaintFilters({
  departments,
  current,
}: AdminComplaintFiltersProps) {
  const hasFilters = Boolean(
    current.departmentId || current.status || current.category || current.awaitingRouting,
  );

  return (
    <form className="flex flex-wrap items-end gap-3" method="get">
      <div className="flex min-w-[12rem] flex-col gap-1">
        <label htmlFor="departmentId" className="text-label font-medium text-navy">
          Department
        </label>
        <select
          id="departmentId"
          name="departmentId"
          defaultValue={current.departmentId ?? ""}
          className={cn(controlClassName, "border-line")}
        >
          <option value="">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-w-[12rem] flex-col gap-1">
        <label htmlFor="status" className="text-label font-medium text-navy">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={current.status ?? ""}
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
      <div className="flex min-w-[12rem] flex-col gap-1">
        <label htmlFor="category" className="text-label font-medium text-navy">
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue={current.category ?? ""}
          className={cn(controlClassName, "border-line")}
        >
          <option value="">All categories</option>
          {COMPLAINT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {COMPLAINT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">
        <Filter className="h-4 w-4" aria-hidden />
        Apply filters
      </Button>
      {hasFilters ? (
        <Link
          href="/admin/complaints"
          className="inline-flex min-h-11 items-center text-small font-medium text-brand hover:underline"
        >
          Clear
        </Link>
      ) : null}
    </form>
  );
}

export function AdminComplaintTable({
  complaints,
}: {
  complaints: AdminComplaintRow[];
}) {
  if (complaints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-brand-50/30 px-6 py-12 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
          <Inbox className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-small font-semibold text-navy">No complaints match these filters</p>
        <p className="max-w-sm text-xs text-muted">
          Try another department, status, or category — or clear filters to see the full queue.
        </p>
      </div>
    );
  }

  return (
    <Table caption="Admin complaints">
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Routing</TableHead>
          <TableHead>Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {complaints.map((complaint) => (
          <TableRow key={complaint.id}>
            <TableCell className="whitespace-nowrap">
              <Link
                href={`/admin/complaints/${complaint.id}`}
                className="inline-flex items-center gap-1 font-mono text-small font-semibold text-brand hover:text-brand-dark"
              >
                {complaint.publicRef}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </TableCell>
            <TableCell className="text-navy">{categoryLabel(complaint.category)}</TableCell>
            <TableCell>
              {complaint.department?.name ? (
                <span className="text-navy">{complaint.department.name}</span>
              ) : (
                <span className="text-muted">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={complaint.status as ComplaintStatus} />
                {complaint.requiresManualReview ? (
                  <span className="text-xs font-medium text-warning">Needs review</span>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="text-muted">{complaint.routingStatus}</TableCell>
            <TableCell className="whitespace-nowrap text-muted">
              {formatSubmittedAt(complaint.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
