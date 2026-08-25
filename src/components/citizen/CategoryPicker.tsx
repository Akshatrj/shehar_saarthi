"use client";

import { COMPLAINT_CATEGORY_CATALOG } from "@/content/complaint-category-catalog";
import type { ComplaintCategory } from "@/domains/complaints/types";
import { Field } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

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
  return (
    <Field
      label="What type of problem are you reporting?"
      hint="Choose the closest match. You do not need to know which department handles it."
      error={categoryError}
    >
      {({ describedBy, invalid }) => (
        <div
          role="radiogroup"
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className="flex flex-col gap-5"
        >
          {COMPLAINT_CATEGORY_CATALOG.map((group) => (
            <div key={group.id}>
              <h3 className="text-small font-semibold uppercase tracking-wide text-muted">
                {group.title}
              </h3>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {group.categories.map((item) => {
                  const selected = selectedCategory === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      disabled={disabled}
                      onClick={() => onCategoryChange(item.value)}
                      className={cn(
                        "rounded-lg border px-4 py-3 text-left transition-colors",
                        selected
                          ? "border-brand bg-brand-50 ring-2 ring-brand/20"
                          : "border-line bg-paper-raised hover:border-brand-200",
                        disabled && "pointer-events-none opacity-60",
                      )}
                    >
                      <span className="text-body font-medium text-navy">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-small text-muted">
                        {item.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Field>
  );
}
