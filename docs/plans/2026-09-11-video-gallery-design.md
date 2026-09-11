# Video Gallery Design

## Goal

Replace the landing page video list with a compact featured video gallery.
The gallery starts with the newest recording and lets visitors browse all
recordings with previous and next controls.

## Structure

The Videos section contains one featured card with these elements:

- A local responsive thumbnail.
- The talk title.
- The video provider or event label.
- A Watch Video link that opens the original video in a new tab.
- Previous and next buttons.
- A visible and announced position such as `1 of 4`.

The controls wrap continuously. Previous on the first video selects the last
video. Next on the last video selects the first video. The gallery does not
rotate automatically.

## Data and Progressive Enhancement

All video titles and links remain in the initial HTML. A compact fallback list
keeps every recording available to visitors and search crawlers when
JavaScript is unavailable.

JavaScript reads the embedded video entries, selects the newest entry on
startup, and updates the featured thumbnail, title, label, link, and position
when a visitor uses a navigation control.

## Thumbnails

Store optimized thumbnails in the repository instead of loading provider
images at runtime. Provide WebP images with explicit width and height
attributes. Keep the displayed image responsive and decode it asynchronously.
Do not embed YouTube or Vimeo players on the landing page.

## Accessibility

Use native buttons for navigation and a normal link for playback. Give each
button an explicit accessible name. Announce position changes through a polite
live region. Preserve visible focus styles and support keyboard activation
through native button behavior.

The card must not hide the video title behind the thumbnail. Controls must
remain at least 44 pixels high on narrow screens. Reduced motion must not
change access to any content.

## Responsive Behavior

Use a single column card at all viewport widths. The thumbnail fills the card
width while preserving its aspect ratio. Keep controls in a flexible row that
does not cause horizontal scrolling at a 320 pixel viewport.

## Failure Behavior

If JavaScript fails, the fallback list remains usable. If a thumbnail fails,
the visible title and Watch Video link still provide access to the recording.
Do not replace failures with success shaped placeholders.

## Validation

Add landing page tests for video ordering, link preservation, and gallery
markup. Add browser checks for initial selection, wraparound navigation,
keyboard operation, fallback content, and narrow viewport overflow.

Run the existing tests and build. Validate the deployed HTML with the W3C Nu
HTML Checker. Compare mobile and desktop PageSpeed Insights results after
deployment.
