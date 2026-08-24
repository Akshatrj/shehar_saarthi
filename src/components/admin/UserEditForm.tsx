"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserAction } from "@/app/admin/actions";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { USER_ROLES, type UserRole } from "@/domains/auth/types";
import type { AdminUserRow } from "@/domains/admin/users";
import { roleLabel } from "@/lib/rbac";

type UserEditFormProps = {
  user: AdminUserRow;
  departments: Array<{ id: string; name: string; code: string }>;
};

const roleOptions = USER_ROLES.map((role) => ({
  value: role,
  label: roleLabel(role),
}));

export function UserEditForm({ user, departments }: UserEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(user.role);
  const [departmentId, setDepartmentId] = useState(user.department?.id ?? "");
  const [isActive, setIsActive] = useState(user.isActive);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  return (
    <div className="flex flex-col gap-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {success ? <Alert variant="success">User updated.</Alert> : null}
      <Select
        label="Role"
        value={role}
        disabled={isPending}
        options={roleOptions}
        onChange={(event) => setRole(event.target.value as UserRole)}
      />
      {role === "WORKER" || role === "DEPARTMENT_ADMIN" ? (
        <Select
          label="Department"
          value={departmentId}
          disabled={isPending}
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
          disabled={isPending}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Active account
      </label>
      <Button type="button" size="sm" disabled={isPending} onClick={onSubmit}>
        {isPending ? "Saving…" : "Save user"}
      </Button>
    </div>
  );
}
