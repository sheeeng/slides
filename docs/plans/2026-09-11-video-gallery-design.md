# Video Gallery Design

## Goal

The landing page shows one featured video gallery. The gallery starts with the
newest recording and gives access to all four recordings.

## Page Structure

The Videos section contains one gallery card. The card has these parts:

1. A CSS title card with a 16:9 aspect ratio.
2. A semantic talk title and provider description.
3. A Watch Video link.
4. Previous and Next buttons.
5. A visible live status such as `1 of 4`.
6. A compact fallback list with all four video links.

The title card shows the talk title and provider. The card has
`aria-hidden="true"` because the same information follows in semantic HTML.

## Data and Selection

The initial HTML stores the video data in an `application/json` script.
Each entry has a title, provider, metadata text, and URL.

The data order is newest first:

1. Vimeo `1223729965`.
2. YouTube `4bwSRCTAAn0`.
3. YouTube `wo38491N3Nw`.
4. YouTube `mAZNlyXVoT4`.

The first entry is the default selection. The gallery does not rotate
automatically.

## Progressive Enhancement

The initial HTML shows the featured video and the complete fallback list.
The initial HTML hides and disables the navigation controls.

The independent root module is `video-gallery.js`. A module failure cannot stop
the existing statistics module.

The module completes these actions before it enables enhancement:

1. Parse the embedded JSON.
2. Validate the nonempty array.
3. Validate each required string.
4. Find all required gallery elements.
5. Attach both navigation listeners.
6. Complete the first render.
7. Enable the buttons.
8. Add the enhancement class.

The enhancement class hides the fallback list and shows the controls.
Initialization failure leaves the fallback list visible.

A navigation render failure removes the enhancement class. It also disables
and hides the controls. The fallback list becomes visible again.

## Navigation

Previous and Next use native buttons. Each button has visible text and a
minimum size of 44 pixels.

Navigation wraps continuously. Previous from the first item selects the final
item. Next from the final item selects the first item.

The Watch Video link opens the selected URL in a new tab. The link uses
`rel="noopener noreferrer"`.

## Visual Design

The title card uses CSS and existing color variables. It does not request a
thumbnail file or an embedded player.

The gallery uses these existing variables:

1. `--bg`.
2. `--bg-card`.
3. `--text`.
4. `--text-muted`.
5. `--link`.
6. `--border`.

The layout supports dark mode and a 320 pixel viewport. Focus indicators remain
visible for links and buttons.

## Validation

Node.js tests cover wraparound, rejected data, the newest default, embedded
data order, gallery markup, and fallback links.

Browser checks cover keyboard use, focus, control size, live status, fallback
behavior, runtime failure, dark mode, and 320 pixel overflow.

Development validation uses the W3C Nu HTML Checker against the source HTML.
After deployment, validate the deployed page with the same checker.

Run the full test suite, the production build, `git diff --check`, and the
targeted pre-commit hooks.
