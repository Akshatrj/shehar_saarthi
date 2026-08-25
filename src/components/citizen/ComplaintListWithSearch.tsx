"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ComplaintList } from "@/components/citizen/ComplaintList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import type { CitizenComplaintSummary } from "@/domains/complaints/constants";
import { controlClassName } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export function ComplaintListWithSearch({
  complaints,
}: {
  complaints: CitizenComplaintSummary[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return complaints;
    }
    return complaints.filter(
      (complaint) =>
        complaint.publicRef.toLowerCase().includes(normalized) ||
        complaint.description.toLowerCase().includes(normalized),
    );
  }, [complaints, query]);

  return (
    <div className="flex flex-col gap-4">
      <label className="block">
        <span className="sr-only">Search by complaint ID or description</span>
        <span className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by complaint ID or description…"
            className={cn(controlClassName, "border-line py-2 pl-10")}
          />
        </span>
      </label>

      {filtered.length === 0 && complaints.length > 0 ? (
        <EmptyState
          title="No matching complaints"
          description="Try a different complaint ID or keyword from the description."
          action={
            <ButtonLink href="/citizen/report" size="sm">
              Report an issue
            </ButtonLink>
          }
        />
      ) : (
        <ComplaintList complaints={filtered} />
      )}
    </div>
  );
}
