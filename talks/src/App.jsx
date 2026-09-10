import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapCanvas } from "./MapCanvas.jsx";
import { DEFAULT_MAP_PROVIDER, getNasaImageryDate, MAP_PROVIDERS } from "./mapProviders.js";
import { formatLocation, groupTalksByLocation, listTalksByDate, parseTalks } from "./talks.js";

function formatDate(date) {
  if (!date || /^\d{4}$/.test(date)) return date || "Date unavailable";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Typewriter({ text }) {
  return [...text].map((char, index) => (
    <span key={index} className="typewriter-char" style={{ "--index": index }}>
      {char}
    </span>
  ));
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
          <h2>{formatLocation(location.city, location.country)}</h2>
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
              {talk.repository && <a href={talk.repository} target="_blank" rel="noopener noreferrer">Repository <span aria-hidden="true">↗</span></a>}
              {talk.video && <a href={talk.video} target="_blank" rel="noopener noreferrer">Watch Video <span aria-hidden="true">↗</span></a>}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

function VisibleTalks({ entries, onSelect }) {
  return (
    <aside className="talk-browser" aria-label="Talks in the visible map area">
      <div className="talk-browser__header">
        <span>On This Map</span>
        <span>{entries.length} {entries.length === 1 ? "Talk" : "Talks"}</span>
      </div>
      <div className="talk-browser__list">
        {entries.length === 0 ? (
          <p className="talk-browser__empty">Pan or zoom the map to browse talks in view.</p>
        ) : entries.map(({ locationId, city, country, talk }) => (
          <article className="talk-browser__item" key={`${locationId}-${talk.date}-${talk.title}`}>
            <button type="button" onClick={() => onSelect(locationId, talk.title)}>
              <span className="talk-browser__date">{formatDate(talk.date)}</span>
              <strong>{talk.title}</strong>
              <span>{formatLocation(city, country)}</span>
            </button>
            <div className="talk-browser__links">
              {talk.url && <a href={talk.url}>Slides <span aria-hidden="true">↗</span></a>}
              {talk.repository && <a href={talk.repository} target="_blank" rel="noopener noreferrer">Repository <span aria-hidden="true">↗</span></a>}
              {talk.video && <a href={talk.video} target="_blank" rel="noopener noreferrer">Video <span aria-hidden="true">↗</span></a>}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

function ProviderSelector({ selectedProvider, onSelect }) {
  const entries = useMemo(() => Object.entries(MAP_PROVIDERS), []);
  const buttonRefs = useRef([]);
  const [pillStyle, setPillStyle] = useState({});

  useEffect(() => {
    function updatePill() {
      const index = entries.findIndex(([providerId]) => providerId === selectedProvider);
      const button = buttonRefs.current[index];
      if (button) {
        setPillStyle({ left: button.offsetLeft, width: button.offsetWidth });
      }
    }
    updatePill();
    window.addEventListener("resize", updatePill);
    return () => window.removeEventListener("resize", updatePill);
  }, [selectedProvider, entries]);

  return (
    <div className="provider-control">
      <div className="provider-selector" aria-label="Map style">
        <span className="provider-pill" aria-hidden="true" style={pillStyle} />
        {entries.map(([providerId, provider], index) => (
          <button
            type="button"
            key={providerId}
            ref={(element) => { buttonRefs.current[index] = element; }}
            aria-pressed={selectedProvider === providerId}
            onClick={() => onSelect(providerId)}
          >
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const mapControllerRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [visibleLocationIds, setVisibleLocationIds] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectionRequest, setSelectionRequest] = useState(0);
  const [selectedTalkTitle, setSelectedTalkTitle] = useState(null);
  const [mapProvider, setMapProvider] = useState(DEFAULT_MAP_PROVIDER);
  const [status, setStatus] = useState("Loading talk locations.");
  const nasaImageryDate = useMemo(() => getNasaImageryDate(), []);

  useEffect(() => {
    let cancelled = false;
    fetch("../talks.toml")
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

  const visibleLocations = useMemo(
    () => locations.filter((location) => visibleLocationIds.includes(location.id)),
    [locations, visibleLocationIds],
  );
  const visibleEntries = useMemo(() => listTalksByDate(visibleLocations), [visibleLocations]);
  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) || null,
    [locations, selectedLocationId],
  );
  const selectLocation = useCallback((locationId, talkTitle = null) => {
    setSelectedLocationId(locationId);
    setSelectedTalkTitle(talkTitle);
    setSelectionRequest((currentRequest) => currentRequest + 1);
  }, []);
  const handleVisibleChange = useCallback((locationIds) => {
    setVisibleLocationIds(locationIds);
  }, []);
  const updateStatus = useCallback((message) => setStatus(message), []);

  return (
    <div className={`app-shell ${selectedLocation ? "app-shell--details-open" : ""}`}>
      {locations.length > 0 && <MapCanvas ref={mapControllerRef} locations={locations} selectedLocationId={selectedLocationId} selectionRequest={selectionRequest} mapProvider={mapProvider} nasaImageryDate={nasaImageryDate} onSelect={selectLocation} onStatus={updateStatus} onVisibleChange={handleVisibleChange} />}
      <div className="left-rail">
        <section className="identity-panel">
          <div className="identity-panel__header">
            <a className="identity-panel__title" href="../index.html">
              <Typewriter text="Leonard's Talks" />
            </a>
          </div>
          <ProviderSelector selectedProvider={mapProvider} onSelect={setMapProvider} />
          <p className="map-status" aria-live="polite">{status}</p>
          <p className="identity-panel__build">
            Built from{" "}
            {__BUILD_SHA__ ? (
              <a href={`https://github.com/sheeeng/slides/commit/${__BUILD_SHA__}`}>{__BUILD_SHA__}</a>
            ) : (
              "unknown"
            )}
            {". "}Made with 💚 by Leonard.
          </p>
        </section>
        <VisibleTalks entries={visibleEntries} onSelect={selectLocation} />
      </div>
      <TalkCard location={selectedLocation} selectedTalkTitle={selectedTalkTitle} onClose={() => { setSelectedLocationId(null); setSelectedTalkTitle(null); }} />
    </div>
  );
}
