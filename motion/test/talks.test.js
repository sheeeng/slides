import assert from "node:assert/strict";
import test from "node:test";
import { groupTalksByLocation, listTalksByDate, listVideosByDate, parseTalks } from "../src/talks.js";

const fixture = `
[[talk]]
title = "Second Talk"
event = "Conference B"
date = "2026-04-02"
country = "Norway"
city = "Oslo"
lat = 59.9139
lng = 10.7522
url = "second/"
video = "https://example.com/second-video"

[[talk]]
title = "First Talk"
event = "Conference A"
date = "2019-09-10"
country = "Norway"
city = "Oslo"
lat = 59.9139
lng = 10.7522
`;

test("parseTalks reads strings and coordinates", () => {
  const talks = parseTalks(fixture);

  assert.equal(talks.length, 2);
  assert.equal(talks[0].title, "Second Talk");
  assert.equal(talks[0].lat, 59.9139);
  assert.equal(talks[0].lng, 10.7522);
});

test("groupTalksByLocation combines a city and sorts its talks", () => {
  const [location] = groupTalksByLocation(parseTalks(fixture));

  assert.equal(location.city, "Oslo");
  assert.equal(location.id, "59.9139:10.7522:Oslo:Norway");
  assert.equal(location.talks.length, 2);
  assert.deepEqual(location.talks.map((talk) => talk.title), ["First Talk", "Second Talk"]);
});

test("listTalksByDate returns newest talks first with location identifiers", () => {
  const locations = groupTalksByLocation(parseTalks(fixture));
  const entries = listTalksByDate(locations);

  assert.deepEqual(entries.map(({ talk }) => talk.title), ["Second Talk", "First Talk"]);
  assert.equal(entries[0].locationId, locations[0].id);
});

test("listVideosByDate returns only talks with videos", () => {
  const locations = groupTalksByLocation(parseTalks(fixture));

  assert.deepEqual(listVideosByDate(locations).map(({ talk }) => talk.title), ["Second Talk"]);
});
