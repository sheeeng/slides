import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapCanvas } from "./MapCanvas.jsx";
import { DEFAULT_MAP_PROVIDER, formatImageryDate, getNasaImageryDate, MAP_PROVIDERS } from "./mapProviders.js";
import { groupTalksByLocation, listTalksByDate, listVideosByDate, parseTalks } from "./talks.js";

function formatDate(date) {
  if (!date || /^\d{4}$/.test(date)) return date || "Date unavailable";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TalkCard({ location, selectedTalkTitle, onClose }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (location) cardRef.current?.focus();
  }, [location, selectedTalkTitle]);

  if (!location) return null;
  return (
    <aside ref={cardRef} className="talk-card" aria-label={`Talks in ${location.city}`} tabIndex="-1">
      <div className="talk-card__header">
        <div>
          <span className="talk-card__label">Selected Location</span>
          <h2>{location.city}, {location.country}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Close talk details">×</button>
      </div>
      <div className="talk-card__list">
        {location.talks.map((talk) => (
          <article className={`talk-card__item ${talk.title === selectedTalkTitle ? "talk-card__item--active" : ""}`} key={`${talk.date}-${talk.title}`}>
            <div className="talk-card__meta">{formatDate(talk.date)}{talk.event ? ` · ${talk.event}` : ""}</div>
            <h3>{talk.title}</h3>
            <div className="talk-card__links">
              {talk.url && <a href={talk.url}>Open Slides <span aria-hidden="true">↗</span></a>}
              {talk.video && <a href={talk.video} target="_blank" rel="noopener noreferrer">Watch Video <span aria-hidden="true">↗</span></a>}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

function TalkBrowser({ entries, mode, onSelect }) {
  return (
    <aside className="talk-browser" aria-label={`Browse ${mode}`}>
      <div className="talk-browser__header">
        <span>{mode === "videos" ? "Recording Archive" : "Talk Archive"}</span>
        <span>{entries.length} {mode === "videos" ? "Recordings" : "Talks"}</span>
      </div>
      <div className="talk-browser__list">
        {entries.map(({ locationId, city, country, talk }) => (
          <article className="talk-browser__item" key={`${locationId}-${talk.date}-${talk.title}`}>
            <button type="button" onClick={() => onSelect(locationId, talk.title)}>
              <span className="talk-browser__date">{formatDate(talk.date)}</span>
              <strong>{talk.title}</strong>
              <span>{city}, {country}</span>
            </button>
            <div className="talk-browser__links">
              {talk.url && <a href={talk.url}>Slides <span aria-hidden="true">↗</span></a>}
              {talk.video && <a href={talk.video} target="_blank" rel="noopener noreferrer">Video <span aria-hidden="true">↗</span></a>}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

function ProviderSelector({ selectedProvider, onSelect, nasaImageryDate }) {
  return (
    <div className="provider-control">
      <span className="provider-control__label">Map Style</span>
      <div className="provider-selector" aria-label="Map style">
        {Object.entries(MAP_PROVIDERS).map(([providerId, provider]) => (
          <button
            type="button"
            key={providerId}
            aria-pressed={selectedProvider === providerId}
            onClick={() => onSelect(providerId)}
          >
            {provider.label}
          </button>
        ))}
      </div>
      <p className="provider-attribution">
        {selectedProvider === "google" && <a href="https://maps.google.com/">Google Maps</a>}
        {selectedProvider === "openstreetmap" && <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>}
        {selectedProvider === "nasa" && <><a href="https://earthdata.nasa.gov/worldview">NASA Earthdata.</a><span>Imagery from {formatImageryDate(nasaImageryDate)}.</span></>}
      </p>
    </div>
  );
}

export function App() {
  const mapControllerRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectionRequest, setSelectionRequest] = useState(0);
  const [selectedTalkTitle, setSelectedTalkTitle] = useState(null);
  const [browserMode, setBrowserMode] = useState(null);
  const [mapProvider, setMapProvider] = useState(DEFAULT_MAP_PROVIDER);
  const [status, setStatus] = useState("Loading talk locations.");
  const nasaImageryDate = useMemo(() => getNasaImageryDate(), []);

  useEffect(() => {
    let cancelled = false;
    fetch("./talks.toml")
      .then((response) => {
        if (!response.ok) throw new Error("Talk locations could not load.");
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        const groupedLocations = groupTalksByLocation(parseTalks(text));
        setLocations(groupedLocations);
        setStatus(`${groupedLocations.length} talk locations loaded.`);
      })
      .catch((error) => setStatus(error.message));
    return () => { cancelled = true; };
  }, []);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) || null,
    [locations, selectedLocationId],
  );
  const talkEntries = useMemo(() => listTalksByDate(locations), [locations]);
  const videoEntries = useMemo(() => listVideosByDate(locations), [locations]);
  const selectLocation = useCallback((locationId, talkTitle = null) => {
    setSelectedLocationId(locationId);
    setSelectedTalkTitle(talkTitle);
    setSelectionRequest((currentRequest) => currentRequest + 1);
  }, []);
  const updateStatus = useCallback((message) => setStatus(message), []);

  return (
    <div className={`app-shell ${selectedLocation ? "app-shell--details-open" : ""}`}>
      {locations.length > 0 && <MapCanvas ref={mapControllerRef} locations={locations} selectedLocationId={selectedLocationId} selectionRequest={selectionRequest} mapProvider={mapProvider} nasaImageryDate={nasaImageryDate} onSelect={selectLocation} onStatus={updateStatus} />}
      <div className="left-rail">
        <section className="identity-panel">
          <div className="identity-panel__header">
            <a className="identity-panel__title" href="index.html">Leonard's Slides</a>
            <nav className="landing-links" aria-label="Main landing page">
              <a href="index.html">Slides</a>
              <a href="index.html">Videos</a>
            </nav>
          </div>
          <ProviderSelector selectedProvider={mapProvider} onSelect={setMapProvider} nasaImageryDate={nasaImageryDate} />
          <div className="map-actions" aria-label="Map controls">
            <button type="button" aria-expanded={browserMode === "talks"} onClick={() => setBrowserMode((mode) => mode === "talks" ? null : "talks")}>Browse Talks</button>
            <button type="button" aria-expanded={browserMode === "videos"} onClick={() => setBrowserMode((mode) => mode === "videos" ? null : "videos")}>Browse Recordings</button>
            <button type="button" onClick={() => mapControllerRef.current?.locateUser()}>Locate Me</button>
            <button type="button" onClick={() => { setSelectedLocationId(null); setSelectedTalkTitle(null); mapControllerRef.current?.viewAllTalks(); }}>View All</button>
          </div>
          <p className="map-status" aria-live="polite">{status}</p>
        </section>
        {browserMode && <TalkBrowser entries={browserMode === "videos" ? videoEntries : talkEntries} mode={browserMode} onSelect={selectLocation} />}
      </div>
      <TalkCard location={selectedLocation} selectedTalkTitle={selectedTalkTitle} onClose={() => { setSelectedLocationId(null); setSelectedTalkTitle(null); }} />
    </div>
  );
}
