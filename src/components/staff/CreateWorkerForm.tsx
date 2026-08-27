"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export type CreateWorkerActionResult =
  | { ok: true }
  | { ok: false; error: string };

type CreateWorkerFormProps = {
  action: (formData: FormData) => Promise<CreateWorkerActionResult>;
  departments?: Array<{ id: string; name: string }>;
  lockedDepartmentName?: string;
};

export function CreateWorkerForm({
  action,
  departments,
  lockedDepartmentName,
}: CreateWorkerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const chooseDepartment = departments !== undefined;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      setSuccess("Worker added. They can sign in with this email and password.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-3">
      {error ? (
        <Alert variant="danger" live="assertive">
          {error}
        </Alert>
      ) : null}
      {success ? <Alert variant="success">{success}</Alert> : null}
      <Input label="Full name" name="name" autoComplete="name" required disabled={isPending} />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="off"
        required
        disabled={isPending}
      />
      {chooseDepartment ? (
        <Select
          label="Department"
          name="departmentId"
          required
          disabled={isPending || !departments?.length}
          placeholder="Choose department"
          options={(departments ?? []).map((department) => ({
            value: department.id,
            label: department.name,
          }))}
        />
      ) : null}
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        required
        disabled={isPending}
      />
      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        maxLength={72}
        required
        disabled={isPending}
      />
      <p className="text-small text-muted">
        {lockedDepartmentName
          ? `This worker is added to ${lockedDepartmentName} only. They sign in at Staff login, then open the worker desk.`
          : "The worker can only see and work complaints routed to the chosen department. They sign in at Staff login, then open the worker desk."}
      </p>
      <Button type="submit" size="sm" disabled={isPending || (chooseDepartment && !departments?.length)}>
        {isPending ? "Adding worker…" : "Add worker"}
      </Button>
    </form>
  );
}
