import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Field, controlClassName } from "@/components/ui/Field";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, className, id, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      {({ id: fieldId, describedBy, invalid }) => (
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className={cn(
            controlClassName,
            invalid ? "border-danger" : "border-line",
            className,
          )}
          {...props}
        />
      )}
    </Field>
  );
});
