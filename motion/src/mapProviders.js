export const DEFAULT_MAP_PROVIDER = "google";

export const MAP_PROVIDERS = {
  google: {
    label: "Google Maps",
    mapTypeId: "roadmap",
    minZoom: 2,
    maxZoom: 16,
  },
  openstreetmap: {
    label: "OpenStreetMap",
    mapTypeId: "openstreetmap",
    minZoom: 2,
    maxZoom: 19,
  },
  nasa: {
    label: "NASA Worldview",
    mapTypeId: "nasa",
    minZoom: 2,
    maxZoom: 9,
  },
};

export function getNasaImageryDate(now = new Date()) {
  return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function formatImageryDate(imageryDate) {
  return new Date(`${imageryDate}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
}

function normalizeTileCoordinate(coordinate, zoom) {
  const tileCount = 2 ** zoom;
  if (coordinate.y < 0 || coordinate.y >= tileCount) return null;
  return { x: ((coordinate.x % tileCount) + tileCount) % tileCount, y: coordinate.y };
}

export function getOpenStreetMapTileUrl(coordinate, zoom) {
  const normalizedCoordinate = normalizeTileCoordinate(coordinate, zoom);
  if (!normalizedCoordinate || zoom > MAP_PROVIDERS.openstreetmap.maxZoom) return null;
  return `https://tile.openstreetmap.org/${zoom}/${normalizedCoordinate.x}/${normalizedCoordinate.y}.png`;
}

export function getNasaTileUrl(coordinate, zoom, imageryDate) {
  const normalizedCoordinate = normalizeTileCoordinate(coordinate, zoom);
  if (!normalizedCoordinate || zoom > MAP_PROVIDERS.nasa.maxZoom) return null;
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${imageryDate}/GoogleMapsCompatible_Level9/${zoom}/${normalizedCoordinate.y}/${normalizedCoordinate.x}.jpg`;
}
