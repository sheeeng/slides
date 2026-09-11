import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  initializeVideoGallery,
  moveVideoIndex,
  validateVideoData,
} from "../../video-gallery.js";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  contains(value) {
    return this.values.has(value);
  }

  remove(value) {
    this.values.delete(value);
  }
}

class FakeElement {
  constructor({ href = "", textContent = "" } = {}) {
    this.classList = new FakeClassList();
    this.disabled = false;
    this.href = href;
    this.listeners = new Map();
    this.textContent = textContent;
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  removeEventListener(type, listener) {
    if (this.listeners.get(type) === listener) {
      this.listeners.delete(type);
    }
  }

  dispatch(type) {
    this.listeners.get(type)?.();
  }
}

function createGalleryRoot(data) {
  const elements = {
    "#video-gallery-data": new FakeElement({
      textContent: JSON.stringify(data),
    }),
    ".video-gallery__visual-title": new FakeElement(),
    ".video-gallery__visual-provider": new FakeElement(),
    ".video-gallery__title": new FakeElement(),
    ".video-gallery__meta": new FakeElement(),
    ".video-gallery__link": new FakeElement(),
    ".video-gallery__status": new FakeElement(),
    '[data-direction="previous"]': new FakeElement(),
    '[data-direction="next"]': new FakeElement(),
  };
  const root = new FakeElement();
  root.querySelector = (selector) => elements[selector] ?? null;

  return { elements, root };
}

function readEmbeddedVideos() {
  const match = indexHtml.match(
    /<script type="application\/json" id="video-gallery-data">([\s\S]*?)<\/script>/,
  );

  assert.ok(match);
  return JSON.parse(match[1]);
}

const videos = readEmbeddedVideos();

test("next wraps from the final video to the first", () => {
  assert.equal(moveVideoIndex(3, 1, 4), 0);
});

test("previous wraps from the first video to the final", () => {
  assert.equal(moveVideoIndex(0, -1, 4), 3);
});

test("video data validation rejects invalid values", () => {
  assert.equal(validateVideoData([]), false);
  assert.equal(validateVideoData(null), false);
  assert.equal(
    validateVideoData([
      { title: "Talk", provider: "Vimeo", meta: "Recording", url: "" },
    ]),
    false,
  );
});

test("the embedded video data uses the required order", () => {
  assert.deepEqual(
    videos.map(({ url }) => url),
    [
      "https://vimeo.com/1223729965",
      "https://www.youtube.com/watch?v=4bwSRCTAAn0",
      "https://www.youtube.com/watch?v=wo38491N3Nw",
      "https://www.youtube.com/watch?v=mAZNlyXVoT4",
    ],
  );
});

test("the static default matches the newest embedded video", () => {
  const staticTitle = indexHtml.match(
    /<h3 class="video-gallery__title" id="video-gallery-title">([\s\S]*?)<\/h3>/,
  );
  const staticLink = indexHtml.match(
    /<a\s+class="video-gallery__link"\s+href="([^"]+)"/,
  );

  assert.ok(staticTitle);
  assert.ok(staticLink);
  assert.equal(staticTitle[1].replace(/\s+/g, " ").trim(), videos[0].title);
  assert.equal(staticLink[1], videos[0].url);
});

test("initialization renders the newest video and enables navigation", () => {
  const { elements, root } = createGalleryRoot(videos);

  assert.equal(initializeVideoGallery(root), true);
  assert.equal(root.classList.contains("video-gallery--enhanced"), true);
  assert.equal(elements['[data-direction="previous"]'].disabled, false);
  assert.equal(elements['[data-direction="next"]'].disabled, false);
  assert.equal(elements[".video-gallery__title"].textContent, videos[0].title);
  assert.equal(elements[".video-gallery__status"].textContent, "1 of 4");

  elements['[data-direction="previous"]'].dispatch("click");
  assert.equal(elements[".video-gallery__title"].textContent, videos[3].title);
  assert.equal(elements[".video-gallery__status"].textContent, "4 of 4");
});

test("invalid embedded data leaves the gallery disabled", () => {
  const { elements, root } = createGalleryRoot([]);

  assert.equal(initializeVideoGallery(root), false);
  assert.equal(root.classList.contains("video-gallery--enhanced"), false);
  assert.equal(elements['[data-direction="previous"]'].disabled, true);
  assert.equal(elements['[data-direction="next"]'].disabled, true);
});

test("navigation rendering failure restores the disabled fallback state", () => {
  const { elements, root } = createGalleryRoot(videos);
  const visualTitle = elements[".video-gallery__visual-title"];

  assert.equal(initializeVideoGallery(root), true);
  Object.defineProperty(visualTitle, "textContent", {
    configurable: true,
    set() {
      throw new Error("Simulated rendering failure.");
    },
  });

  elements['[data-direction="next"]'].dispatch("click");
  assert.equal(root.classList.contains("video-gallery--enhanced"), false);
  assert.equal(elements['[data-direction="previous"]'].disabled, true);
  assert.equal(elements['[data-direction="next"]'].disabled, true);
});
