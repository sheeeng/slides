# Video Gallery Implementation Plan

**Status:** Complete.

## Goal

Replace the four video cards with one accessible featured video gallery.
Preserve all four links when JavaScript is unavailable or fails.

## Task 1: Add Tested Gallery State

**Status:** Complete.

1. Create the independent root module `video-gallery.js`.
2. Export `moveVideoIndex`.
3. Export the data validation and selection helpers.
4. Test forward and backward wraparound.
5. Test invalid data rejection.
6. Test the newest default selection.
7. Test the exact embedded data order.

## Task 2: Add Gallery Markup and Styles

**Status:** Complete.

1. Replace the four video cards in `index.html`.
2. Add one CSS title card with a 16:9 aspect ratio.
3. Mark the visual title card with `aria-hidden="true"`.
4. Add the semantic title and metadata after the title card.
5. Add the Watch Video link with secure new tab attributes.
6. Add native Previous and Next buttons.
7. Give each button a minimum size of 44 pixels.
8. Add a polite live status.
9. Add the visible compact fallback list.
10. Keep every video URL in an initial HTML anchor.
11. Use only the existing CSS color variables.
12. Preserve dark mode, focus indicators, and 320 pixel support.

## Task 3: Add Progressive Enhancement

**Status:** Complete.

1. Store the four entries in an `application/json` script.
2. Validate the array before enhancement.
3. Validate every required string before enhancement.
4. Render the newest Vimeo entry first.
5. Attach both listeners before enhancement.
6. Enable the controls after the first successful render.
7. Add the enhancement class as the final initialization action.
8. Keep the fallback visible after any initialization failure.
9. Remove enhancement after any navigation render failure.
10. Hide and disable controls after a navigation render failure.
11. Do not add automatic rotation.
12. Initialize only when `document` exists.

## Task 4: Deploy the Module

**Status:** Complete.

1. Add `video-gallery.js` to the GitHub Pages sparse checkout.
2. Copy `video-gallery.js` to the public directory.
3. Add `video-gallery.js` to the local watched sources.
4. Copy `video-gallery.js` during each local build.

## Task 5: Verify the Result

**Status:** Complete after the checks in this implementation session pass.

1. Run `npm --prefix talks test`.
2. Run `npm --prefix talks run build`.
3. Run `git diff --check`.
4. Run targeted pre-commit hooks on every changed file.
5. Validate the source HTML with the W3C Nu HTML Checker.
6. Check keyboard navigation in a browser.
7. Check the 44 pixel control size in a browser.
8. Check the live status in a browser.
9. Check the 320 pixel viewport in a browser.
10. Check fallback behavior when module loading fails.
11. Check fallback behavior when initialization fails.
12. Check fallback behavior when navigation rendering fails.
13. Validate the deployed page after publication.
