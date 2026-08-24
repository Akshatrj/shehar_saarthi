import type { ComplaintStatus } from "@/domains/complaints/types";

export class ComplaintTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ComplaintTransitionError";
  }
}

const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  SUBMITTED: ["ROUTED"],
  ROUTED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: ["CLOSED"],
  CLOSED: [],
};

export function assertValidTransition(
  from: ComplaintStatus,
  to: ComplaintStatus,
) {
  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new ComplaintTransitionError(
      `Invalid status transition from ${from} to ${to}.`,
    );
  }
}

export function canTransition(from: ComplaintStatus, to: ComplaintStatus) {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
