import type { ComplaintHistoryItem } from "@/domains/complaints/constants";
import { COMPLAINT_STATUS_LABELS, type ComplaintStatus } from "@/domains/complaints/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ComplaintHistoryList({
  history,
}: {
  history: ComplaintHistoryItem[];
}) {
  if (history.length === 0) {
    return (
      <p className="text-small text-muted">No history entries yet.</p>
    );
  }

  return (
    <ol className="flex flex-col gap-4">
      {history.map((entry) => (
        <li key={entry.id} className="border-l-2 border-line pl-4">
          <p className="text-small font-medium text-navy">
            {entry.action.replaceAll("_", " ")}
          </p>
          <p className="text-small text-muted">
            {entry.oldStatus
              ? `${COMPLAINT_STATUS_LABELS[entry.oldStatus as ComplaintStatus]} → ${COMPLAINT_STATUS_LABELS[entry.newStatus as ComplaintStatus]}`
              : COMPLAINT_STATUS_LABELS[entry.newStatus as ComplaintStatus]}
          </p>
          {entry.actor ? (
            <p className="text-small text-muted">By {entry.actor.name}</p>
          ) : null}
          <p className="text-small text-muted">{formatDate(entry.createdAt)}</p>
        </li>
      ))}
    </ol>
  );
}
