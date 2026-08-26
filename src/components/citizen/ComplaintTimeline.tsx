import { Check } from "lucide-react";
import type { CitizenTimelineItem } from "@/domains/complaints/constants";
import { cn } from "@/lib/cn";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ComplaintTimeline({
  items,
}: {
  items: CitizenTimelineItem[];
}) {
  if (items.length === 0) {
    return <p className="text-small text-muted">No activity yet.</p>;
  }

  const currentIndex = items.length - 1;

  return (
    <ol className="relative flex flex-col gap-0" aria-label="Complaint progress">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isResolvedStep = /complaint closed/i.test(item.label);
        const isCurrent = index === currentIndex && !isResolvedStep;

        return (
          <li key={item.id} className="relative flex gap-4 pb-6">
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[0.6875rem] top-7 h-[calc(100%-0.75rem)] w-0.5",
                  isCurrent ? "bg-line" : "bg-brand/40",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                isCurrent
                  ? "border-orange bg-orange/10 text-orange"
                  : "border-brand bg-brand text-white",
              )}
              aria-hidden="true"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-medium",
                  isCurrent ? "text-brand-dark" : "text-navy",
                )}
              >
                {item.label}
                {isCurrent ? (
                  <span className="ml-2 text-small font-normal text-muted">
                    (current)
                  </span>
                ) : null}
              </p>
              {item.detail ? (
                <p className="mt-1 text-small text-ink">{item.detail}</p>
              ) : null}
              <p className="mt-1 text-small text-muted">
                {formatDate(item.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
