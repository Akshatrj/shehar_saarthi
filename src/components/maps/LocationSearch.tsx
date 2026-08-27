"use client";

import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { controlClassName } from "@/components/ui/Field";

type NominatimHit = {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
};

type LocationSearchProps = {
  disabled?: boolean;
  onSelect: (latitude: number, longitude: number, label: string) => void;
};

const DEBOUNCE_MS = 400;

export function LocationSearch({ disabled = false, onSelect }: LocationSearchProps) {
  const inputId = useId();
  const listId = `${inputId}-results`;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimHit[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "empty" | "error">("idle");
  const [activeIndex, setActiveIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      abortRef.current?.abort();
      setResults([]);
      setStatus("idle");
      setOpen(false);
      return;
    }

    setStatus("loading");
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("q", trimmed);
        url.searchParams.set("format", "jsonv2");
        url.searchParams.set("limit", "6");
        url.searchParams.set("addressdetails", "0");
        url.searchParams.set("countrycodes", "in");
        url.searchParams.set("viewbox", "68.1,6.7,97.4,35.5");
        const response = await fetch(url.toString(), {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error("Search failed");
        }
        const payload = (await response.json()) as NominatimHit[];
        if (controller.signal.aborted) {
          return;
        }
        setResults(payload);
        setActiveIndex(0);
        setOpen(true);
        setStatus(payload.length === 0 ? "empty" : "idle");
      } catch (error) {
        if ((error as { name?: string }).name === "AbortError") {
          return;
        }
        setResults([]);
        setStatus("error");
        setOpen(true);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  function choose(hit: NominatimHit) {
    const latitude = Number(hit.lat);
    const longitude = Number(hit.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }
    onSelect(latitude, longitude, hit.display_name);
    setQuery(hit.display_name);
    setOpen(false);
    setResults([]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
    if (!open || results.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = results[activeIndex];
      if (hit) {
        choose(hit);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <label htmlFor={inputId} className="text-label font-medium text-navy">
        Search location
      </label>
      <div className="relative mt-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder="Area, landmark, or street name"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open && results[activeIndex] ? `${listId}-${results[activeIndex].place_id}` : undefined
          }
          className={cn(controlClassName, "border-line pl-9")}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setOpen(true);
            }
          }}
        />
      </div>
      <p className="mt-1 text-small text-muted">
        Search a place, then click the map to fine-tune the pin.
      </p>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-line bg-paper-raised py-1 shadow-md"
        >
          {status === "loading" ? (
            <li className="px-3 py-2 text-small text-muted">Searching…</li>
          ) : null}
          {status === "empty" ? (
            <li className="px-3 py-2 text-small text-muted">No matching places in India.</li>
          ) : null}
          {status === "error" ? (
            <li className="px-3 py-2 text-small text-danger">Could not search. Try again.</li>
          ) : null}
          {results.map((hit, index) => (
            <li key={hit.place_id} role="none">
              <button
                id={`${listId}-${hit.place_id}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "w-full px-3 py-2 text-left text-small text-navy",
                  index === activeIndex ? "bg-brand-50" : "hover:bg-brand-50",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(hit)}
              >
                {hit.display_name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
