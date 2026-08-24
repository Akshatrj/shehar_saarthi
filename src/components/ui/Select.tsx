import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Field, controlClassName } from "@/components/ui/Field";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: SelectOption[];
  hint?: string;
  error?: string;
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, hint, error, placeholder, className, id, ...props },
  ref,
) {
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      {({ id: fieldId, describedBy, invalid }) => (
        <select
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
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
});
