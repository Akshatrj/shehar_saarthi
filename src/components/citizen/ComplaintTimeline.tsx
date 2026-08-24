import type { CitizenTimelineItem } from "@/domains/complaints/constants";

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

  return (
    <ol className="relative flex flex-col gap-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-4 pb-6">
            {!isLast ? (
              <span
                aria-hidden="true"
                className="absolute left-[0.6875rem] top-6 h-[calc(100%-0.5rem)] w-px bg-line"
              />
            ) : null}
            <span
              aria-hidden="true"
              className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-brand bg-paper-raised"
            />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-navy">{item.label}</p>
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
