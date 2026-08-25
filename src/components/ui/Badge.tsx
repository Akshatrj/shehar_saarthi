import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const tones = {
  green: "border-green-200 bg-green-100 text-green-900",
  blue: "border-blue-200 bg-blue-100 text-blue-900",
  stone: "border-line bg-status-submitted-bg text-status-submitted-fg",
  red: "border-danger-border bg-danger-bg text-danger",
  warning: "border-warning-border bg-warning-bg text-warning",
  success: "border-success-border bg-success-bg text-success",
  critical:
    "border-priority-critical-border bg-priority-critical-bg text-priority-critical-fg",
  high: "border-priority-high-border bg-priority-high-bg text-priority-high-fg",
  medium:
    "border-priority-medium-border bg-priority-medium-bg text-priority-medium-fg",
  low: "border-priority-low-border bg-priority-low-bg text-priority-low-fg",
} as const;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof tones;
};

export function Badge({ className, tone = "green", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
