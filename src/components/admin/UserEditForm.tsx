"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUserAction, updateUserAction } from "@/app/admin/users/actions";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { USER_ROLES, type UserRole } from "@/domains/auth/types";
import type { AdminUserRow } from "@/domains/admin/users";
import { roleLabel } from "@/lib/rbac";

type UserEditFormProps = {
  user: AdminUserRow;
  departments: Array<{ id: string; name: string; code: string }>;
  currentUserId: string;
  onDeleted?: (userId: string) => void;
};

const roleOptions = USER_ROLES.map((role) => ({
  value: role,
  label: roleLabel(role),
}));

export function UserEditForm({
  user,
  departments,
  currentUserId,
  onDeleted,
}: UserEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(user.role);
  const [departmentId, setDepartmentId] = useState(user.department?.id ?? "");
  const [isActive, setIsActive] = useState(user.isActive);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isSelf = user.id === currentUserId;
  const controlsDisabled = isPending || isDeletePending;

  function onSubmit() {
    setError(null);
    setSuccess(false);
    const formData = new FormData();
    formData.set("role", role);
    formData.set("departmentId", departmentId);
    if (isActive) {
      formData.set("isActive", "on");
    }

    startTransition(async () => {
      const result = await updateUserAction(user.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  function openDeleteDialog() {
    setDeleteError(null);
    setDeleteDialogOpen(true);
  }

  function closeDeleteDialog() {
    if (isDeletePending) {
      return;
    }
    setDeleteDialogOpen(false);
    setDeleteError(null);
  }

  function onConfirmDelete() {
    setDeleteError(null);

    startDeleteTransition(async () => {
      const result = await deleteUserAction(user.id);
      if (!result.ok) {
        setDeleteError(result.error);
        return;
      }

      setDeleteDialogOpen(false);
      onDeleted?.(user.id);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {error ? <Alert variant="danger">{error}</Alert> : null}
        {success ? <Alert variant="success">User updated.</Alert> : null}
        <Select
          label="Role"
          value={role}
          disabled={controlsDisabled}
          options={roleOptions}
          onChange={(event) => setRole(event.target.value as UserRole)}
        />
        {role === "WORKER" || role === "DEPARTMENT_ADMIN" ? (
          <Select
            label="Department"
            value={departmentId}
            disabled={controlsDisabled}
            placeholder="Choose department"
            options={departments.map((department) => ({
              value: department.id,
              label: department.name,
            }))}
            onChange={(event) => setDepartmentId(event.target.value)}
          />
        ) : null}
        <label className="inline-flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            checked={isActive}
            disabled={controlsDisabled}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active account
        </label>
        <Button
          type="button"
          size="sm"
          className="w-full"
          disabled={controlsDisabled}
          onClick={onSubmit}
        >
          {isPending ? "Saving…" : "Save user"}
        </Button>
        {!isSelf ? (
          <Button
            type="button"
            variant="dangerSoft"
            size="sm"
            className="w-full"
            disabled={controlsDisabled}
            onClick={openDeleteDialog}
          >
            Delete user
          </Button>
        ) : null}
      </div>

      <Modal
        open={deleteDialogOpen}
        title="Delete this user?"
        onClose={closeDeleteDialog}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDeletePending}
              onClick={closeDeleteDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="dangerSoft"
              size="sm"
              className="w-auto min-w-[7.5rem]"
              disabled={isDeletePending}
              onClick={onConfirmDelete}
            >
              {isDeletePending ? "Deleting…" : "Delete user"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="font-medium text-navy">{user.name}</span>? This
            action cannot be undone.
          </p>
          {deleteError ? <Alert variant="danger">{deleteError}</Alert> : null}
        </div>
      </Modal>
    </>
  );
}
