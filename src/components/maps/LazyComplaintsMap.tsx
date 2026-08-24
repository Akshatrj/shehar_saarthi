"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { MapComplaintPin } from "@/domains/complaints/dashboard-analytics";
import { Spinner } from "@/components/ui/Spinner";

const ComplaintsMap = dynamic(
  () =>
    import("@/components/maps/ComplaintsMap").then((module) => module.ComplaintsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-md border border-line bg-brand-50">
        <Spinner label="Loading map…" />
      </div>
    ),
  },
);

type LazyComplaintsMapProps = {
  complaints: MapComplaintPin[];
  detailPathPrefix: string;
  mapTotalCount: number;
  mapTruncated: boolean;
};

function MapPlaceholder() {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-md border border-line bg-brand-50">
      <Spinner label="Preparing map…" />
    </div>
  );
}

export function LazyComplaintsMap({
  complaints,
  detailPathPrefix,
  mapTotalCount,
  mapTruncated,
}: LazyComplaintsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldLoad) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? (
        <ComplaintsMap
          complaints={complaints}
          detailPathPrefix={detailPathPrefix}
          mapTotalCount={mapTotalCount}
          mapTruncated={mapTruncated}
        />
      ) : (
        <MapPlaceholder />
      )}
    </div>
  );
}
