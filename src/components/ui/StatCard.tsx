import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export type StatTone =
  | "default"
  | "brand"
  | "warning"
  | "success"
  | "danger"
  | "critical"
  | "high"
  | "medium"
  | "low";

type StatCardProps = {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  className?: string;
};

const toneStyles: Record<
  StatTone,
  { icon: string; label: string; card: string; hover: string }
> = {
  default: {
    icon: "bg-brand-50 text-brand",
    label: "text-muted",
    card: "",
    hover: "group-hover:border-brand group-hover:bg-brand-50/40",
  },
  brand: {
    icon: "bg-navy/5 text-navy",
    label: "text-muted",
    card: "",
    hover: "group-hover:border-navy/30 group-hover:bg-navy/5",
  },
  warning: {
    icon: "bg-warning-bg text-warning",
    label: "text-warning",
    card: "",
    hover: "group-hover:border-warning-border group-hover:bg-warning-bg/50",
  },
  success: {
    icon: "bg-success-bg text-success",
    label: "text-success",
    card: "",
    hover: "group-hover:border-success-border group-hover:bg-success-bg/50",
  },
  danger: {
    icon: "bg-danger-bg text-danger",
    label: "text-danger",
    card: "",
    hover: "group-hover:border-danger-border group-hover:bg-danger-bg/50",
  },
  critical: {
    icon: "bg-priority-critical-bg text-priority-critical-fg",
    label: "text-priority-critical-fg",
    card: "border-l-[3px] border-l-priority-critical-fg",
    hover: "group-hover:bg-priority-critical-bg/40",
  },
  high: {
    icon: "bg-priority-high-bg text-priority-high-fg",
    label: "text-priority-high-fg",
    card: "border-l-[3px] border-l-priority-high-fg",
    hover: "group-hover:bg-priority-high-bg/40",
  },
  medium: {
    icon: "bg-priority-medium-bg text-priority-medium-fg",
    label: "text-priority-medium-fg",
    card: "border-l-[3px] border-l-priority-medium-fg",
    hover: "group-hover:bg-priority-medium-bg/40",
  },
  low: {
    icon: "bg-priority-low-bg text-priority-low-fg",
    label: "text-priority-low-fg",
    card: "border-l-[3px] border-l-priority-low-fg",
    hover: "group-hover:bg-priority-low-bg/40",
  },
};

export function StatCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  tone = "default",
  className,
}: StatCardProps) {
  const styles = toneStyles[tone];

  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p
          className={cn(
            "flex items-center gap-0.5 text-xs font-semibold uppercase tracking-wider",
            styles.label,
          )}
        >
          <span className="truncate">{label}</span>
          {href ? (
            <ChevronRight
              className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          ) : null}
        </p>
        <p className="mt-1.5 text-[1.65rem] font-semibold leading-none tabular-nums text-navy">
          {value}
        </p>
        {hint ? (
          <p className="mt-2 text-xs leading-snug text-muted">{hint}</p>
        ) : null}
      </div>
      {Icon ? (
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            styles.icon,
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      ) : null}
    </div>
  );

  const cardClassName = cn(
    "ss-stat-card rounded-lg p-4 sm:p-5",
    styles.card,
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`View ${label.toLowerCase()}`}
        className="group block h-full"
      >
        <Card className={cn(cardClassName, "h-full", styles.hover)}>
          {content}
        </Card>
      </Link>
    );
  }

  return <Card className={cardClassName}>{content}</Card>;
}
