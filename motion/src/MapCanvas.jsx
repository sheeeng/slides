import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { getCameraFlightFrame } from "./cameraFlight.js";
import {
  DEFAULT_MAP_PROVIDER,
  getNasaTileUrl,
  getOpenStreetMapTileUrl,
  MAP_PROVIDERS,
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

function markerIcon(maps, active) {
  return {
    path: maps.SymbolPath.CIRCLE,
    fillColor: active ? "#34268f" : "#6655cc",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: active ? 4 : 3,
    scale: active ? 18 : 15,
  };
}

function registerProviderMapTypes(maps, map, nasaImageryDate) {
  const openStreetMapType = new maps.ImageMapType({
    alt: "OpenStreetMap standard raster tiles",
    getTileUrl: (coordinate, zoom) => {
      const tileUrl = getOpenStreetMapTileUrl({ x: coordinate.x, y: coordinate.y }, zoom);
      return tileUrl || "";
    },
    maxZoom: MAP_PROVIDERS.openstreetmap.maxZoom,
    minZoom: MAP_PROVIDERS.openstreetmap.minZoom,
    name: "OpenStreetMap",
    tileSize: new maps.Size(256, 256),
  });
  const nasaMapType = new maps.ImageMapType({
    alt: "NASA Worldview MODIS Terra corrected reflectance true color imagery",
    getTileUrl: (coordinate, zoom) => {
      const tileUrl = getNasaTileUrl({ x: coordinate.x, y: coordinate.y }, zoom, nasaImageryDate);
      return tileUrl || "";
    },
    maxZoom: MAP_PROVIDERS.nasa.maxZoom,
    minZoom: MAP_PROVIDERS.nasa.minZoom,
    name: "NASA Worldview",
    tileSize: new maps.Size(256, 256),
  });

  map.mapTypes.set(MAP_PROVIDERS.openstreetmap.mapTypeId, openStreetMapType);
  map.mapTypes.set(MAP_PROVIDERS.nasa.mapTypeId, nasaMapType);
  map.setMapTypeId(MAP_PROVIDERS[DEFAULT_MAP_PROVIDER].mapTypeId);
}

export const MapCanvas = forwardRef(function MapCanvas(
  { locations, selectedLocationId, selectionRequest, mapProvider, nasaImageryDate, onSelect, onStatus },
  controllerRef,
) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const mapsRef = useRef(null);
  const markersRef = useRef([]);
  const currentLocationMarkerRef = useRef(null);
  const boundsRef = useRef(null);
  const cameraFlightFrameRef = useRef(null);
  const geolocationRequestGenerationRef = useRef(0);
  const selectedLocationIdRef = useRef(selectedLocationId);

  selectedLocationIdRef.current = selectedLocationId;

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

  const viewAllTalks = useCallback(() => {
    supersedeGeolocationRequest();
    cancelCameraFlight();
    if (mapRef.current && boundsRef.current) {
      mapRef.current.fitBounds(boundsRef.current, 96);
      onStatus("Map view reset.");
    }
  }, [cancelCameraFlight, onStatus, supersedeGeolocationRequest]);

  const locateUser = useCallback(() => {
    const requestGeneration = supersedeGeolocationRequest();
    cancelCameraFlight();
    if (!navigator.geolocation || !mapRef.current) {
      onStatus("Current location is not available in this browser.");
      return;
    }
    onStatus("Finding your current location.");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (requestGeneration !== geolocationRequestGenerationRef.current) return;
        const position = { lat: coords.latitude, lng: coords.longitude };
        currentLocationMarkerRef.current?.setMap(null);
        currentLocationMarkerRef.current = new mapsRef.current.Marker({
          map: mapRef.current,
          position,
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
        mapRef.current.panTo(position);
        mapRef.current.setZoom(4);
        onStatus("Map centered on your current location.");
      },
      () => {
        if (requestGeneration === geolocationRequestGenerationRef.current) {
          onStatus("Location access was not granted. The talk locations remain visible.");
        }
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [cancelCameraFlight, onStatus, supersedeGeolocationRequest]);

  const startCameraFlight = useCallback((locationId) => {
    const location = locations.find(({ id }) => id === locationId);
    if (!location || !mapRef.current) return;

    supersedeGeolocationRequest();
    cancelCameraFlight();
    const currentCenter = mapRef.current.getCenter();
    const startCenter = { lat: currentCenter.lat(), lng: currentCenter.lng() };
    const destination = { lat: location.lat, lng: location.lng };
    const startZoom = mapRef.current.getZoom();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function applyFrame(frame) {
      if (typeof mapRef.current.moveCamera === "function") {
        mapRef.current.moveCamera({ center: frame.center, zoom: frame.zoom });
      } else {
        mapRef.current.setCenter(frame.center);
        mapRef.current.setZoom(frame.zoom);
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
        mapRef.current = new maps.Map(mapElementRef.current, {
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
        registerProviderMapTypes(maps, mapRef.current, nasaImageryDate);
        boundsRef.current = new maps.LatLngBounds();
        markersRef.current = locations.map((location) => {
          const position = { lat: location.lat, lng: location.lng };
          boundsRef.current.extend(position);
          const marker = new maps.Marker({
            map: mapRef.current,
            position,
            title: `${location.city}, ${location.country}. ${location.talks.length} ${location.talks.length === 1 ? "talk" : "talks"}.`,
            icon: markerIcon(maps, location.id === selectedLocationIdRef.current),
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
          viewAllTalks();
          locateUser();
        }
      })
      .catch((error) => onStatus(error.message));

    return () => {
      cancelled = true;
      supersedeGeolocationRequest();
      cancelCameraFlight();
      mapListeners.forEach((listener) => listener.remove());
      markersRef.current.forEach(({ marker }) => marker.setMap(null));
      currentLocationMarkerRef.current?.setMap(null);
      mapRef.current = null;
      markersRef.current = [];
      mapListeners = [];
    };
  }, [cancelCameraFlight, locateUser, locations, nasaImageryDate, onSelect, onStatus, startCameraFlight, supersedeGeolocationRequest, viewAllTalks]);

  useEffect(() => {
    const provider = MAP_PROVIDERS[mapProvider];
    if (!mapRef.current || !provider) return;
    mapRef.current.setMapTypeId(provider.mapTypeId);
    mapRef.current.setOptions({ minZoom: provider.minZoom, maxZoom: provider.maxZoom });
    mapsRef.current?.event.trigger(mapRef.current, "resize");
  }, [mapProvider]);

  useEffect(() => {
    if (mapsRef.current) {
      markersRef.current.forEach(({ location, marker }) => {
        marker.setIcon(markerIcon(mapsRef.current, location.id === selectedLocationId));
        marker.setZIndex(location.id === selectedLocationId ? 500 : undefined);
      });
    }
    startCameraFlight(selectedLocationId);
    return cancelCameraFlight;
  }, [cancelCameraFlight, selectedLocationId, selectionRequest, startCameraFlight]);

  return (
    <div className="map-canvas" aria-label="Interactive map of talk locations">
      <div ref={mapElementRef} className="map-canvas__surface map-canvas__surface--google" />
    </div>
  );
});
