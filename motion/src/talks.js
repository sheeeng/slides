export function parseTalks(text) {
  const talks = [];
  let currentTalk = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (line === "[[talk]]") {
      currentTalk = {};
      talks.push(currentTalk);
      continue;
    }
    if (!currentTalk) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    currentTalk[key] = rawValue.startsWith('"') && rawValue.endsWith('"')
      ? rawValue.slice(1, -1)
      : Number(rawValue);
  }

  return talks.filter((talk) => Number.isFinite(talk.lat) && Number.isFinite(talk.lng) && talk.city && talk.country);
}

export function groupTalksByLocation(talks) {
  const locations = new Map();

  for (const talk of talks) {
    const key = `${talk.lat}:${talk.lng}:${talk.city}:${talk.country}`;
    if (!locations.has(key)) {
      locations.set(key, { id: key, city: talk.city, country: talk.country, lat: talk.lat, lng: talk.lng, talks: [] });
    }
    locations.get(key).talks.push(talk);
  }

  return [...locations.values()].map((location) => ({
    ...location,
    talks: location.talks.sort((firstTalk, secondTalk) => String(firstTalk.date).localeCompare(String(secondTalk.date))),
  }));
}

export function listTalksByDate(locations) {
  return locations
    .flatMap((location) => location.talks.map((talk) => ({ locationId: location.id, city: location.city, country: location.country, talk })))
    .sort((firstEntry, secondEntry) => String(secondEntry.talk.date).localeCompare(String(firstEntry.talk.date)));
}

export function listVideosByDate(locations) {
  return listTalksByDate(locations).filter(({ talk }) => talk.video);
}
