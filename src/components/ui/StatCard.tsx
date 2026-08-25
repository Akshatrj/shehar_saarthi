import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  href,
  className,
}: StatCardProps) {
  const content = (
    <>
      <p className="text-small text-muted">{label}</p>
      <p className="mt-1 text-h2 text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {href ? (
        <p className="mt-2 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
          Open {label.toLowerCase()}
        </p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("group block", className)}>
        <Card
          className="ss-stat-card p-4 transition-colors group-hover:border-brand group-hover:bg-brand-50/40"
        >
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn("ss-stat-card p-4", className)}>
      {content}
    </Card>
  );
}
