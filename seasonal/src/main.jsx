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
    weatherSummary.classList.remove("weather-summary");
    weatherSummary.setAttribute("aria-label", weather.weatherText);
    weatherSummary.textContent = weather.weatherText;
    const weatherDetails = document.getElementById("oslo-weather-details");
    weatherDetails.replaceChildren();
    weatherDetails.hidden = true;
    document.getElementById("oslo-forecast").hidden = true;
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
    const weatherDetails = document.getElementById("oslo-weather-details");
    weatherDetails.replaceChildren();
    weatherDetails.hidden = true;
    document.getElementById("oslo-forecast").hidden = true;
    console.warn(`Could not refresh the Oslo forecast season: ${error.message}`);
  }
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
