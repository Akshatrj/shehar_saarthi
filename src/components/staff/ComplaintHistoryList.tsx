import type { StaffComplaintHistoryItem } from "@/domains/complaints/constants";
import { COMPLAINT_STATUS_LABELS, type ComplaintStatus } from "@/domains/complaints/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ComplaintHistoryList({
  history,
}: {
  history: StaffComplaintHistoryItem[];
}) {
  if (history.length === 0) {
    return <p className="text-small text-muted">No history yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {history.map((entry) => (
        <li
          key={entry.id}
          className="rounded-md border border-line bg-paper px-4 py-3 text-small"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-navy">{formatAction(entry.action)}</p>
            <p className="text-muted">{formatDate(entry.createdAt)}</p>
          </div>
          <p className="mt-1 text-muted">
            {entry.fromStatus
              ? `${COMPLAINT_STATUS_LABELS[entry.fromStatus as ComplaintStatus]} → ${COMPLAINT_STATUS_LABELS[entry.toStatus as ComplaintStatus]}`
              : COMPLAINT_STATUS_LABELS[entry.toStatus as ComplaintStatus]}
          </p>
          {entry.actor ? (
            <p className="mt-1 text-muted">By {entry.actor.name}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
