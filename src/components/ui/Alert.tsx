import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  info: "border-info-border bg-info-bg text-info",
  success: "border-success-border bg-success-bg text-success",
  warning: "border-warning-border bg-warning-bg text-warning",
  danger: "border-danger-border bg-danger-bg text-danger",
} as const;

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title?: string;
  variant?: keyof typeof variants;
  live?: "polite" | "assertive";
};

export function Alert({
  title,
  variant = "info",
  live = "polite",
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role={live === "assertive" ? "alert" : "status"}
      className={cn(
        "rounded-md border-l-[3px] border px-4 py-3 text-small",
        variants[variant],
        className,
      )}
      {...props}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      <div className={title ? "mt-1" : undefined}>{children}</div>
    </div>
  );
}
