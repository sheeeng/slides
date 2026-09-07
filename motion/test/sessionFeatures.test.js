import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  DEFAULT_MAP_PROVIDER,
  getNasaReferenceTileUrl,
  getProviderAttribution,
  MAP_PROVIDERS,
  NASA_REFERENCE_LAYERS,
} from "../src/mapProviders.js";
import { groupTalksByLocation, listTalksByDate, parseTalks } from "../src/talks.js";

const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const mapCanvasSource = readFileSync(new URL("../src/MapCanvas.jsx", import.meta.url), "utf8");
const styleSource = readFileSync(new URL("../src/styles.css", import.meta.url), "utf8");
const talks = parseTalks(readFileSync(new URL("../../talks.toml", import.meta.url), "utf8"));
const locations = groupTalksByLocation(talks);

test("the motion talks list exposes video links for talks with recordings", () => {
  assert.match(appSource, /talk\.video/);
});

test("the talk archive supplies every session talk location", () => {
  assert.equal(talks.length, 7);
  assert.equal(locations.length, 5);
});

test("Oslo keeps its Docker and Nix talk and Vimeo video", () => {
  const oslo = locations.find((location) => location.city === "Oslo");

  assert.ok(oslo);
  assert.equal(oslo.talks.length, 2);
  assert.ok(oslo.talks.some((talk) => talk.title.includes("Reproducible Environments")));
  assert.ok(oslo.talks.some((talk) => talk.video === "https://vimeo.com/1223729965"));
});

test("the Jenkins As Code workshop item links to its repository", () => {
  const jenkinsTalk = talks.find((talk) => talk.title === "Getting Started with Jenkins As Code");

  assert.ok(jenkinsTalk);
  assert.equal(jenkinsTalk.repository, "https://github.com/sheeeng/jenkins-configuration-as-code-workshop");
});

test("the Kernel Virtual Machine talk links to its recording", () => {
  const kernelTalk = talks.find((talk) => talk.title === "Getting Started with Kernel Virtual Machine");

  assert.ok(kernelTalk);
  assert.equal(kernelTalk.video, "https://www.youtube.com/watch?v=mAZNlyXVoT4");
});

test("the visible map list returns every session talk once", () => {
  const entries = listTalksByDate(locations);

  assert.equal(entries.length, talks.length);
  assert.deepEqual(entries.map(({ talk }) => talk.title), [
    "The Giant Immutable LEGO Set: Demystifying the Nix Store",
    "When is the fix available? A 5-Minute Guide to Tracking Nixpkgs PRs",
    "The Giant Immutable LEGO Set: Demystifying the Nix Store",
    "Reproducible Environments: Why Docker Isn't Enough and Why Nix Might Be!",
    "Getting Started with Kernel Virtual Machine",
    "Getting Started with Jenkins As Code",
    "MeeGo平台与塞班平台中的Qt跨平台开发",
  ]);
});

test("Google Maps remains the default provider", () => {
  assert.equal(DEFAULT_MAP_PROVIDER, "google");
});

test("map style buttons show Google Maps, OpenStreetMap, and NASA Worldview", () => {
  assert.deepEqual(Object.values(MAP_PROVIDERS).map((provider) => provider.label), [
    "Google Maps",
    "OpenStreetMap",
    "NASA Worldview",
  ]);
});

test("OpenStreetMap attribution credits contributors on the raster map", () => {
  assert.match(getProviderAttribution("openstreetmap"), /OpenStreetMap/);
  assert.match(getProviderAttribution("openstreetmap"), /contributors/);
});

test("NASA attribution names Earthdata and announces the imagery date", () => {
  assert.equal(
    getProviderAttribution("nasa", "2026-09-06"),
    '<a href="https://earthdata.nasa.gov/worldview">NASA Earthdata</a>. This imagery is from September 6, 2026.',
  );
});

test("Google Maps attribution stays empty so its own terms remain visible", () => {
  assert.equal(getProviderAttribution("google"), "");
});

test("NASA corrected reflectance uses dated Web Mercator tiles at zoom nine", () => {
  const nasa = MAP_PROVIDERS.nasa;

  assert.equal(nasa.maxZoom, 9);
  assert.equal(nasa.mapTypeId, "nasa");
});

test("NASA Worldview reference layers match the Worldview layer stack", () => {
  assert.deepEqual(
    NASA_REFERENCE_LAYERS.map((layer) => layer.layerName),
    ["Reference_Features_15m", "Coastlines_15m", "Reference_Labels"],
  );
  assert.ok(NASA_REFERENCE_LAYERS.every((layer) => layer.layerName && layer.matrixSet && layer.maxZoom));
});

