import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

import {
  getSeasonForDate,
  getSeasonFromForecast,
} from "../src/season.js";

const sourcePath = new URL("../../index.html", import.meta.url);
const previewPath = new URL("../index.html", import.meta.url);
const publicPath = new URL("../public/", import.meta.url);

let documentSource = await readFile(sourcePath, "utf8");

async function getOsloForecastSeason() {
  const endpoint = new URL("https://api.met.no/weatherapi/locationforecast/2.0/compact");
  endpoint.searchParams.set("lat", "59.9139");
  endpoint.searchParams.set("lon", "10.7522");

  try {
    const response = await fetch(endpoint, {
      headers: {
        "User-Agent": "sheeeng-slides/1.0 https://github.com/sheeeng/slides",
      },
    });
    if (!response.ok) {
      throw new Error(`MET Norway returned HTTP ${response.status}.`);
    }

    return getSeasonFromForecast(await response.json());
  } catch (error) {
    console.warn(`Could not determine the Oslo forecast season: ${error.message}`);
    return getSeasonForDate();
  }
}

const forecastSeason = await getOsloForecastSeason();

documentSource = documentSource
  .replace('    <link rel="icon" type="image/x-icon" href="favicon.ico">\n', "")
  .replaceAll('    <link rel="preconnect" href="https://fonts.googleapis.com">\n', "")
  .replaceAll('    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n', "")
  .replace(
    /\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Open\+Sans[^"]+"\s+rel="preload"\s+as="style"\s*>/g,
    "",
  )
  .replace(
    /\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Open\+Sans[^"]+"\s+rel="stylesheet"\s*>/g,
    "",
  )
  .replace(
    /\s*<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-J5M1ZFQ070"\s*><\/script>/,
    "",
  )
  .replaceAll('src="video-gallery.js', 'src="/video-gallery.js')
  .replaceAll("https://sheeeng.github.io/logo.png", "logo-64.png")
  .replace(
    "https://i.vimeocdn.com/video/2197032329-1f2aa64b803f471dd153e2bf96a7b63cad9531a9d968f520d193e4171b4fa062-d_295x166?region=us",
    "video-thumbnail.jpg",
  );

const seasonalStyle = `
    <style>
      html {
        --season-wash: 250 251 252;
        background: var(--bg);
      }

      html[data-season="spring"] {
        --season-wash: 255 247 250;
        --season-fallback: #3c2c36;
      }

      html[data-season="summer"] {
        --season-wash: 246 250 244;
        --season-fallback: #4a4d44;
      }

      html[data-season="autumn"] {
        --season-wash: 252 247 240;
        --season-fallback: #313a41;
      }

      html[data-season="winter"] {
        --season-wash: 242 247 244;
        --season-fallback: #5f6d63;
      }

      body {
        position: relative;
        isolation: isolate;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: transparent;
      }

      body::before {
        display: none;
      }

      body::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        background:
          linear-gradient(
            90deg,
            rgb(var(--season-wash) / 8%) 0%,
            rgb(var(--season-wash) / 28%) 18%,
            rgb(var(--season-wash) / 62%) 32%,
            rgb(var(--season-wash) / 62%) 68%,
            rgb(var(--season-wash) / 28%) 82%,
            rgb(var(--season-wash) / 8%) 100%
          );
        pointer-events: none;
      }

      header,
      .section-heading,
      #talk-stats,
      .seasonal-attribution,
      footer {
        text-shadow:
          0 0 0.4rem var(--bg),
          0 0 1.4rem var(--bg);
      }

      #seasonal-scene {
        position: fixed;
        inset: 0;
        z-index: -2;
        background: var(--season-fallback, #4a4d44);
      }

      .video-gallery__thumbnail {
        height: auto;
      }

      .seasonal-attribution {
        max-width: 640px;
        margin: 0 auto;
        padding: 0 clamp(1rem, 4vw, 2rem) 0.75rem;
        color: var(--text-muted);
        font-size: 0.8125rem;
        text-align: center;
      }

      .seasonal-attribution p {
        margin: 0;
      }

      #oslo-weather-attribution {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.125rem;
        margin-bottom: 0.65rem;
      }

      .weather-forecast-time {
        white-space: nowrap;
      }

      #oslo-weather {
        margin-bottom: 0.65rem;
        color: var(--text);
        font-size: clamp(1rem, 2vw, 1.125rem);
        font-weight: 650;
      }

      #oslo-weather.weather-summary {
        display: grid;
        grid-template-columns: repeat(4, auto);
        gap: 0.5rem;
      }

      #oslo-weather-details {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.5rem;
        max-width: 32rem;
        margin: 0 auto 0.65rem;
      }

      .weather-summary-item,
      .weather-reading {
        padding: 0.5rem;
        border: 1px solid rgb(var(--season-wash) / 35%);
        border-radius: 0.5rem;
        background: rgb(var(--season-wash) / 16%);
      }

      .weather-summary-item {
        display: grid;
        place-items: center;
      }

      .weather-reading dt {
        font-size: 0.6875rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .weather-reading dd {
        margin: 0.125rem 0 0;
        color: var(--text);
        font-size: 0.9375rem;
        font-weight: 650;
      }

      .wind-barb {
        display: inline-block !important;
        width: 1.5rem !important;
        height: 1.5rem !important;
        max-width: none !important;
        margin: -0.25rem 0 -0.25rem -0.25rem;
        vertical-align: middle;
        transform: rotate(var(--wind-direction));
      }

      .wind-barb path {
        fill: none;
        stroke: currentColor;
        stroke-linecap: round;
        stroke-width: 2;
      }

      #oslo-forecast {
        margin-bottom: 0.65rem;
      }

      .weather-period-heading {
        margin-bottom: 0.35rem;
        font-size: 0.6875rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      #oslo-forecast-periods {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.5rem;
      }

      .weather-period {
        display: grid;
        gap: 0.125rem;
        padding: 0.5rem;
        border: 1px solid rgb(var(--season-wash) / 35%);
        border-radius: 0.5rem;
        background: rgb(var(--season-wash) / 16%);
      }

      .weather-period-precipitation {
        color: var(--text-muted);
      }

      .seasonal-attribution a {
        color: var(--link);
        text-decoration: underline;
        text-underline-offset: 0.15em;
      }

      @media (prefers-color-scheme: dark) {
        html {
          --season-wash: 13 17 23;
        }

        body::after {
          background:
            linear-gradient(
              90deg,
              rgb(var(--season-wash) / 8%) 0%,
              rgb(var(--season-wash) / 32%) 18%,
              rgb(var(--season-wash) / 66%) 32%,
              rgb(var(--season-wash) / 66%) 68%,
              rgb(var(--season-wash) / 32%) 82%,
              rgb(var(--season-wash) / 8%) 100%
            );
        }
      }

      @media (max-width: 720px) {
        body::after {
          background: rgb(var(--season-wash) / 56%);
        }

        #oslo-weather-details {
          grid-template-columns: 1fr;
        }

        #oslo-weather.weather-summary {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        #oslo-forecast-periods {
          grid-template-columns: 1fr;
        }
      }
    </style>`;

documentSource = documentSource
  .replace('<html lang="en">', `<html lang="en" data-season="${forecastSeason}">`)
  .replace("</head>", `${seasonalStyle}\n  </head>`)
  .replace(
    '<body id="top">',
    '<body id="top">\n    <div id="seasonal-scene" aria-hidden="true"></div>\n    <script type="module" src="/src/main.jsx"></script>',
  )
  .replace(
    "    <footer>",
    `    <div class="seasonal-attribution">
      <p id="oslo-weather-attribution"><span>Obtaining forecast data by <a href="https://api.met.no/" target="_blank" rel="noopener noreferrer">MET Norway</a>.</span></p>
      <p id="oslo-weather" aria-live="polite" hidden></p>
      <dl id="oslo-weather-details"></dl>
      <div id="oslo-forecast" hidden>
        <p class="weather-period-heading">Forecast Periods</p>
        <div id="oslo-forecast-periods"></div>
      </div>
      <p>Seasonal background by <a href="https://threeui.com/browse" target="_blank" rel="noopener noreferrer">Three UI</a>.</p>
    </div>
    <footer>`,
  );

await mkdir(publicPath, { recursive: true });
for (const fileName of [
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "favicon-16x16.png",
  "favicon-32x32.png",
  "favicon.ico",
  "site.webmanifest",
  "talks.toml",
  "video-gallery.js",
]) {
  await cp(new URL(`../../${fileName}`, import.meta.url), new URL(fileName, publicPath));
}
await cp(new URL("../logo-64.png", import.meta.url), new URL("logo-64.png", publicPath));
await cp(
  new URL("../video-thumbnail.jpg", import.meta.url),
  new URL("video-thumbnail.jpg", publicPath),
);
await cp(
  new URL("../../media/icons/animated/", import.meta.url),
  new URL("media/icons/animated/", publicPath),
  { recursive: true },
);
await cp(
  new URL("../../media/icons/static/emoji_u1f5fa.png", import.meta.url),
  new URL("media/icons/static/emoji_u1f5fa.png", publicPath),
);

await writeFile(previewPath, documentSource);
