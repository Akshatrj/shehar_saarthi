import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

const DOTS = Array.from({ length: 8 }, (_, index) => index);

export function Spinner({
  className,
  label = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn("inline-flex items-center gap-3 text-navy", className)}
      {...props}
    >
      <span className="ss-dot-spinner" aria-hidden="true">
        {DOTS.map((dot) => (
          <span key={dot} className="ss-dot-spinner__dot" />
        ))}
      </span>
      <span className="text-small">{label}</span>
    </div>
  );
}
