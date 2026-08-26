"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ChevronLeft,
  Construction,
  Droplets,
  Lightbulb,
  Trash2,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { ChoiceTile } from "@/components/ui/ChoiceTile";
import { RequiredMark } from "@/components/ui/Field";
import {
  COMPLAINT_CATEGORY_CATALOG,
  catalogGroupForCategory,
} from "@/content/complaint-category-catalog";
import type { ComplaintCategory } from "@/domains/complaints/types";

const GROUP_ICONS: Record<string, LucideIcon> = {
  roads: Construction,
  lighting: Lightbulb,
  sanitation: Trash2,
  water: Droplets,
  drainage: Waves,
  other: Building2,
};

type CategoryPickerProps = {
  selectedCategory: ComplaintCategory | null;
  disabled?: boolean;
  categoryError?: string;
  onCategoryChange: (category: ComplaintCategory) => void;
};

export function CategoryPicker({
  selectedCategory,
  disabled = false,
  categoryError,
  onCategoryChange,
}: CategoryPickerProps) {
  const selectedGroup = catalogGroupForCategory(selectedCategory);
  const [groupId, setGroupId] = useState<string | null>(selectedGroup?.id ?? null);

  const activeGroup = useMemo(
    () => COMPLAINT_CATEGORY_CATALOG.find((group) => group.id === groupId) ?? null,
    [groupId],
  );

  return (
    <div className="flex flex-col gap-4">
      {categoryError ? (
        <p className="text-small text-danger" role="alert">
          {categoryError}
        </p>
      ) : null}

      {activeGroup ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setGroupId(null)}
            className="inline-flex items-center gap-1 self-start rounded-md px-1 py-1 text-small font-medium text-brand-dark hover:bg-brand-50 hover:underline disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            All categories
          </button>
          <div>
            <h3 className="text-body font-semibold text-navy">
              {activeGroup.title}
              <RequiredMark />
            </h3>
            <p className="mt-1 text-small text-muted">
              Choose the closest match. You do not need to know which department
              handles it.
            </p>
          </div>
          <div role="radiogroup" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {activeGroup.categories.map((item) => {
              const selected = selectedCategory === item.value;
              return (
                <ChoiceTile
                  key={item.value}
                  selected={selected}
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  onClick={() => onCategoryChange(item.value)}
                >
                  <span>
                    <span className="ss-choice-tile__title">{item.label}</span>
                    <span className="ss-choice-tile__muted">{item.description}</span>
                  </span>
                </ChoiceTile>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-body font-semibold text-navy">
              What type of problem are you reporting?
              <RequiredMark />
            </h3>
            <p className="mt-1 text-small text-muted">
              Start with a category, then pick a specific issue.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {COMPLAINT_CATEGORY_CATALOG.map((group) => {
              const Icon = GROUP_ICONS[group.id] ?? Building2;
              const issueCountLabel = `${group.categories.length} issue types`;
              return (
                <ChoiceTile
                  key={group.id}
                  disabled={disabled}
                  onClick={() => setGroupId(group.id)}
                >
                  <span className="ss-choice-tile__icon">
                    <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="ss-choice-tile__title">{group.title}</span>
                    <span className="ss-choice-tile__muted">{issueCountLabel}</span>
                  </span>
                </ChoiceTile>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
