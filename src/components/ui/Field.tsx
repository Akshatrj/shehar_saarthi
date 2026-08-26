import { ReactNode, useId } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: (ids: {
    id: string;
    describedBy?: string;
    invalid: boolean;
  }) => ReactNode;
};

export function RequiredMark() {
  return (
    <>
      <span className="ml-0.5 text-danger" aria-hidden="true">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </>
  );
}

export function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
}: FieldProps) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="text-label font-medium text-green-950">
        {label}
        {required ? <RequiredMark /> : null}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error ? (
        <p id={hintId} className="text-small text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-small text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const controlClassName =
  "min-h-11 w-full rounded-md border bg-paper-raised px-3 text-body text-ink shadow-sm outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-green-700 focus:ring-2 focus:ring-green-700/20";
