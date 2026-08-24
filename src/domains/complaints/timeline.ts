import type { CategoryRoutingMetadata } from "@/domains/complaints/constants";
import { DEPARTMENT_NAMES, type DepartmentSlug } from "@/domains/complaints/categories";
import {
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from "@/domains/complaints/types";

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

function parseRoutingMetadata(
  metadata: string | null,
): CategoryRoutingMetadata | null {
  if (!metadata) {
    return null;
  }
  try {
    return JSON.parse(metadata) as CategoryRoutingMetadata;
  } catch {
    return null;
  }
}

function departmentLabel(code: string | undefined) {
  if (!code) {
    return null;
  }
  return DEPARTMENT_NAMES[code as DepartmentSlug] ?? code;
}

function categoryLabel(category: string | undefined) {
  if (!category) {
    return undefined;
  }
  if (category in COMPLAINT_CATEGORY_LABELS) {
    return COMPLAINT_CATEGORY_LABELS[category as ComplaintCategory];
  }
  return category;
}

export function buildCitizenTimeline(input: {
  history: HistoryEntry[];
  aiCategory: string | null;
  aiDescription: string | null;
}): CitizenTimelineItem[] {
  const items: CitizenTimelineItem[] = [];

  for (const entry of input.history) {
    if (entry.action === "SUBMITTED") {
      items.push({
        id: entry.id,
        label: "Complaint submitted",
        createdAt: entry.createdAt,
      });

      if (input.aiCategory) {
        items.push({
          id: `${entry.id}-ai`,
          label: "AI category suggested",
          detail: categoryLabel(input.aiCategory),
          createdAt: entry.createdAt,
        });
      }
      continue;
    }

    if (
      entry.action === "CATEGORY_CONFIRMED" ||
      entry.action === "CATEGORY_CHANGED"
    ) {
      const routing = parseRoutingMetadata(entry.metadata);
      items.push({
        id: `${entry.id}-category`,
        label:
          entry.action === "CATEGORY_CONFIRMED"
            ? "Category confirmed"
            : "Category changed",
        detail: categoryLabel(routing?.category),
        createdAt: entry.createdAt,
      });

      if (entry.newStatus === "ROUTED") {
        const deptCode = routing?.departmentCode;
        items.push({
          id: `${entry.id}-routed`,
          label: `Routed to ${departmentLabel(deptCode) ?? "department"}`,
          createdAt: entry.createdAt,
        });
      }
      continue;
    }

    if (
      entry.action === "ASSIGNED_TO_SELF" ||
      entry.action === "ASSIGNED_TO_WORKER"
    ) {
      items.push({
        id: entry.id,
        label: "Assigned to worker",
        createdAt: entry.createdAt,
      });
      continue;
    }

    if (entry.action === "STARTED_PROGRESS") {
      items.push({
        id: entry.id,
        label: "Work started",
        createdAt: entry.createdAt,
      });
      continue;
    }

    if (entry.action === "MARKED_COMPLETED") {
      items.push({
        id: entry.id,
        label: "Completed",
        createdAt: entry.createdAt,
      });
      continue;
    }

    if (entry.action === "CLOSED") {
      items.push({
        id: entry.id,
        label: "Closed",
        createdAt: entry.createdAt,
      });
      continue;
    }

    if (entry.action === "ADMIN_OVERRIDE") {
      items.push({
        id: entry.id,
        label: "Administrative correction",
        createdAt: entry.createdAt,
      });
      continue;
    }

    items.push({
      id: entry.id,
      label: entry.action
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      createdAt: entry.createdAt,
    });
  }

  if (input.aiCategory && !input.history.some((entry) => entry.action === "SUBMITTED")) {
    items.unshift({
      id: "ai-suggestion",
      label: "AI category suggested",
      detail: categoryLabel(input.aiCategory),
      createdAt: input.history[0]?.createdAt ?? new Date().toISOString(),
    });
  }

  return items;
}
