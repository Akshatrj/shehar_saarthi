import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export function Spinner({
  className,
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn("inline-flex items-center gap-2 text-green-800", className)}
      {...props}
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-green-200 border-t-green-800"
        aria-hidden="true"
      />
      <span className="text-small">{label}</span>
    </div>
  );
}
