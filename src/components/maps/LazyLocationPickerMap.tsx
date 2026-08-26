"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/Spinner";

export const LazyLocationPickerMap = dynamic(
  () =>
    import("@/components/maps/LocationPickerMap").then(
      (mod) => mod.LocationPickerMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 items-center justify-center rounded-lg border border-line bg-brand-50 sm:h-72 md:h-80">
        <Spinner label="Loading map…" />
      </div>
    ),
  },
);
