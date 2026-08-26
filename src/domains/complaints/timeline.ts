export type CitizenTimelineItem = {
  id: string;
  label: string;
  detail?: string;
  createdAt: string;
};

type HistoryEntry = {
  id: string;
  action: string;
  oldStatus: string | null;
  newStatus: string;
  metadata: string | null;
  createdAt: string;
};

const LABELS = {
  submitted: "Complaint submitted",
  verified: "Complaint verified",
  inProgress: "In progress with department",
  workerAssigned: "Worker assigned",
  workerReady: "Worker is ready for job",
  closed: "Complaint closed",
  reopened: "Reopened",
} as const;

function parseReopenReason(metadata: string | null) {
  if (!metadata) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(metadata) as { reason?: unknown };
    if (typeof parsed.reason === "string" && parsed.reason.trim()) {
      return parsed.reason.trim();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function isRoutedStatus(newStatus: string) {
  return newStatus === "ROUTED";
}

function isAssignedStatus(newStatus: string) {
  return newStatus === "ASSIGNED";
}

export function buildCitizenTimeline(input: {
  history: HistoryEntry[];
  aiCategory: string | null;
  aiDescription: string | null;
}): CitizenTimelineItem[] {
  const lastReopenIndex = input.history.reduce(
    (last, entry, index) =>
      entry.action === "REOPENED_BY_CITIZEN" ? index : last,
    -1,
  );
  const segment =
    lastReopenIndex >= 0
      ? input.history.slice(lastReopenIndex)
      : input.history;

  const items: CitizenTimelineItem[] = [];
  const seen = new Set<string>();

  const push = (
    label: string,
    entry: HistoryEntry,
    detail?: string,
    id?: string,
  ) => {
    if (seen.has(label)) {
      return;
    }
    seen.add(label);
    items.push({
      id: id ?? entry.id,
      label,
      detail,
      createdAt: entry.createdAt,
    });
  };

  for (const entry of segment) {
    const { action, newStatus } = entry;

    if (action === "SUBMITTED") {
      push(LABELS.submitted, entry);
      continue;
    }

    if (action === "REOPENED_BY_CITIZEN") {
      push(LABELS.reopened, entry, parseReopenReason(entry.metadata));
      if (isRoutedStatus(newStatus)) {
        push(LABELS.inProgress, entry, undefined, `${entry.id}-dept`);
      } else if (isAssignedStatus(newStatus)) {
        push(LABELS.workerAssigned, entry, undefined, `${entry.id}-assigned`);
      }
      continue;
    }

    if (
      action === "AI_CLASSIFIED" ||
      action === "CATEGORY_CONFIRMED" ||
      action === "CATEGORY_CHANGED" ||
      action === "ADMIN_OVERRIDE"
    ) {
      push(LABELS.verified, entry);
    }

    if (action === "AUTO_ROUTED" || action === "MANUALLY_ROUTED") {
      push(LABELS.verified, entry, undefined, `${entry.id}-verified`);
      if (isRoutedStatus(newStatus)) {
        push(LABELS.inProgress, entry, undefined, `${entry.id}-dept`);
      }
      continue;
    }

    if (
      (action === "CATEGORY_CONFIRMED" || action === "CATEGORY_CHANGED") &&
      isRoutedStatus(newStatus)
    ) {
      push(LABELS.inProgress, entry, undefined, `${entry.id}-dept`);
      continue;
    }

    if (
      action === "ASSIGNED_TO_WORKER" ||
      action === "ASSIGNED_TO_SELF" ||
      action === "REASSIGNED_TO_WORKER"
    ) {
      push(LABELS.workerAssigned, entry);
      continue;
    }

    if (action === "STARTED_PROGRESS") {
      push(LABELS.workerReady, entry);
      continue;
    }

    if (action === "MARKED_COMPLETED" || action === "CLOSED") {
      push(LABELS.closed, entry);
    }
  }

  return items;
}
