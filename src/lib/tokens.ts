import type { ComplaintStatus } from "@/domains/complaints/types";

export const statusBadgeClass: Record<ComplaintStatus, string> = {
  SUBMITTED:
    "bg-status-submitted-bg text-status-submitted-fg border-status-submitted-border",
  ROUTED:
    "bg-status-assigned-bg text-status-assigned-fg border-status-assigned-border",
  ASSIGNED:
    "bg-status-assigned-bg text-status-assigned-fg border-status-assigned-border",
  IN_PROGRESS:
    "bg-status-in-progress-bg text-status-in-progress-fg border-status-in-progress-border",
  COMPLETED:
    "bg-status-resolved-bg text-status-resolved-fg border-status-resolved-border",
  CLOSED:
    "bg-status-closed-bg text-status-closed-fg border-status-closed-border",
};

export const colorSwatches = [
  { name: "Paper", className: "bg-paper border-line" },
  { name: "Raised", className: "bg-paper-raised border-line" },
  { name: "Navy", className: "bg-navy" },
  { name: "Brand", className: "bg-brand" },
  { name: "Brand light", className: "bg-brand-light" },
  { name: "Orange", className: "bg-orange" },
  { name: "Accent", className: "bg-accent" },
  { name: "Success", className: "bg-success" },
  { name: "Warning", className: "bg-warning" },
  { name: "Danger", className: "bg-danger" },
] as const;
