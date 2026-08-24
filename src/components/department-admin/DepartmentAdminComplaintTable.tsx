import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type { DepartmentAdminComplaintListItem } from "@/domains/complaints/constants";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
  type ComplaintStatus,
} from "@/domains/complaints/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function DepartmentAdminComplaintTable({
  complaints,
}: {
  complaints: DepartmentAdminComplaintListItem[];
}) {
  if (complaints.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-line px-4 py-8 text-center text-small text-muted">
        No complaints match the current filter.
      </p>
    );
  }

  return (
    <Table caption="Department complaints">
      <TableHeader>
        <TableRow>
          <TableHead>Photo</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead>Worker</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {complaints.map((complaint) => (
          <TableRow key={complaint.id}>
            <TableCell>
              <div className="relative h-12 w-16 overflow-hidden rounded-md border border-line bg-paper">
                <Image
                  src={complaint.imageUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            </TableCell>
            <TableCell>
              <Link
                href={`/department-admin/complaints/${complaint.id}`}
                className="font-mono font-medium text-brand hover:text-brand-dark"
              >
                {complaint.publicRef}
              </Link>
            </TableCell>
            <TableCell>
              {complaint.category
                ? COMPLAINT_CATEGORY_LABELS[complaint.category as ComplaintCategory]
                : "—"}
            </TableCell>
            <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
            <TableCell>
              <StatusBadge status={complaint.status as ComplaintStatus} />
            </TableCell>
            <TableCell>{formatDate(complaint.createdAt)}</TableCell>
            <TableCell>{complaint.assignedWorker?.name ?? "Unassigned"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
