"use client";

import { FormEvent, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDepartmentAction,
  updateDepartmentAction,
} from "@/app/admin/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { AdminDepartmentRow } from "@/domains/admin/departments";

export function CreateDepartmentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createDepartmentAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      event.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Input label="Name" name="name" required disabled={isPending} />
      <Input
        label="Code"
        name="code"
        hint="Lowercase letters, numbers, and hyphens only."
        required
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Creating…" : "Create department"}
      </Button>
    </form>
  );
}

export function EditDepartmentForm({
  department,
}: {
  department: AdminDepartmentRow;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(department.name);
  const [code, setCode] = useState(department.code);
  const [isActive, setIsActive] = useState(department.isActive);

  function onSubmit() {
    setError(null);
    const formData = new FormData();
    formData.set("name", name);
    formData.set("code", code);
    if (isActive) {
      formData.set("isActive", "on");
    }

    startTransition(async () => {
      const result = await updateDepartmentAction(department.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <Input
        label="Name"
        name="name"
        value={name}
        disabled={isPending}
        onChange={(event) => setName(event.target.value)}
      />
      <Input
        label="Code"
        name="code"
        value={code}
        disabled={isPending}
        onChange={(event) => setCode(event.target.value)}
      />
      <label className="inline-flex items-center gap-2 text-small text-ink">
        <input
          type="checkbox"
          checked={isActive}
          disabled={isPending}
          onChange={(event) => setIsActive(event.target.checked)}
        />
        Active department
      </label>
      <Button type="button" size="sm" disabled={isPending} onClick={onSubmit}>
        {isPending ? "Saving…" : "Save department"}
      </Button>
    </div>
  );
}
