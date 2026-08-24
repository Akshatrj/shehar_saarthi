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
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
};

function parseRoutingNote(note: string | null): CategoryRoutingMetadata | null {
  if (!note) {
    return null;
  }
  try {
    return JSON.parse(note) as CategoryRoutingMetadata;
  } catch {
    return null;
  }
}

function departmentLabel(slug: string | undefined) {
  if (!slug) {
    return null;
  }
  return DEPARTMENT_NAMES[slug as DepartmentSlug] ?? slug;
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
      const routing = parseRoutingNote(entry.note);
      items.push({
        id: `${entry.id}-category`,
        label:
          entry.action === "CATEGORY_CONFIRMED"
            ? "Category confirmed"
            : "Category changed",
        detail: categoryLabel(routing?.category),
        createdAt: entry.createdAt,
      });

      if (entry.toStatus === "ROUTED") {
        items.push({
          id: `${entry.id}-routed`,
          label: `Routed to ${departmentLabel(routing?.departmentSlug) ?? "department"}`,
          createdAt: entry.createdAt,
        });
      }
      continue;
    }

    if (entry.action === "ASSIGNED_TO_SELF") {
      items.push({
        id: entry.id,
        label: "Assigned to staff",
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
