import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MAP_PROVIDER,
  formatImageryDate,
  getNasaImageryDate,
  getNasaTileUrl,
  getOpenStreetMapTileUrl,
} from "../src/mapProviders.js";

test("Google Maps is the default provider", () => {
  assert.equal(DEFAULT_MAP_PROVIDER, "google");
});

test("NASA imagery uses the previous UTC day across a year boundary", () => {
  assert.equal(getNasaImageryDate(new Date("2026-01-01T00:05:00Z")), "2025-12-31");
});

test("NASA imagery dates use a readable date", () => {
  assert.equal(formatImageryDate("2026-09-05"), "September 5, 2026");
});

test("tile URLs reject vertical coordinates outside the zoom range", () => {
  assert.equal(getOpenStreetMapTileUrl({ x: 0, y: -1 }, 2), null);
  assert.equal(getOpenStreetMapTileUrl({ x: 0, y: 4 }, 2), null);
  assert.equal(getNasaTileUrl({ x: 0, y: -1 }, 2, "2026-09-05"), null);
  assert.equal(getNasaTileUrl({ x: 0, y: 4 }, 2, "2026-09-05"), null);
});

test("tile URLs wrap horizontal coordinates", () => {
  assert.equal(
    getOpenStreetMapTileUrl({ x: -1, y: 1 }, 2),
    "https://tile.openstreetmap.org/2/3/1.png",
  );
  assert.equal(
    getOpenStreetMapTileUrl({ x: 4, y: 1 }, 2),
    "https://tile.openstreetmap.org/2/0/1.png",
  );
});

test("OpenStreetMap uses standard raster tile URLs", () => {
  assert.equal(
    getOpenStreetMapTileUrl({ x: 2, y: 1 }, 3),
    "https://tile.openstreetmap.org/3/2/1.png",
  );
});

test("NASA uses dated MODIS Terra Web Mercator JPEG tiles", () => {
  assert.equal(
    getNasaTileUrl({ x: 2, y: 1 }, 3, "2026-09-05"),
    "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2026-09-05/GoogleMapsCompatible_Level9/3/1/2.jpg",
  );
});

test("NASA rejects tiles above zoom level nine", () => {
  assert.equal(getNasaTileUrl({ x: 2, y: 1 }, 10, "2026-09-05"), null);
});
