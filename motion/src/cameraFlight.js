export const CAMERA_FLIGHT_DURATION = 1400;
const ZOOM_OUT_END = CAMERA_FLIGHT_DURATION * 0.25;
const ZOOM_IN_START = CAMERA_FLIGHT_DURATION * 0.75;

function easeInOut(progress) {
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - (-2 * progress + 2) ** 3 / 2;
}

function interpolate(start, end, progress) {
  return start + (end - start) * progress;
}

function normalizeLongitude(longitude) {
  return ((longitude + 180) % 360 + 360) % 360 - 180;
}

export function getCameraFlightFrame({
  startCenter,
  destination,
  startZoom,
  elapsedMilliseconds,
  reducedMotion,
}) {
  if (reducedMotion || elapsedMilliseconds >= CAMERA_FLIGHT_DURATION) {
    return { center: destination, complete: true, zoom: 6 };
  }

  const elapsed = Math.max(0, elapsedMilliseconds);
  const overviewZoom = Math.max(2, Math.min(startZoom - 0.7, 3));

  if (elapsed <= ZOOM_OUT_END) {
    const zoomProgress = easeInOut(elapsed / ZOOM_OUT_END);
    return {
      center: startCenter,
      complete: false,
      zoom: interpolate(startZoom, overviewZoom, zoomProgress),
    };
  }

  if (elapsed < ZOOM_IN_START) {
    const travelProgress = easeInOut((elapsed - ZOOM_OUT_END) / (ZOOM_IN_START - ZOOM_OUT_END));
    const longitudeDifference = normalizeLongitude(destination.lng - startCenter.lng);
    return {
      center: {
        lat: interpolate(startCenter.lat, destination.lat, travelProgress),
        lng: normalizeLongitude(startCenter.lng + longitudeDifference * travelProgress),
      },
      complete: false,
      zoom: overviewZoom,
    };
  }

  const zoomProgress = easeInOut((elapsed - ZOOM_IN_START) / (CAMERA_FLIGHT_DURATION - ZOOM_IN_START));
  return {
    center: destination,
    complete: false,
    zoom: interpolate(overviewZoom, 6, zoomProgress),
  };
}
