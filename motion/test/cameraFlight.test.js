import assert from "node:assert/strict";
import test from "node:test";
import { CAMERA_FLIGHT_DURATION, getCameraFlightFrame } from "../src/cameraFlight.js";

const startCenter = { lat: 0, lng: 10 };
const destination = { lat: 59.9139, lng: 10.7522 };

function sampleFrame(elapsedMilliseconds, overrides = {}) {
  return getCameraFlightFrame({
    startCenter,
    destination,
    startZoom: 8,
    elapsedMilliseconds,
    reducedMotion: false,
    ...overrides,
  });
}

test("camera interpolation starts at the current camera", () => {
  assert.deepEqual(sampleFrame(0), {
    center: startCenter,
    complete: false,
    zoom: 8,
  });
});

test("zoom out keeps the exact starting center", () => {
  const frame = sampleFrame(175);

  assert.equal(frame.center, startCenter);
  assert.equal(frame.zoom, 5.5);
});

test("travel starts only after zoom out and stays at overview zoom", () => {
  const travelStart = sampleFrame(350);
  const travelMiddle = sampleFrame(700, { destination: { lat: 60, lng: 70 } });

  assert.equal(travelStart.center, startCenter);
  assert.equal(travelStart.zoom, 3);
  assert.deepEqual(travelMiddle.center, { lat: 30, lng: 40 });
  assert.equal(travelMiddle.zoom, 3);
});

test("a world view still zooms out before travel", () => {
  const frame = sampleFrame(350, { startZoom: 2.7 });

  assert.equal(frame.center, startCenter);
  assert.equal(frame.zoom, 2);
});

test("camera interpolation reaches the eased midpoint and overview zoom", () => {
  assert.deepEqual(sampleFrame(CAMERA_FLIGHT_DURATION / 2, {
    destination: { lat: 60, lng: 70 },
  }), {
    center: { lat: 30, lng: 40 },
    complete: false,
    zoom: 3,
  });
});

test("camera interpolation ends at zoom level six", () => {
  const frame = sampleFrame(CAMERA_FLIGHT_DURATION);

  assert.equal(frame.zoom, 6);
  assert.equal(frame.complete, true);
});

test("travel reaches the exact destination before zoom in", () => {
  const frame = sampleFrame(1050);

  assert.equal(frame.center, destination);
  assert.equal(frame.zoom, 3);
});

test("zoom in keeps the exact destination center", () => {
  const frame = sampleFrame(1155);

  assert.equal(frame.center, destination);
  assert.ok(frame.zoom > 3);
  assert.ok(frame.zoom < 6);
});

test("camera interpolation wraps longitude through the shortest path", () => {
  const frame = sampleFrame(CAMERA_FLIGHT_DURATION / 2, {
    startCenter: { lat: 0, lng: 170 },
    destination: { lat: 0, lng: -170 },
  });

  assert.deepEqual(frame.center, { lat: 0, lng: -180 });
});

test("camera interpolation returns the exact final destination", () => {
  const frame = sampleFrame(CAMERA_FLIGHT_DURATION + 100);

  assert.equal(frame.center, destination);
  assert.equal(frame.zoom, 6);
});

test("reduced motion returns one immediate final frame", () => {
  assert.deepEqual(sampleFrame(0, { reducedMotion: true }), {
    center: destination,
    complete: true,
    zoom: 6,
  });
});
