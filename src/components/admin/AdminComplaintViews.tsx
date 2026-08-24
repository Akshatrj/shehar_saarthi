import Link from "next/link";
import Image from "next/image";
import { COMPLAINT_CATEGORIES, COMPLAINT_CATEGORY_LABELS, COMPLAINT_STATUSES, COMPLAINT_STATUS_LABELS } from "@/domains/complaints/types";
import { cn } from "@/lib/cn";
import { controlClassName } from "@/components/ui/Field";

type AdminComplaintFiltersProps = {
  departments: Array<{ id: string; name: string }>;
  current: {
    departmentId?: string;
    status?: string;
    category?: string;
  };
};

export function AdminComplaintFilters({
  departments,
  current,
}: AdminComplaintFiltersProps) {
  return (
    <form className="flex flex-wrap items-end gap-3" method="get">
      <div className="flex min-w-[12rem] flex-col gap-1">
        <label htmlFor="departmentId" className="text-label font-medium text-green-950">
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
        <label htmlFor="status" className="text-label font-medium text-green-950">
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
        <label htmlFor="category" className="text-label font-medium text-green-950">
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
      <button
        type="submit"
        className="inline-flex min-h-11 items-center rounded-md bg-orange px-4 text-small font-medium text-white"
      >
        Apply filters
      </button>
      {current.departmentId || current.status || current.category ? (
        <Link href="/admin/complaints" className="text-small font-medium text-brand">
          Clear
        </Link>
      ) : null}
    </form>
  );
}

export function AdminComplaintTable({
  complaints,
}: {
  complaints: Array<{
    id: string;
    publicRef: string;
    description: string;
    imageUrl: string;
    category: string | null;
    status: string;
    createdAt: string;
    department: { name: string } | null;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-paper-raised">
      <table className="w-full min-w-[48rem] text-left text-small">
        <thead className="bg-green-50 text-green-950">
          <tr>
            <th className="px-4 py-3">Photo</th>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {complaints.map((complaint) => (
            <tr key={complaint.id} className="hover:bg-green-50/60">
              <td className="px-4 py-3">
                <div className="relative h-12 w-16 overflow-hidden rounded-md border border-line">
                  <Image src={complaint.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                </div>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/complaints/${complaint.id}`}
                  className="font-mono font-medium text-brand"
                >
                  {complaint.publicRef}
                </Link>
              </td>
              <td className="px-4 py-3">{complaint.category ?? "—"}</td>
              <td className="px-4 py-3">{complaint.department?.name ?? "—"}</td>
              <td className="px-4 py-3">{complaint.status}</td>
              <td className="px-4 py-3">
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(complaint.createdAt))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
