import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { getCameraFlightFrame } from "./cameraFlight.js";
import {
  DEFAULT_MAP_PROVIDER,
  getProviderAttribution,
  MAP_PROVIDERS,
  NASA_REFERENCE_LAYERS,
} from "./mapProviders.js";

const GOOGLE_MAPS_API_KEY = __GOOGLE_MAPS_API_KEY__;
let googleMapsPromise;

function loadGoogleMaps() {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (googleMapsPromise) return googleMapsPromise;
  if (!GOOGLE_MAPS_API_KEY) return Promise.reject(new Error("Google Maps is not configured for this preview."));

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = "__motionGoogleMapsReady";
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };
    const script = document.createElement("script");
    script.dataset.googleMaps = "true";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&v=weekly&loading=async&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      delete window[callbackName];
      googleMapsPromise = undefined;
      reject(new Error("Google Maps could not load."));
    };
    document.head.append(script);
  });
  return googleMapsPromise;
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    if (!document.querySelector("link[data-leaflet]")) {
      const stylesheet = document.createElement("link");
      stylesheet.dataset.leaflet = "true";
      stylesheet.rel = "stylesheet";
      stylesheet.href = "https://unpkg.com/leaflet@1/dist/leaflet.css";
      document.head.append(stylesheet);
    }
    const script = document.createElement("script");
    script.dataset.leaflet = "true";
    script.src = "https://unpkg.com/leaflet@1/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("The raster map could not load."));
    document.head.append(script);
  });
}

function googleMarkerIcon(maps, active) {
  return {
    path: maps.SymbolPath.CIRCLE,
    fillColor: active ? "#34268f" : "#6655cc",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: active ? 4 : 3,
    scale: active ? 18 : 15,
  };
}

