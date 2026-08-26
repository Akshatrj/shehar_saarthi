"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComplaintStatus } from "@/domains/complaints/types";
import { COMPLAINT_CATEGORY_LABELS, COMPLAINT_STATUS_LABELS } from "@/domains/complaints/types";
import type { MapComplaintPin } from "@/domains/complaints/dashboard-analytics";
import {
  DEFAULT_MAP_CENTER,
  addStreetTiles,
  clearLeafletId,
  enableWheelZoomOnFocus,
  refreshMapSize,
  waitForMapSize,
} from "@/components/maps/leaflet-setup";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const DEFAULT_ZOOM = 12;

const STATUS_PIN_COLORS: Record<ComplaintStatus, string> = {
  SUBMITTED: "#1565c0",
  ROUTED: "#5e35b1",
  ASSIGNED: "#f9a825",
  IN_PROGRESS: "#ef6c00",
  COMPLETED: "#2e7d32",
  CLOSED: "#546e7a",
};

type ComplaintsMapProps = {
  complaints: MapComplaintPin[];
  detailPathPrefix: string;
  /** When set, only complaints in this department get a detail link. */
  linkableDepartmentId?: string;
  mapTotalCount: number;
  mapTruncated: boolean;
  className?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildPopupHtml(
  complaint: MapComplaintPin,
  detailPathPrefix: string,
  linkableDepartmentId?: string,
) {
  const category = complaint.category
    ? COMPLAINT_CATEGORY_LABELS[complaint.category]
    : "Uncategorized";
  const status = COMPLAINT_STATUS_LABELS[complaint.status];
  const department = complaint.departmentName ?? "Not routed yet";
  const canLink =
    !linkableDepartmentId || complaint.departmentId === linkableDepartmentId;
  const link = `${detailPathPrefix}/${complaint.id}`;
  const linkHtml = canLink
    ? `<a class="ss-map-popup__link" href="${escapeHtml(link)}">View complaint</a>`
    : `<p class="ss-map-popup__note">Managed by ${escapeHtml(department)}</p>`;

  return `
    <div class="ss-map-popup">
      <p class="ss-map-popup__ref">${escapeHtml(complaint.publicRef)}</p>
      <p><strong>${escapeHtml(status)}</strong> · ${escapeHtml(category)}</p>
      <p class="ss-map-popup__note">${escapeHtml(complaint.description)}</p>
      <p class="ss-map-popup__note">${escapeHtml(department)}</p>
      ${linkHtml}
    </div>
  `;
}

export function ComplaintsMap({
  complaints,
  detailPathPrefix,
  linkableDepartmentId,
  mapTotalCount,
  mapTruncated,
  className,
}: ComplaintsMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const clusterRef = useRef<import("leaflet").MarkerClusterGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const complaintsKey = useMemo(
    () => complaints.map((complaint) => `${complaint.id}:${complaint.status}`).join("|"),
    [complaints],
  );

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    const clusterGroup = clusterRef.current;
    const L = leafletRef.current;
    if (!map || !clusterGroup || !L) {
      return;
    }

    clusterGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    for (const complaint of complaints) {
      const latLng = L.latLng(complaint.latitude, complaint.longitude);
      bounds.extend(latLng);

      const marker = L.marker(latLng, {
        icon: L.divIcon({
          className: "ss-map-pin",
          html: `<span class="ss-map-pin__hit"><span class="ss-map-pin__dot" style="background:${STATUS_PIN_COLORS[complaint.status]}"></span></span>`,
          iconSize: L.point(44, 44),
          iconAnchor: L.point(22, 22),
        }),
      });

      marker.bindPopup(buildPopupHtml(complaint, detailPathPrefix, linkableDepartmentId), {
        maxWidth: 280,
      });
      clusterGroup.addLayer(marker);
    }

    if (complaints.length === 1) {
      map.setView(
        [complaints[0]!.latitude, complaints[0]!.longitude],
        DEFAULT_ZOOM,
      );
    } else if (complaints.length > 1) {
      map.fitBounds(bounds.pad(0.12));
    } else {
      map.setView(DEFAULT_MAP_CENTER, DEFAULT_ZOOM);
    }
  }, [complaints, detailPathPrefix, linkableDepartmentId]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      const container = containerRef.current;
      if (!container || mapRef.current) {
        return;
      }

      await waitForMapSize(container, () => cancelled);
      if (cancelled || !containerRef.current) {
        return;
      }

      const leafletModule = await import("leaflet");
      const L = leafletModule.default ?? leafletModule;
      leafletRef.current = L;

      if (typeof window !== "undefined") {
        (window as Window & { L?: typeof L }).L = L;
      }

      await import("leaflet.markercluster");

      if (cancelled || !containerRef.current) {
        return;
      }

      const host = containerRef.current;
      clearLeafletId(host);

      const map = L.map(host, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      mapRef.current = map;
      enableWheelZoomOnFocus(map);
      addStreetTiles(L, map, () => cancelled);

      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 48,
        iconCreateFunction(cluster) {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="ss-map-cluster">${count}</div>`,
            className: "ss-map-cluster-wrap",
            iconSize: L.point(40, 40),
          });
        },
      });
      clusterRef.current = clusterGroup;
      map.addLayer(clusterGroup);

      if (cancelled) {
        return;
      }

      refreshMapSize(map, () => cancelled);
      setMapReady(true);
    }

    void initMap();

    return () => {
      cancelled = true;
      setMapReady(false);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        clusterRef.current = null;
        leafletRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady) {
      return;
    }

    syncMarkers();
  }, [mapReady, complaintsKey, syncMarkers]);

  useEffect(() => {
    if (!mapReady || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [mapReady]);

  return (
    <div
      className={className}
      aria-label="Complaint locations map"
      role="region"
    >
      <div className="h-[min(22rem,70dvh)] overflow-hidden rounded-md sm:h-[420px]">
        <div ref={containerRef} className="ss-map h-full w-full" />
      </div>
      {mapTotalCount === 0 ? (
        <p className="mt-3 text-small text-muted">
          No complaints with location data yet. New reports will appear here automatically.
        </p>
      ) : (
        <p className="mt-3 text-small text-muted">
          Showing {complaints.length} of {mapTotalCount} complaint
          {mapTotalCount === 1 ? "" : "s"} on the map
          {mapTruncated ? " (latest pins only for performance)" : ""}. Clustered
          markers expand as you zoom in.
        </p>
      )}
    </div>
  );
}
