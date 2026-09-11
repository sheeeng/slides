import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { groupTalksByLocation, parseTalks } from "../src/talks.js";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const talks = parseTalks(readFileSync(new URL("../../talks.toml", import.meta.url), "utf8"));
const locations = groupTalksByLocation(talks);

test("the landing page orders the static slides newest first", () => {
  const slidesBlock = indexHtml.match(/<h2 class="section-heading" id="slides">Slides<\/h2>([\s\S]*?)<h2 class="section-heading" id="stats-heading">Statistics<\/h2>/)[1];
  const hrefs = [
    "reproducible-environments-docker-vs-nix/",
    "demystifying-the-nix-store/",
    "tracking-nixpkgs-merged-pull-requests/",
    "running-kernel-based-virtual-machine/",
    "governing-azure-resources-with-policy/",
    "https://events.csdn.net/QtDeveloperConference/Qt%20Cross-platform%20Development%20-%20MeeGo%20and%20Symbian.pdf",
  ];
  const positions = hrefs.map((href) => slidesBlock.indexOf(`href="${href}"`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((first, second) => first - second));
});

test("the landing page links to the full talk map", () => {
  assert.match(indexHtml, /<a class="talks-cta" href="talks\/">/);
  assert.match(indexHtml, /Explore Where I've Spoken/);
});

test("the landing page returns to the top from the talks and workshops tile", () => {
  assert.match(indexHtml, /href="#top"/);
  assert.match(indexHtml, /Talks &amp; Workshops/);
});

test("the landing page exposes an accessible video gallery", () => {
  assert.match(indexHtml, /class="video-gallery"/);
  assert.match(indexHtml, /class="video-gallery__thumbnail-link"/);
  assert.match(indexHtml, /class="video-gallery__button"[\s\S]*data-direction="previous"/);
  assert.match(indexHtml, /class="video-gallery__button"[\s\S]*data-direction="next"/);
  assert.match(indexHtml, /id="video-gallery-status"[\s\S]*aria-live="polite"/);
  assert.match(indexHtml, /class="video-gallery__fallback"/);
  assert.match(indexHtml, /href="https:\/\/vimeo\.com\/1223729965"/);
  assert.match(indexHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=4bwSRCTAAn0"/);
  assert.match(indexHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=wo38491N3Nw"/);
  assert.match(indexHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=mAZNlyXVoT4"/);
  assert.doesNotMatch(indexHtml, /media\/video-thumbnails/);
});

test("the landing page talk statistics match the talk archive", () => {
  assert.match(indexHtml, /function renderStats\(talks\)/);
  assert.match(indexHtml, /<div id="talk-stats" aria-live="polite"><\/div>/);
  assert.equal(locations.length, 5);
  assert.equal(talks.length, 7);
});

test("the landing page loads and uses Open Sans", () => {
  assert.match(indexHtml, /family=Open\+Sans/);
  assert.match(indexHtml, /font-family:\s*"Open Sans"/);
});
