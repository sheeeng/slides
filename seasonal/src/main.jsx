const seasonVariants = {
  spring: "sakura-sunset",
  summer: "living-green",
  autumn: "maple-autumn",
  winter: "sequoia-mist",
};

const requestedSeason = new URLSearchParams(window.location.search).get("season");
const forecastSeason = document.documentElement.dataset.season;
let seasonId = requestedSeason in seasonVariants
  ? requestedSeason
  : forecastSeason || "summer";
let sceneVariant = seasonVariants[seasonId] ?? seasonVariants.summer;
let sceneModule;

document.documentElement.dataset.season = seasonId;

async function mountSeasonalScene() {
  if (mountSeasonalScene.started) return;
  mountSeasonalScene.started = true;
  sceneModule = await import("./scene.jsx");
  sceneModule.mountSeasonalScene(document.getElementById("seasonal-scene"), sceneVariant);
}

async function refreshOsloSeason() {
  try {
    const { fetchOsloWeather } = await import("./weather.js");
    const weather = await fetchOsloWeather();
    const weatherSummary = document.getElementById("oslo-weather");
    weatherSummary.hidden = false;
    weatherSummary.classList.add("weather-summary");
    weatherSummary.setAttribute("aria-label", weather.weatherText);
    weatherSummary.replaceChildren(
      ...weather.weatherSummary.map(({ icon, value }) => {
        const item = document.createElement("span");
        item.className = "weather-summary-item";
        const text = document.createElement("span");
        text.textContent = value;
        if (icon) item.append(createWeatherIcon(icon));
        item.append(text);
        return item;
      }),
    );
    document.getElementById("oslo-weather-details").replaceChildren(
      ...weather.weatherDetails.map(({ icon, label, value, windBarb }) => {
        const reading = document.createElement("div");
        reading.className = "weather-reading";
        reading.setAttribute("aria-label", label);
        const description = document.createElement("dd");
        if (icon) description.append(createWeatherIcon(icon), " ");
        if (windBarb) description.append(createWindBarb(windBarb), " ");
        description.append(value);
        reading.replaceChildren(description);
        return reading;
      }),
    );
    const forecastPeriods = document.getElementById("oslo-forecast-periods");
    forecastPeriods.replaceChildren(
      ...weather.forecastPeriods.map(({ condition, icon, label, precipitation }) => {
        const card = document.createElement("div");
        card.className = "weather-period";
        const title = document.createElement("strong");
        title.textContent = label;
        const conditionLine = document.createElement("span");
        conditionLine.append(createWeatherIcon(icon), " ", condition);
        card.append(title, conditionLine);
        if (precipitation) {
          const precipitationLine = document.createElement("span");
          precipitationLine.className = "weather-period-precipitation";
          precipitationLine.textContent = `${precipitation} precipitation`;
          card.append(precipitationLine);
        }
        return card;
      }),
    );
    document.getElementById("oslo-forecast").hidden = false;
    const weatherAttribution = document.getElementById("oslo-weather-attribution");
    const weatherLink = weatherAttribution.querySelector("a");
    const weatherTime = document.createElement("time");
    weatherTime.dateTime = weather.time;
    weatherTime.textContent = weather.timeText;
    const forecastLabel = document.createElement("span");
    forecastLabel.className = "weather-forecast-time";
    forecastLabel.replaceChildren("Forecast for ", weatherTime, ".");
    const sourceLabel = document.createElement("span");
    sourceLabel.replaceChildren("Obtained from ", weatherLink, ".");
    weatherAttribution.replaceChildren(
      forecastLabel,
      sourceLabel,
    );
    if (requestedSeason) return;

    seasonId = weather.seasonId;
    if (seasonVariants[seasonId] === sceneVariant) return;
    sceneVariant = seasonVariants[seasonId];
    document.documentElement.dataset.season = seasonId;
    sceneModule?.mountSeasonalScene(
      document.getElementById("seasonal-scene"),
      sceneVariant,
    );
  } catch (error) {
    const weatherSummary = document.getElementById("oslo-weather");
    weatherSummary.hidden = false;
    weatherSummary.classList.remove("weather-summary");
    weatherSummary.removeAttribute("aria-label");
    weatherSummary.textContent = "Current weather for Oslo is unavailable.";
    document.getElementById("oslo-weather-details").replaceChildren();
    document.getElementById("oslo-forecast").hidden = true;
    console.warn(`Could not refresh the Oslo forecast season: ${error.message}`);
  }
}

function createWeatherIcon(icon) {
  const element = document.createElement("i");
  element.className = `wi ${icon}`;
  element.setAttribute("aria-hidden", "true");
  return element;
}

function createWindBarb({ direction, speed }) {
  const knots = Math.round(speed * 1.94384 / 5) * 5;
  const barb = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  barb.classList.add("wind-barb");
  barb.setAttribute("aria-hidden", "true");
  barb.setAttribute("viewBox", "0 0 32 32");
  barb.style.setProperty("--wind-direction", `${direction}deg`);

  if (knots === 0) {
    const calm = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    calm.setAttribute("cx", "16");
    calm.setAttribute("cy", "16");
    calm.setAttribute("r", "7");
    barb.append(calm);
    return barb;
  }

  const shaft = document.createElementNS("http://www.w3.org/2000/svg", "path");
  shaft.setAttribute("d", "M16 28V5");
  barb.append(shaft);

  let remaining = knots;
  let offset = 5;
  while (remaining >= 50) {
    const pennant = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    pennant.setAttribute("points", `16 ${offset},16 ${offset + 8},24 ${offset + 4}`);
    barb.append(pennant);
    remaining -= 50;
    offset += 8;
  }
  while (remaining >= 10) {
    const feather = document.createElementNS("http://www.w3.org/2000/svg", "path");
    feather.setAttribute("d", `M16 ${offset}l8 4`);
    barb.append(feather);
    remaining -= 10;
    offset += 4;
  }
  if (remaining === 5) {
    const feather = document.createElementNS("http://www.w3.org/2000/svg", "path");
    feather.setAttribute("d", `M16 ${offset}l4 2`);
    barb.append(feather);
  }

  return barb;
}

function scheduleScene() {
  if (requestedSeason in seasonVariants) {
    mountSeasonalScene();
    return;
  }
  window.setTimeout(mountSeasonalScene, 15000);
  window.addEventListener("pointerdown", mountSeasonalScene, { once: true, passive: true });
  window.addEventListener("keydown", mountSeasonalScene, { once: true });
  window.addEventListener("scroll", mountSeasonalScene, { once: true, passive: true });
}

function loadAnalytics() {
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=G-J5M1ZFQ070";
  document.head.append(script);
}

if (document.readyState === "complete") {
  scheduleScene();
  window.setTimeout(refreshOsloSeason, 4500);
  window.setTimeout(loadAnalytics, 15000);
} else {
  window.addEventListener("load", scheduleScene, { once: true });
  window.addEventListener("load", () => window.setTimeout(refreshOsloSeason, 4500), { once: true });
  window.addEventListener("load", () => window.setTimeout(loadAnalytics, 15000), { once: true });
}
