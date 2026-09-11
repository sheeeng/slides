# Video Gallery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the landing page video list with an accessible featured video gallery that starts with the newest recording and preserves excellent PageSpeed and W3C results.

**Architecture:** Store four optimized thumbnails locally and render only the selected thumbnail. Keep gallery state and wraparound navigation in a small root JavaScript module with pure functions that Node.js can test. Keep all video links in a `noscript` fallback so content remains available without JavaScript.

**Tech Stack:** HTML, CSS, browser JavaScript modules, Node.js test runner, ImageMagick, Vite, W3C Nu HTML Checker, and PageSpeed Insights.

---

## Task 1: Add Optimized Local Thumbnails

**Files:**

- Create: `media/video-thumbnails/reproducible-environments.webp`
- Create: `media/video-thumbnails/demystifying-nix-store.webp`
- Create: `media/video-thumbnails/tracking-nixpkgs-prs.webp`
- Create: `media/video-thumbnails/kernel-virtual-machine.webp`
- Create: `media/video-thumbnails/README.md`

### Step 1: Download the Provider Thumbnails

Run:

```bash
mkdir --parents media/video-thumbnails
curl --location --fail \
  "https://i.vimeocdn.com/video/2197032329-1f2aa64b803f471dd153e2bf96a7b63cad9531a9d968f520d193e4171b4fa062-d_295x166?region=us" \
  --output /tmp/reproducible-environments.jpg
curl --location --fail \
  "https://i.ytimg.com/vi/4bwSRCTAAn0/maxresdefault.jpg" \
  --output /tmp/demystifying-nix-store.jpg
curl --location --fail \
  "https://i.ytimg.com/vi/wo38491N3Nw/maxresdefault.jpg" \
  --output /tmp/tracking-nixpkgs-prs.jpg
curl --location --fail \
  "https://i.ytimg.com/vi/mAZNlyXVoT4/maxresdefault.jpg" \
  --output /tmp/kernel-virtual-machine.jpg
```

Expected: Four JPEG files exist in `/tmp`.

### Step 2: Convert the Thumbnails

Run:

```bash
for name in \
  reproducible-environments \
  demystifying-nix-store \
  tracking-nixpkgs-prs \
  kernel-virtual-machine
do
  magick "/tmp/${name}.jpg" \
    -auto-orient \
    -resize "640x360^" \
    -gravity center \
    -extent 640x360 \
    -strip \
    -quality 76 \
    "media/video-thumbnails/${name}.webp"
done
```

Expected: Each WebP is 640 by 360 pixels and less than 100 KiB.

### Step 3: Document the Sources

Create `media/video-thumbnails/README.md` with a table that maps each local
file to its video URL and source thumbnail URL. Use reference style links.

### Step 4: Validate the Files

Run:

```bash
identify -format '%f %wx%h %b\n' media/video-thumbnails/*.webp
```

Expected: Four 640 by 360 images.

### Step 5: Commit

Run:

```bash
git add media/video-thumbnails
git commit --signoff --message "feat(media): add video thumbnails"
```

## Task 2: Add Tested Gallery State

**Files:**

- Create: `video-gallery.js`
- Create: `talks/test/videoGallery.test.js`

### Step 1: Write the Failing Wraparound Tests

Create `talks/test/videoGallery.test.js`:

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { moveVideoIndex } from "../../video-gallery.js";

test("next wraps from the final video to the first", () => {
  assert.equal(moveVideoIndex(3, 1, 4), 0);
});