export const MapCanvas = forwardRef(function MapCanvas(
  { locations, selectedLocationId, selectionRequest, mapProvider, nasaImageryDate, onSelect, onStatus, onVisibleChange },
  controllerRef,
) {
  const googleElementRef = useRef(null);
  const leafletElementRef = useRef(null);
  const googleMapRef = useRef(null);
  const mapsRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletRef = useRef(null);
  const googleMarkersRef = useRef([]);
  const leafletMarkersRef = useRef([]);
  const googleBoundsRef = useRef(null);
  const leafletBoundsRef = useRef(null);
  const tileLayerRef = useRef(null);
  const referenceLayersRef = useRef(null);
  const currentLocationMarkerRef = useRef({ google: null, leaflet: null });
  const currentPositionRef = useRef(null);
  const cameraViewRef = useRef(null);
  const cameraFlightFrameRef = useRef(null);
  const geolocationRequestGenerationRef = useRef(0);
  const geolocationRequestActiveRef = useRef(false);
  const selectedLocationIdRef = useRef(selectedLocationId);
  const mapProviderRef = useRef(mapProvider);

  selectedLocationIdRef.current = selectedLocationId;
  mapProviderRef.current = mapProvider;

  function isGoogleActive() {
    return mapProviderRef.current === "google";
  }

  function addGoogleCurrentLocationMarker() {
    if (!googleMapRef.current || !mapsRef.current || !currentPositionRef.current) return;
    currentLocationMarkerRef.current.google?.setMap(null);
    currentLocationMarkerRef.current.google = new mapsRef.current.Marker({
      map: googleMapRef.current,
      position: currentPositionRef.current,
      title: "Your current location",
      icon: {
        path: mapsRef.current.SymbolPath.CIRCLE,
        fillColor: "#1677ff",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 4,
        scale: 9,
      },
      zIndex: 1000,
    });
  }

  function addLeafletCurrentLocationMarker() {
    if (!leafletMapRef.current || !leafletRef.current || !currentPositionRef.current) return;
    currentLocationMarkerRef.current.leaflet?.remove();
    currentLocationMarkerRef.current.leaflet = leafletRef.current
      .circleMarker([currentPositionRef.current.lat, currentPositionRef.current.lng], {
        color: "#ffffff",
        fillColor: "#1677ff",
        fillOpacity: 1,
        radius: 9,
        weight: 4,
      })
      .addTo(leafletMapRef.current)
      .bindTooltip("Your current location");
  }

  const cancelCameraFlight = useCallback(() => {
    if (cameraFlightFrameRef.current !== null) {
      window.cancelAnimationFrame(cameraFlightFrameRef.current);
      cameraFlightFrameRef.current = null;
    }
  }, []);

  const supersedeGeolocationRequest = useCallback(() => {
    geolocationRequestGenerationRef.current += 1;
    return geolocationRequestGenerationRef.current;
  }, []);

  const notifyVisibleChange = useCallback(() => {
    if (isGoogleActive()) {
      if (googleMapRef.current) {
        const center = googleMapRef.current.getCenter();
        cameraViewRef.current = {
          lat: center.lat(),
          lng: center.lng(),
          zoom: googleMapRef.current.getZoom(),
        };
      }
    } else if (leafletMapRef.current) {
      const center = leafletMapRef.current.getCenter();
      cameraViewRef.current = {
        lat: center.lat,
        lng: center.lng,
        zoom: leafletMapRef.current.getZoom(),
      };
    }
    if (isGoogleActive()) {
      if (!googleMapRef.current) return;
      const bounds = googleMapRef.current.getBounds();
      if (!bounds) return;
      const visibleLocationIds = locations
        .filter(({ lat, lng }) => bounds.contains({ lat, lng }))
        .map(({ id }) => id);
      onVisibleChange(visibleLocationIds);
      return;
    }
    if (!leafletMapRef.current) return;
    const bounds = leafletMapRef.current.getBounds();
    const visibleLocationIds = locations
      .filter(({ lat, lng }) => bounds.contains([lat, lng]))
      .map(({ id }) => id);
    onVisibleChange(visibleLocationIds);
  }, [locations, onVisibleChange]);

  const viewAllTalks = useCallback(() => {
    supersedeGeolocationRequest();
    cancelCameraFlight();
    if (isGoogleActive()) {
      if (!googleMapRef.current || !googleBoundsRef.current) return;
      const compactViewport = googleMapRef.current.getDiv().clientWidth < 720;
      googleMapRef.current.fitBounds(googleBoundsRef.current, compactViewport ? 24 : 96);
    } else {
      if (!leafletMapRef.current || !leafletBoundsRef.current) return;
      leafletMapRef.current.fitBounds(leafletBoundsRef.current, { padding: [24, 24] });
    }
    onStatus("Map view reset.");
  }, [cancelCameraFlight, onStatus, supersedeGeolocationRequest]);

  const locateUser = useCallback(({ fallbackToAllTalks = false } = {}) => {
    if (geolocationRequestActiveRef.current) {
      onStatus("Location request is already in progress. Allow access when prompted.");
      return;
    }
    const requestGeneration = supersedeGeolocationRequest();
    cancelCameraFlight();
    if (!navigator.geolocation) {
      if (fallbackToAllTalks) {
        viewAllTalks();
        onStatus("Current location is not available. All talk locations are visible.");
      } else {
        onStatus("Current location is not available in this browser.");
      }
      return;
    }
    geolocationRequestActiveRef.current = true;
    onStatus("Finding your current location.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        geolocationRequestActiveRef.current = false;
        if (requestGeneration !== geolocationRequestGenerationRef.current) return;
        const position = { lat: coords.latitude, lng: coords.longitude };
        currentPositionRef.current = position;
        if (isGoogleActive()) {
          if (!googleMapRef.current || !mapsRef.current) return;
          addGoogleCurrentLocationMarker();
          googleMapRef.current.panTo(position);
          googleMapRef.current.setZoom(4);
        } else {
          if (!leafletMapRef.current || !leafletRef.current) return;
          addLeafletCurrentLocationMarker();
          leafletMapRef.current.setView([position.lat, position.lng], 4);
        }
        onStatus("Map centered on your current location.");
      },
      (error) => {
        geolocationRequestActiveRef.current = false;
        if (requestGeneration === geolocationRequestGenerationRef.current) {
          if (fallbackToAllTalks) {
            viewAllTalks();
            onStatus(
              error?.code === 1
                ? "Location access was not granted. All talk locations are visible."
                : "Could not determine your current location. All talk locations are visible.",
            );
          } else if (error?.code === 1) {
            onStatus("Location access is blocked. Enable location for this site, then try Locate Me again.");
          } else if (error?.code === 3) {
            onStatus("Finding your current location timed out. Try Locate Me again.");
          } else {
            onStatus("Your current location is unavailable. Try Locate Me again.");
          }
        }
      },
      { enableHighAccuracy: false, timeout: 30000 },
    );
  }, [cancelCameraFlight, onStatus, supersedeGeolocationRequest, viewAllTalks]);

  const startCameraFlight = useCallback((locationId) => {
    const location = locations.find(({ id }) => id === locationId);
    const activeMap = isGoogleActive() ? googleMapRef.current : leafletMapRef.current;
    if (!location || !activeMap) return;

    supersedeGeolocationRequest();
    cancelCameraFlight();
    const currentCenter = activeMap.getCenter();
    const startCenter = isGoogleActive()
      ? { lat: currentCenter.lat(), lng: currentCenter.lng() }
      : { lat: currentCenter.lat, lng: currentCenter.lng };
    const destination = { lat: location.lat, lng: location.lng };
    const startZoom = activeMap.getZoom();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function applyFrame(frame) {
      if (isGoogleActive()) {
        if (typeof googleMapRef.current.moveCamera === "function") {
          googleMapRef.current.moveCamera({ center: frame.center, zoom: frame.zoom });
        } else {
          googleMapRef.current.setCenter(frame.center);
          googleMapRef.current.setZoom(frame.zoom);
        }
      } else {
        leafletMapRef.current.setView([frame.center.lat, frame.center.lng], frame.zoom, { animate: false });
      }
    }

    if (reducedMotion) {
      applyFrame(getCameraFlightFrame({
        startCenter,
        destination,
        startZoom,
        elapsedMilliseconds: 0,
        reducedMotion,
      }));
      return;
    }

    const startTime = window.performance.now();
    applyFrame(getCameraFlightFrame({
      startCenter,
      destination,
      startZoom,
      elapsedMilliseconds: 0,
      reducedMotion,
    }));
    function renderFrame(currentTime) {
      const frame = getCameraFlightFrame({
        startCenter,
        destination,
        startZoom,
        elapsedMilliseconds: currentTime - startTime,
        reducedMotion,
      });
      applyFrame(frame);
      if (frame.complete) {
        cameraFlightFrameRef.current = null;
        return;
      }
      cameraFlightFrameRef.current = window.requestAnimationFrame(renderFrame);
    }
    cameraFlightFrameRef.current = window.requestAnimationFrame(renderFrame);
  }, [cancelCameraFlight, locations, supersedeGeolocationRequest]);

  useImperativeHandle(controllerRef, () => ({ locateUser, viewAllTalks }), [locateUser, viewAllTalks]);

  useEffect(() => {
    let cancelled = false;
    let mapListeners = [];
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled) return;
        mapsRef.current = maps;
        googleMapRef.current = new maps.Map(googleElementRef.current, {
          center: { lat: 32, lng: 12 },
          zoom: 2,
          minZoom: MAP_PROVIDERS[DEFAULT_MAP_PROVIDER].minZoom,
          maxZoom: MAP_PROVIDERS[DEFAULT_MAP_PROVIDER].maxZoom,
          isFractionalZoomEnabled: true,
          mapTypeId: MAP_PROVIDERS[DEFAULT_MAP_PROVIDER].mapTypeId,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          gestureHandling: "greedy",
          zoomControl: !window.matchMedia("(max-width: 640px)").matches,
          zoomControlOptions: { position: 9 },
        });
        mapListeners.push(googleMapRef.current.addListener("idle", notifyVisibleChange));
        googleBoundsRef.current = new maps.LatLngBounds();
        googleMarkersRef.current = locations.map((location) => {
          const position = { lat: location.lat, lng: location.lng };
          googleBoundsRef.current.extend(position);
          const marker = new maps.Marker({
            map: googleMapRef.current,
            position,
            title: `${location.city}, ${location.country}. ${location.talks.length} ${location.talks.length === 1 ? "talk" : "talks"}.`,
            icon: googleMarkerIcon(maps, location.id === selectedLocationIdRef.current),
            label: {
              text: String(location.talks.length),
              color: "#ffffff",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              fontWeight: "700",
            },
          });
          mapListeners.push(marker.addListener("click", () => onSelect(location.id)));
          return { location, marker };
        });
        onStatus("Map ready. Select a location to view its talks.");
        if (selectedLocationIdRef.current) {
          startCameraFlight(selectedLocationIdRef.current);
        } else {
          locateUser({ fallbackToAllTalks: true });
        }
      })
      .catch((error) => onStatus(error.message));

    return () => {
      cancelled = true;
      supersedeGeolocationRequest();
      cancelCameraFlight();
      mapListeners.forEach((listener) => listener.remove());
      googleMarkersRef.current.forEach(({ marker }) => marker.setMap(null));
      currentLocationMarkerRef.current.google?.setMap(null);
      googleMapRef.current = null;
      googleMarkersRef.current = [];
    };
  }, [cancelCameraFlight, locateUser, locations, notifyVisibleChange, onSelect, onStatus, startCameraFlight, supersedeGeolocationRequest, viewAllTalks]);

  useEffect(() => {
    const provider = MAP_PROVIDERS[mapProvider];
    if (!provider) return;
    let cancelled = false;
    cancelCameraFlight();
    const savedCameraView = cameraViewRef.current ? { ...cameraViewRef.current } : null;
    googleElementRef.current.hidden = !isGoogleActive();
    leafletElementRef.current.hidden = isGoogleActive();
    if (isGoogleActive()) {
      if (googleMapRef.current) {
        mapsRef.current?.event.trigger(googleMapRef.current, "resize");
        if (savedCameraView) {
          googleMapRef.current.setCenter({ lat: savedCameraView.lat, lng: savedCameraView.lng });
          googleMapRef.current.setZoom(savedCameraView.zoom);
        }
        addGoogleCurrentLocationMarker();
      }
      return undefined;
    }

    const needsInitialView = !leafletMapRef.current;
    loadLeaflet()
      .then((leaflet) => {
        if (cancelled) return;
        if (!leafletMapRef.current) {
          leafletRef.current = leaflet;
          leafletMapRef.current = leaflet.map(leafletElementRef.current, {
            zoomControl: !window.matchMedia("(max-width: 640px)").matches,
          }).setView(
            savedCameraView ? [savedCameraView.lat, savedCameraView.lng] : [32, 12],
            savedCameraView?.zoom ?? 2,
          );
          leafletMapRef.current.attributionControl.setPrefix(false);
          leafletMapRef.current.createPane("referencePane");
          leafletMapRef.current.getPane("referencePane").style.zIndex = "300";
          leafletBoundsRef.current = leaflet.latLngBounds([]);
          leafletMarkersRef.current = locations.map((location) => {
            leafletBoundsRef.current.extend([location.lat, location.lng]);
            const marker = leaflet.marker([location.lat, location.lng], {
              title: `${location.city}, ${location.country}. ${location.talks.length} ${location.talks.length === 1 ? "talk" : "talks"}.`,
            }).addTo(leafletMapRef.current);
            marker.on("click", () => onSelect(location.id));
            return { location, marker };
          });
          leafletMapRef.current.on("moveend", notifyVisibleChange);
        }
        referenceLayersRef.current?.remove();
        referenceLayersRef.current = null;
        tileLayerRef.current?.remove();
        const tileOptions = {
          maxZoom: provider.maxZoom,
          minZoom: provider.minZoom,
        };
        if (mapProvider === "openstreetmap") {
          tileLayerRef.current = leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            ...tileOptions,
            attribution: getProviderAttribution("openstreetmap"),
          }).addTo(leafletMapRef.current);
        } else {
          tileLayerRef.current = leaflet.tileLayer(
            `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${nasaImageryDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
            {
              ...tileOptions,
              attribution: getProviderAttribution("nasa", nasaImageryDate),
            },
          ).addTo(leafletMapRef.current);
          referenceLayersRef.current = leaflet.layerGroup(
            NASA_REFERENCE_LAYERS.map(({ layerName, matrixSet }) =>
              leaflet.tileLayer(`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerName}/default/${matrixSet}/{z}/{y}/{x}.png`, {
                pane: "referencePane",
                maxZoom: provider.maxZoom,
                minZoom: provider.minZoom,
              }),
            ),
          ).addTo(leafletMapRef.current);
        }
        leafletMapRef.current.setMaxZoom(provider.maxZoom);
        leafletMapRef.current.setMinZoom(provider.minZoom);
        leafletMapRef.current.invalidateSize();
        if (currentPositionRef.current) {
          addLeafletCurrentLocationMarker();
        }
        if (selectedLocationIdRef.current) {
          startCameraFlight(selectedLocationIdRef.current);
        } else if (savedCameraView) {
          leafletMapRef.current.setView(
            [savedCameraView.lat, savedCameraView.lng],
            savedCameraView.zoom,
            { animate: false },
          );
        } else if (needsInitialView) {
          viewAllTalks();
        }
      })
      .catch((error) => onStatus(error.message));

    return () => { cancelled = true; };
  }, [cancelCameraFlight, locations, mapProvider, nasaImageryDate, notifyVisibleChange, onSelect, onStatus, startCameraFlight, viewAllTalks]);

  useEffect(() => {
    if (mapsRef.current) {
      googleMarkersRef.current.forEach(({ location, marker }) => {
        marker.setIcon(googleMarkerIcon(mapsRef.current, location.id === selectedLocationId));
        marker.setZIndex(location.id === selectedLocationId ? 500 : undefined);
      });
    }
    startCameraFlight(selectedLocationId);
    return cancelCameraFlight;
  }, [cancelCameraFlight, selectedLocationId, selectionRequest, startCameraFlight]);

  useEffect(() => () => {
    leafletMapRef.current?.remove();
    leafletMapRef.current = null;
    leafletMarkersRef.current = [];
  }, []);

  return (
    <div className="map-canvas" aria-label="Interactive map of talk locations">
      <div ref={googleElementRef} className="map-canvas__surface" hidden={!isGoogleActive()} />
      <div ref={leafletElementRef} className="map-canvas__surface" hidden={isGoogleActive()} />
    </div>
  );
});
