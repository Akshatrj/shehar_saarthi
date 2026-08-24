import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import { Field, controlClassName } from "@/components/ui/Field";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, error, className, id, rows = 4, ...props }, ref) {
    return (
      <Field label={label} hint={hint} error={error} htmlFor={id}>
        {({ id: fieldId, describedBy, invalid }) => (
          <textarea
            ref={ref}
            id={fieldId}
            rows={rows}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={cn(
              controlClassName,
              "min-h-24 py-2",
              invalid ? "border-danger" : "border-line",
              className,
            )}
            {...props}
          />
        )}
      </Field>
    );
  },
);