test("previous wraps from the first video to the final", () => {
  assert.equal(moveVideoIndex(0, -1, 4), 3);
});
```

### Step 2: Run the Test to Verify It Fails

Run:

```bash
npm --prefix talks test -- --test-name-pattern="wraps"
```

Expected: Failure because `video-gallery.js` does not exist.

### Step 3: Add the Minimal State Function

Create `video-gallery.js`:

```javascript
export function moveVideoIndex(currentIndex, offset, videoCount) {
  return (currentIndex + offset + videoCount) % videoCount;
}
```

### Step 4: Run the Tests

Run:

```bash
npm --prefix talks test -- --test-name-pattern="wraps"
```

Expected: Both tests pass.

### Step 5: Commit

Run:

```bash
git add video-gallery.js talks/test/videoGallery.test.js
git commit --signoff --message "test(landing): cover gallery navigation"
```

## Task 3: Add Gallery Markup and Styles

**Files:**

- Modify: `index.html:109-310`
- Modify: `index.html:517-624`
- Modify: `talks/test/landingPage.test.js:36-41`

### Step 1: Write the Failing Landing Page Test

Replace the current recorded video test with assertions for:

```javascript
test("the landing page exposes an accessible video gallery", () => {
  assert.match(indexHtml, /class="video-gallery"/);
  assert.match(indexHtml, /aria-label="Previous video"/);
  assert.match(indexHtml, /aria-label="Next video"/);
  assert.match(indexHtml, /id="video-gallery-status" aria-live="polite"/);
  assert.match(indexHtml, /href="https:\/\/vimeo\.com\/1223729965"/);
  assert.match(indexHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=4bwSRCTAAn0"/);
  assert.match(indexHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=wo38491N3Nw"/);
  assert.match(indexHtml, /href="https:\/\/www\.youtube\.com\/watch\?v=mAZNlyXVoT4"/);
});
```

### Step 2: Run the Test to Verify It Fails

Run:

```bash
npm --prefix talks test -- --test-name-pattern="video gallery"
```

Expected: Failure because the gallery markup is absent.

### Step 3: Replace the Video List

Add one `.video-gallery` article that contains:

- A 640 by 360 image with `loading="lazy"`, `decoding="async"`, and
  `fetchpriority="low"`.
- A title heading.
- A provider and event label.
- A Watch Video link with `target="_blank"` and
  `rel="noopener noreferrer"`.
- Previous and next native buttons.
- A polite live position status.
- A JSON data script with the four entries in newest first order.
- A `noscript` list with all four video links.

Use the Vimeo recording as the initial visible item.

### Step 4: Add Responsive Styles

Add CSS for:

```css
.video-gallery {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
}

.video-gallery__thumbnail {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.video-gallery__content {
  padding: clamp(0.875rem, 3vw, 1.25rem);
}

.video-gallery__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.video-gallery__button {
  min-width: 44px;
  min-height: 44px;
}
```

Preserve the existing color variables and focus ring style.

### Step 5: Run the Test

Run:

```bash
npm --prefix talks test -- --test-name-pattern="video gallery"
```

Expected: The gallery test passes.

### Step 6: Commit

Run:

```bash
git add index.html talks/test/landingPage.test.js
git commit --signoff --message "feat(landing): add video gallery"
```

## Task 4: Implement Gallery Rendering

**Files:**

- Modify: `video-gallery.js`
- Modify: `index.html`
- Modify: `talks/test/videoGallery.test.js`

### Step 1: Add Failing Data Rendering Tests

Add tests for a pure `getVideoAtIndex` function:

```javascript
test("the gallery starts with the newest video", () => {
  const videos = [{ title: "Newest" }, { title: "Older" }];
  assert.equal(getVideoAtIndex(videos, 0).title, "Newest");
});
```

### Step 2: Run the Test to Verify It Fails

Run:

```bash
npm --prefix talks test -- --test-name-pattern="gallery starts"
```

Expected: Failure because `getVideoAtIndex` is not exported.

### Step 3: Implement the Gallery Module

Add:

```javascript
export function getVideoAtIndex(videos, index) {
  return videos[index];
}

export function initializeVideoGallery(root) {
  const data = JSON.parse(
    document.getElementById("video-gallery-data").textContent,
  );
  let currentIndex = 0;

  const render = () => {
    const video = getVideoAtIndex(data, currentIndex);
    root.querySelector(".video-gallery__thumbnail").src = video.thumbnail;
    root.querySelector(".video-gallery__thumbnail").alt = video.thumbnailAlt;
    root.querySelector(".video-gallery__title").textContent = video.title;
    root.querySelector(".video-gallery__meta").textContent = video.meta;
    root.querySelector(".video-gallery__link").href = video.url;
    root.querySelector(".video-gallery__status").textContent =
      `${currentIndex + 1} of ${data.length}`;
  };

  root.querySelector('[data-direction="previous"]').addEventListener(
    "click",
    () => {
      currentIndex = moveVideoIndex(currentIndex, -1, data.length);
      render();
    },
  );

  root.querySelector('[data-direction="next"]').addEventListener(
    "click",
    () => {
      currentIndex = moveVideoIndex(currentIndex, 1, data.length);
      render();
    },
  );

  render();
}
```

Initialize the gallery from the existing module script in `index.html`.

### Step 4: Run All Tests

Run:

```bash
npm --prefix talks test
```

Expected: All tests pass.

### Step 5: Commit

Run:

```bash
git add video-gallery.js index.html talks/test/videoGallery.test.js
git commit --signoff --message "feat(landing): enable gallery controls"
```

## Task 5: Deploy Gallery Assets

**Files:**

- Modify: `.github/workflows/github-pages.yml:74-125`
- Modify: `dev.sh:27-108`

### Step 1: Add Gallery Files to Sparse Checkout

Add:

```text
video-gallery.js
media/video-thumbnails
```

### Step 2: Copy Gallery Files into the Public Output

Add:

```bash
mkdir --parents public/media/video-thumbnails
cp video-gallery.js public/
cp media/video-thumbnails/*.webp public/media/video-thumbnails/
```

### Step 3: Update Local Development

Copy `video-gallery.js` and `media/video-thumbnails` into `.dev` during each
build. Add both paths to the watched source list.

### Step 4: Run Repository Checks

Run:

```bash
pre-commit run --files \
  .github/workflows/github-pages.yml \
  dev.sh \
  index.html \
  video-gallery.js \
  talks/test/landingPage.test.js \
  talks/test/videoGallery.test.js \
  media/video-thumbnails/README.md
```

Expected: All checks pass.

### Step 5: Commit

Run:

```bash
git add .github/workflows/github-pages.yml dev.sh
git commit --signoff --message "build(pages): deploy video gallery"
```

## Task 6: Verify Accessibility and Performance

**Files:**

- Modify if required: `index.html`
- Modify if required: `video-gallery.js`

### Step 1: Run the Complete Test and Build Suite

Run:

```bash
npm --prefix talks test
npm --prefix talks run build
git diff --check
```

Expected: All commands pass.

### Step 2: Validate HTML

Run:

```bash
curl --request POST \
  --header "Content-Type: text/html; charset=utf-8" \
  --data-binary @index.html \
  "https://validator.w3.org/nu/?out=json"
```

Expected: No errors or informational messages.

### Step 3: Test Browser Behavior

Use Playwright at 320, 390, 768, and 1280 pixel widths. Verify:

- No horizontal overflow.
- The newest video is selected initially.
- Both controls are at least 44 pixels high.
- Previous and next wrap correctly.
- Keyboard activation works.
- Only the selected thumbnail is requested.
- No console errors occur.

### Step 4: Deploy and Run PageSpeed Insights

Run mobile and desktop PageSpeed Insights after GitHub Pages deploys. Target:

- Performance: 100 where Lighthouse variance permits.
- Accessibility: 100.
- Best Practices: 100.
- SEO: 100.

Do not remove the title, thumbnail, controls, focus styles, fallback links, or
Open Sans solely to force a variable performance score.

### Step 5: Commit Any Validation Corrections

Run:

```bash
git add index.html video-gallery.js
git commit --signoff --message "fix(landing): refine gallery quality"
```
