import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  heading?: "h1" | "h2";
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  heading = "h1",
}: PageHeaderProps) {
  const Heading = heading;
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-small font-medium text-brand">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="mt-1 break-words text-[1.5rem] leading-tight text-navy sm:text-h1">
          {title}
        </Heading>
        {description ? (
          <p className="mt-1 max-w-prose text-small text-muted sm:text-body">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
      ) : null}
    </header>
  );
}

export function SectionHeading({
  id,
  title,
  description,
  action,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <h2 id={id} className="text-h3 text-navy">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-prose text-small text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
