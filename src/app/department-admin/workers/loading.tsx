import { ListPageSkeleton } from "@/components/dashboard/ListPageSkeleton";

export default function DepartmentAdminWorkersLoading() {
  return (
    <ListPageSkeleton
      eyebrow="Department admin"
      title="Workers"
      description="Add and manage field workers for your department."
    />
  );
}
