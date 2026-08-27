import { ListPageSkeleton } from "@/components/dashboard/ListPageSkeleton";

export default function AdminUsersLoading() {
  return (
    <ListPageSkeleton
      eyebrow="Super Admin"
      title="Users"
      description="Change roles, departments, and account status."
    />
  );
}
