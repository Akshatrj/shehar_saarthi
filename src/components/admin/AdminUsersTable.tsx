"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { UserEditForm } from "@/components/admin/UserEditForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import type { AdminUserRow } from "@/domains/admin/users";
import { roleLabel } from "@/lib/rbac";

type AdminUsersTableProps = {
  users: AdminUserRow[];
  departments: Array<{ id: string; name: string; code: string }>;
  currentUserId: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminUsersTable({
  users: initialUsers,
  departments,
  currentUserId,
}: AdminUsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  function handleUserDeleted(userId: string) {
    setUsers((current) => current.filter((user) => user.id !== userId));
    setDeleteSuccess("User deleted successfully.");
  }

  return (
    <div className="flex flex-col gap-4">
      {deleteSuccess ? (
        <Alert variant="success" live="polite">
          {deleteSuccess}
        </Alert>
      ) : null}

      <Table caption="Platform users">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{roleLabel(user.role)}</TableCell>
              <TableCell>{user.department?.name ?? "—"}</TableCell>
              <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell className="min-w-[16rem]">
                <UserEditForm
                  user={user}
                  departments={departments}
                  currentUserId={currentUserId}
                  onDeleted={handleUserDeleted}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
