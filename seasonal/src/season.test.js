import assert from "node:assert/strict";
import test from "node:test";

import {
  getSeasonDefinition,
  getSeasonForMonth,
  getSeasonFromForecast,
  getSeasonFromDailyMeans,
  getOsloForecastPeriods,
  getOsloWeather,
  formatOsloIsoTime,
  formatOsloTime,
  formatOsloWeather,
  formatOsloWeatherDetails,
  formatOsloWeatherSummary,
} from "./season.js";

test("maps Northern Hemisphere meteorological seasons", () => {
  assert.equal(getSeasonForMonth(0), "winter");
  assert.equal(getSeasonForMonth(2), "spring");
  assert.equal(getSeasonForMonth(5), "summer");
  assert.equal(getSeasonForMonth(8), "autumn");
  assert.equal(getSeasonForMonth(11), "winter");
  assert.equal(getSeasonDefinition("winter").variant, "sequoia-mist");
});

test("applies MET Norway temperature thresholds to seven day means", () => {
  assert.equal(getSeasonFromDailyMeans([11, 12, 13, 14, 15, 16, 17], 5), "summer");
  assert.equal(getSeasonFromDailyMeans([-1, -2, -3, -4, -5, -6, -7], 0), "winter");
  assert.equal(getSeasonFromDailyMeans([2, 3, 4, 5, 6, 7, 8], 3), "spring");
  assert.equal(getSeasonFromDailyMeans([8, 7, 6, 5, 4, 3, 2], 9), "autumn");
  assert.throws(() => getSeasonFromDailyMeans([11, 12], 5), /Seven daily/);
});

test("calculates daily means from an Oslo forecast", () => {
  const timeseries = [];
  for (let day = 2; day <= 8; day += 1) {
    timeseries.push({
      time: `2026-06-${String(day).padStart(2, "0")}T12:00:00Z`,
      data: { instant: { details: { air_temperature: 14 } } },
    });
  }

  assert.equal(
    getSeasonFromForecast(
      { properties: { timeseries } },
      new Date("2026-06-01T12:00:00Z"),
    ),
    "summer",
  );
});

test("formats the current Oslo weather condition", () => {
  const forecast = {
    properties: {
      timeseries: [
        {
          time: "2026-09-22T12:00:00Z",
          data: {
            instant: {
              details: {
                air_pressure_at_sea_level: 1026.5,
                air_temperature: 14.4,
                cloud_area_fraction: 38.8,
                relative_humidity: 47.5,
                wind_from_direction: 199,
                wind_speed: 3.2,
              },
            },
            next_1_hours: {
              summary: {
                symbol_code: "fair_day",
              },
              details: {
                precipitation_amount: 0,
              },
            },
            next_6_hours: {
              summary: {
                symbol_code: "rain",
              },
              details: {
                precipitation_amount: 2.4,
              },
            },
            next_12_hours: {
              summary: {
                symbol_code: "partlycloudy_day",
              },
              details: {},
            },
          },
        },
      ],
    },
  };
  const weather = getOsloWeather(forecast, new Date("2026-09-22T12:20:00Z"));

  assert.equal(formatOsloIsoTime(new Date("2026-09-22T12:00:00Z")), "2026-09-22T14:00:00+02:00");
  assert.equal(
    formatOsloTime(new Date("2026-09-22T12:00:00Z")),
    "September 22, 2026, at 14:00 CEST",
  );
  assert.equal(weather.time, "2026-09-22T14:00:00+02:00");
  assert.equal(
    formatOsloWeather(weather),
    "Oslo 🇳🇴 · 14.4°C · Few Clouds 🌤️ · Wind 3.2 m/s from SSW.",
  );
  assert.deepEqual(formatOsloWeatherSummary(weather), [
    "Oslo 🇳🇴",
    "14.4°C",
    "Few Clouds 🌤️",
    "Wind 3.2 m/s from SSW",
  ]);
  assert.deepEqual(formatOsloWeatherDetails(weather), [
    { label: "Pressure", value: "1026.5 hPa" },
    { label: "Cloud cover", value: "38.8%" },
    { label: "Humidity", value: "47.5%" },
  ]);
  assert.deepEqual(
    getOsloForecastPeriods(forecast, new Date("2026-09-22T12:20:00Z")),
    [
      {
        label: "Next Hour",
        condition: "Few Clouds",
        emoji: "🌤️",
        precipitation: "0 mm",
      },
      {
        label: "Next 6 Hours",
        condition: "Rain",
        emoji: "🌧️",
        precipitation: "2.4 mm",
      },
      {
        label: "Next 12 Hours",
        condition: "Partly Cloudy",
        emoji: "⛅",
        precipitation: null,
      },
    ],
  );
});
