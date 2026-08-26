export const DEFAULT_MAP_CENTER: [number, number] = [28.6139, 77.209];

const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const CARTO_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

type LeafletNS = typeof import("leaflet");

export function waitForMapSize(
  element: HTMLElement,
  cancelled: () => boolean,
) {
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

export function clearLeafletId(host: HTMLElement) {
  const marked = host as HTMLElement & { _leaflet_id?: number };
  if (marked._leaflet_id) {
    marked._leaflet_id = undefined;
  }
}

export function addStreetTiles(
  L: LeafletNS,
  map: import("leaflet").Map,
  cancelled: () => boolean,
) {
  const osmLayer = L.tileLayer(OSM_TILES, {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  });
  osmLayer.addTo(map);

  let switchedToFallback = false;
  osmLayer.on("tileerror", () => {
    if (switchedToFallback || cancelled() || !map) {
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
}

export function refreshMapSize(
  map: import("leaflet").Map,
  cancelled: () => boolean,
) {
  const refresh = () => {
    if (!cancelled()) {
      map.invalidateSize({ animate: false });
    }
  };
  requestAnimationFrame(refresh);
  window.setTimeout(refresh, 80);
  window.setTimeout(refresh, 300);
}

export function enableWheelZoomOnFocus(map: import("leaflet").Map) {
  map.scrollWheelZoom.disable();
  map.on("focus", () => {
    map.scrollWheelZoom.enable();
  });
  map.on("blur", () => {
    map.scrollWheelZoom.disable();
  });
}
