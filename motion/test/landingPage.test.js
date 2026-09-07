import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { groupTalksByLocation, parseTalks } from "../src/talks.js";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const talks = parseTalks(readFileSync(new URL("../../talks.toml", import.meta.url), "utf8"));
const locations = groupTalksByLocation(talks);

test("the landing page defaults to Google Maps", () => {
  assert.match(indexHtml, /id="btn-gmaps" class="map-btn active" aria-pressed="true"/);
});

test("the landing page keeps OpenStreetMap and NASA Worldview ready but hidden", () => {
  assert.match(indexHtml, /<div id="map-osm" class="map-container" hidden><\/div>/);
  assert.match(indexHtml, /<div id="map-nasa" class="map-container" hidden><\/div>/);
});

test("the landing page map toggle exposes all three providers", () => {
  assert.match(indexHtml, /role="group" aria-label="Map provider"/);
  assert.match(indexHtml, /Google Maps/);
  assert.match(indexHtml, /OpenStreetMap/);
  assert.match(indexHtml, /NASA Worldview/);
});

test("the landing page links the Docker and Nix Vimeo recording", () => {
  assert.match(indexHtml, /href="https:\/\/vimeo\.com\/1223729965"/);
  assert.match(indexHtml, /Reproducible Environments/);
});

test("the landing page links the Kernel Virtual Machine YouTube recording", () => {
  assert.match(indexHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=mAZNlyXVoT4"/);
  assert.match(indexHtml, /Getting Started with Kernel Virtual Machine/);
  assert.match(indexHtml, /t\.video/);
});

test("the landing page orders the static slides newest first", () => {
  const slidesBlock = indexHtml.match(/<h2 class="section-heading">Slides<\/h2>([\s\S]*?)<h2 class="section-heading">Videos<\/h2>/)[1];
  const hrefs = [
    "reproducible-environments-docker-vs-nix/",
    "demystifying-the-nix-store/",
    "tracking-nixpkgs-merged-pull-requests/",
    "running-kernel-based-virtual-machine/",
    "governing-azure-resources-with-policy/",
    "https://events.csdn.net/QtDeveloperConference/Qt%20Cross-platform%20Development%20-%20MeeGo%20and%20Symbian.pdf",
  ];
  const positions = hrefs.map((href) => slidesBlock.indexOf(`href="${href}"`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((first, second) => first - second));
});

test("the landing page orders the static videos newest first", () => {
  const videosBlock = indexHtml.match(/<h2 class="section-heading">Videos<\/h2>([\s\S]*?)<section id="talks-map">/)[1];
  const hrefs = [
    "https://vimeo.com/1223729965",
    "https://www.youtube.com/watch?v=4bwSRCTAAn0",
    "https://www.youtube.com/watch?v=wo38491N3Nw",
    "https://www.youtube.com/watch?v=mAZNlyXVoT4",
  ];
  const positions = hrefs.map((href) => videosBlock.indexOf(`href="${href}"`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((first, second) => first - second));
});

test("the landing page popup can link a talk to its repository", () => {
  assert.match(indexHtml, /Repository ↗/);
  assert.match(indexHtml, /t\.repository/);
});

test("the landing page never commits a real Google Maps API key", () => {
  assert.match(indexHtml, /const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"/);
});

test("the landing page popup wraps talk text instead of cropping it", () => {
  assert.match(indexHtml, /max-width:280px;overflow-wrap:break-word/);
});

test("the landing page map statistics match the talk archive", () => {
  assert.match(indexHtml, /function renderStats\(talks\)/);
  assert.match(indexHtml, /<div id="map-stats" aria-live="polite"><\/div>/);
  assert.equal(locations.length, 5);
  assert.equal(talks.length, 7);
});

test("the landing page draws one marker per talk location", () => {
  const markerLoops = indexHtml.match(/for \(const group of groupByLocation\(talks\)\.values\(\)\)/g) ?? [];

  assert.ok(markerLoops.length >= 2);
});

test("the landing page NASA map loads corrected reflectance at zoom levels one through nine", () => {
  assert.match(indexHtml, /MODIS_Terra_CorrectedReflectance_TrueColor\/default\//);
  assert.match(indexHtml, /\$\{nasaImageryDate\}\/GoogleMapsCompatible_Level9/);
  assert.match(indexHtml, /maxZoom: 9,\s*minZoom: 1,/);
});

test("the landing page NASA Worldview adds country boundaries, coastlines, and labels", () => {
  assert.match(indexHtml, /Reference_Features_15m/);
  assert.match(indexHtml, /Coastlines_15m/);
  assert.match(indexHtml, /Reference_Labels/);
  assert.match(indexHtml, /createPane\("referencePane"\)/);
  assert.match(indexHtml, /pane: "referencePane"/);
});

test("the landing page NASA map names Earthdata and its imagery date", () => {
  assert.match(indexHtml, /This imagery is from \$\{formatDate\(nasaImageryDate\)\}\./);
});

test("the landing page credits OpenStreetMap contributors on the raster map", () => {
  assert.match(indexHtml, /openstreetmap\.org\/copyright">OpenStreetMap<\/a> contributors/);
});

test("the landing page credits NASA Earthdata on the Worldview map", () => {
  assert.match(indexHtml, /earthdata\.nasa\.gov\/worldview">NASA Earthdata<\/a>/);
});

test("the landing page map containers keep a consistent height with no hidden layout gap", () => {
  assert.match(indexHtml, /\.map-container \{\s*height: 320px;/);
  assert.match(indexHtml, /\.map-container\[hidden\] \{\s*display: none;/);
});