test("NASA Worldview place labels sit above borders, roads, and coastlines", () => {
  assert.deepEqual(
    NASA_REFERENCE_LAYERS.map((layer) => layer.matrixSet),
    [
      "GoogleMapsCompatible_Level13",
      "GoogleMapsCompatible_Level13",
      "GoogleMapsCompatible_Level9",
    ],
  );
});

test("NASA reference tile URLs wrap horizontally and reject invalid tiles", () => {
  const referenceLayer = NASA_REFERENCE_LAYERS[0];

  assert.equal(
    getNasaReferenceTileUrl(referenceLayer, { x: -1, y: 1 }, 2),
    "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/Reference_Features_15m/default/GoogleMapsCompatible_Level13/2/1/3.png",
  );
  assert.equal(getNasaReferenceTileUrl(referenceLayer, { x: 2, y: 4 }, 2), null);
  assert.equal(getNasaReferenceTileUrl(referenceLayer, { x: 0, y: 1 }, 14), null);
});

test("the motion identity panel offers Map Style, Locate Me, and View All", () => {
  assert.match(appSource, /Map Style/);
  assert.match(appSource, /Locate Me/);
  assert.match(appSource, /View All/);
});

test("the motion map requests location before fitting all talks on first load", () => {
  assert.match(mapCanvasSource, /locateUser\(\{ fallbackToAllTalks: true \}\)/);
  assert.match(mapCanvasSource, /All talk locations are visible/);
});

test("the motion map distinguishes denied, timeout, and unavailable location errors", () => {
  assert.match(mapCanvasSource, /error\?\.code === 1/);
  assert.match(mapCanvasSource, /error\?\.code === 3/);
  assert.match(mapCanvasSource, /timeout: 30000/);
  assert.doesNotMatch(mapCanvasSource, /Location access was not granted\. The talk locations remain visible\./);
});

test("the motion talks list updates from the visible map area", () => {
  assert.match(appSource, /On This Map/);
  assert.match(appSource, /visibleLocationIds/);
  assert.match(appSource, /listTalksByDate\(visibleLocations\)/);
});

test("the motion talk card appears only for a selected location", () => {
  assert.match(appSource, /if \(!location\) return null/);
  assert.match(appSource, /app-shell--details-open/);
});

test("the motion layout has responsive and reduced-motion rules", () => {
  assert.match(styleSource, /@media \(max-width: 720px\), \(max-height: 520px\)/);
  assert.match(styleSource, /app-shell--details-open \.talk-browser \{ display: none; \}/);
  assert.match(styleSource, /prefers-reduced-motion/);
});

test("raster providers keep their attribution in the Leaflet corner", () => {
  assert.match(mapCanvasSource, /attributionControl\.setPrefix\(false\)/);
  assert.match(mapCanvasSource, /attribution: getProviderAttribution/);
});

test("the motion map fills the full page below the fixed layout surfaces", () => {
  assert.match(styleSource, /\.app-shell, \.map-canvas \{ position: fixed; inset: 0; \}/);
  assert.match(styleSource, /\.map-canvas__surface \{ position: absolute; inset: 0;/);
});

test("NASA Worldview overlays render above corrected reflectance imagery", () => {
  assert.match(mapCanvasSource, /NASA_REFERENCE_LAYERS/);
  assert.match(mapCanvasSource, /pane: "referencePane"/);
  assert.match(mapCanvasSource, /MODIS_Terra_CorrectedReflectance_TrueColor/);
});

test("the motion map uses the shared NASA imagery attribution", () => {
  assert.match(mapCanvasSource, /getProviderAttribution\("nasa", nasaImageryDate\)/);
});

test("the motion map shares the current location across map styles", () => {
  assert.match(mapCanvasSource, /const currentPositionRef = useRef\(null\)/);
  assert.match(mapCanvasSource, /currentPositionRef\.current = position/);
  assert.match(mapCanvasSource, /function addGoogleCurrentLocationMarker/);
  assert.match(mapCanvasSource, /function addLeafletCurrentLocationMarker/);
  assert.match(mapCanvasSource, /addLeafletCurrentLocationMarker\(\)/);
  assert.match(mapCanvasSource, /addGoogleCurrentLocationMarker\(\)/);
});

test("the motion map keeps the camera view when switching map styles", () => {
  assert.match(mapCanvasSource, /const cameraViewRef = useRef\(null\)/);
  assert.match(mapCanvasSource, /const savedCameraView = cameraViewRef\.current/);
  assert.match(mapCanvasSource, /googleMapRef\.current\.setCenter/);
  assert.match(mapCanvasSource, /leafletMapRef\.current\.setView/);
});
