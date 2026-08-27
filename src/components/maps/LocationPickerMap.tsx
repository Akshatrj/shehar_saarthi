"use client";

import { useEffect, useRef, useState } from "react";
import { LocationSearch } from "@/components/maps/LocationSearch";

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209];
const DEFAULT_ZOOM = 13;

const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const CARTO_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

function parseCoordinate(value: string, min: number, max: number): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }
  return parsed;
}

function waitForMapSize(element: HTMLElement, cancelled: () => boolean) {
  return new Promise<void>((resolve) => {
    if (element.clientWidth > 0 && element.clientHeight > 0) {
      resolve();
      return;
    }

    const observer = new ResizeObserver(() => {
      if (cancelled() || (element.clientWidth > 0 && element.clientHeight > 0)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(element);
  });
}

function pinIcon(L: typeof import("leaflet")) {
  return L.divIcon({
    className: "ss-map-pin",
    html: `<span class="ss-map-pin__hit"><span class="ss-map-pin__dot" style="background:#1e88e5"></span></span>`,
    iconSize: L.point(44, 44),
    iconAnchor: L.point(22, 22),
  });
}

type LocationPickerMapProps = {
  latitude: string;
  longitude: string;
  disabled?: boolean;
  showSearch?: boolean;
  onPick: (latitude: number, longitude: number) => void;
};

export function LocationPickerMap({
  latitude,
  longitude,
  disabled = false,
  showSearch = false,
  onPick,
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onPickRef = useRef(onPick);
  const disabledRef = useRef(disabled);
  const [mapReady, setMapReady] = useState(false);

  onPickRef.current = onPick;
  disabledRef.current = disabled;

  const lat = parseCoordinate(latitude, -90, 90);
  const lng = parseCoordinate(longitude, -180, 180);
  const hasPin = lat !== null && lng !== null;

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

      if (cancelled || !containerRef.current) {
        return;
      }

      const host = containerRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (host._leaflet_id) {
        host._leaflet_id = undefined;
      }

      const map = L.map(host, {
        scrollWheelZoom: true,
        zoomControl: true,
      }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      mapRef.current = map;

      const osmLayer = L.tileLayer(OSM_TILES, {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      });
      osmLayer.addTo(map);

      let switchedToFallback = false;
      osmLayer.on("tileerror", () => {
        if (switchedToFallback || cancelled || !mapRef.current) {
          return;
        }
        switchedToFallback = true;
        map.removeLayer(osmLayer);
        L.tileLayer(CARTO_TILES, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
          subdomains: "abcd",
          maxZoom: 20,
        }).addTo(map);
      });

      map.on("click", (event) => {
        if (disabledRef.current) {
          return;
        }
        const size = map.getSize();
        if (size.x < 80 || size.y < 80) {
          map.invalidateSize({ animate: false });
          return;
        }
        const nextLat = Number(event.latlng.lat.toFixed(6));
        const nextLng = Number(event.latlng.lng.toFixed(6));
        onPickRef.current(nextLat, nextLng);
      });

      const refreshSize = () => {
        if (!cancelled && mapRef.current) {
          map.invalidateSize({ animate: false });
        }
      };

      requestAnimationFrame(refreshSize);
      window.setTimeout(refreshSize, 80);
      window.setTimeout(refreshSize, 300);
      setMapReady(true);
    }

    void initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        leafletRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !L) {
      return;
    }

    if (!hasPin) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const position = L.latLng(lat, lng);
    if (!markerRef.current) {
      const marker = L.marker(position, {
        icon: pinIcon(L),
        keyboard: false,
        draggable: !disabledRef.current,
      }).addTo(map);
      marker.on("dragend", () => {
        if (disabledRef.current) {
          return;
        }
        const next = marker.getLatLng();
        onPickRef.current(Number(next.lat.toFixed(6)), Number(next.lng.toFixed(6)));
      });
      markerRef.current = marker;
    } else {
      markerRef.current.setLatLng(position);
      if (disabledRef.current) {
        markerRef.current.dragging?.disable();
      } else {
        markerRef.current.dragging?.enable();
      }
    }

    const current = map.getCenter();
    const farFromView = map.distance(current, position) > 250;
    if (farFromView || !map.getBounds().contains(position)) {
      map.setView(position, Math.max(map.getZoom(), DEFAULT_ZOOM), { animate: false });
    }
    map.invalidateSize({ animate: false });
  }, [hasPin, lat, lng, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!mapReady || !map || !container) {
      return;
    }
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    observer.observe(container);
    map.invalidateSize({ animate: false });
    return () => observer.disconnect();
  }, [mapReady]);

  return (
    <div className="flex flex-col gap-3">
      {showSearch ? (
        <LocationSearch
          disabled={disabled}
          onSelect={(nextLat, nextLng) => {
            onPick(nextLat, nextLng);
            const map = mapRef.current;
            if (map) {
              map.setView([nextLat, nextLng], Math.max(map.getZoom(), 16), {
                animate: false,
              });
            }
          }}
        />
      ) : null}
      <div className="h-56 overflow-hidden rounded-lg border border-line sm:h-72 md:h-80">
        <div
          ref={containerRef}
          className="ss-map h-full w-full cursor-crosshair"
          role="application"
          aria-label="Map to pin complaint location. Click to set coordinates."
        />
      </div>
      <p className="text-small text-muted">
        {hasPin
          ? "Click the map or drag the pin to adjust the location."
          : "Click the map to drop a pin. Streets should appear in a few seconds."}
      </p>
    </div>
  );
}
