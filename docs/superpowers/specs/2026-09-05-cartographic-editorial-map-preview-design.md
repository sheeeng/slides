# Cartographic Editorial Map Preview Design

## Objective

Redesign the optional `motion.html` preview as a professional, map-first experience for Leonard's Slides. Preserve the existing `index.html` landing page and its behavior without modification.

## Design Direction

Use a cartographic editorial style. The map is the primary surface. Interface elements use a restrained light palette, an ivory surface color, dark text, and one violet accent. The result must feel precise, calm, and publication-ready.

Do not use a dark theme, decorative globe, space scene, oversized marketing copy, floating talk list, or lower-right information panel.

## Layout

The Google Map fills the viewport. A compact ivory identity panel sits in the upper-left corner without obscuring important controls or markers.

The identity panel contains only:

- `Leonard's Slides`
- `Slides`
- `Videos`
- `Where I've Spoken`

A slim utility row contains two controls:

- `Locate Me`
- `View All Talks`

The controls remain visible on desktop and mobile. On small screens, the identity panel and utility row use less space and do not cover the selected talk card.

## Map Behavior

- Use Google Maps in light roadmap mode.
- Load talk locations from `talks.toml` as the source of truth.
- Fit the initial camera to all talk locations.
- Support drag to pan and scroll to zoom.
- Request the user's current location after the map loads.
- If location access succeeds, show the user's position and center the camera without removing talk markers.
- If location access fails or is denied, keep the all-talks view and show no blocking error.
- `Locate Me` retries geolocation and centers the map on the user.
- `View All Talks` restores the camera bounds for all talk locations.

## Talk Markers

Use custom violet markers with high contrast against the light map. A marker represents a city rather than one talk. If a city has multiple talks, show the number of talks in the marker.

Marker interaction must support pointer and keyboard input. Selecting a marker must:

1. Smoothly center the map on the city.
2. Use a closer zoom level that preserves geographic context.
3. Open the talk card for that city.

## Talk Card

Use one compact ivory card near the selected marker or along the lower edge of the viewport. The card is temporary and appears only after marker selection. It is not a persistent floating list.

The card contains:

- City and country
- Talk year or full date when available
- Event name
- Talk title
- Deck link when available

When a city contains multiple talks, the card lists those talks in chronological order. Replacing one selected city with another uses a short crossfade or shared-axis transition.

## Typography And Color

- Use a refined serif face for `Leonard's Slides` and talk titles.
- Use a neutral sans-serif face for navigation, controls, dates, and location labels.
- Use ivory for panels and cards.
- Use dark charcoal for primary text.
- Use muted gray for supporting information.
- Use violet for markers, active states, and links.
- Use light theme only. Do not implement `prefers-color-scheme` switching.

## Motion

Motion supports orientation and feedback. It must not compete with the map.

- Fade and lift the identity panel once after load.
- Emphasize selected markers with a short scale transition.
- Replace talk-card content with a short crossfade or shared-axis transition.
- Use the Google Maps camera animation for location changes.
- Respect `prefers-reduced-motion` for interface transitions.

Use motion patterns from [Transitions.dev][transitions-dev] as guidance. Use [Canvas UI][canvas-ui] as guidance for layering real HTML controls over a visual surface.

## Data And Architecture

Keep the preview isolated under `motion/`. Do not add preview behavior to `index.html`.

Separate the preview into these responsibilities:

- Data loading parses `talks.toml` and validates required location fields.
- Map initialization loads Google Maps once and owns map-level events.
- Location grouping combines talks with identical city coordinates.
- Marker rendering creates one marker per grouped location.
- Selection state coordinates markers, camera movement, and the talk card.
- Geolocation owns current-location requests and status messages.

The Google Maps API key must come from `GOOGLE_MAPS_API_KEY` during the local build. Do not commit the key or include a test key in generated assets.

## Error Handling

- If Google Maps fails to load, show a concise inline error in the identity panel.
- If `talks.toml` fails to load, show the map without markers and a concise status message.
- If a talk lacks a deck URL, omit the deck link.
- If geolocation is unavailable or denied, keep the all-talks view.
- Do not display raw errors, stack traces, or configuration values in the page.

## Accessibility

- Keep all HTML controls keyboard accessible.
- Give map controls and custom buttons clear accessible names.
- Use sufficient contrast for panels, text, markers, and focus indicators.
- Announce map, location, and selection status through a polite live region.
- Do not rely on color alone to communicate marker selection or talk count.

## Verification

Verify the finished preview at desktop and mobile viewport sizes.

1. Build with `npm --prefix motion run build` while `GOOGLE_MAPS_API_KEY` is available.
2. Run `bash -n dev.sh`.
3. Run `git diff --check`.
4. Start `./dev.sh` and open `http://localhost:8080/motion.html`.
5. Confirm that `index.html` has no diff.
6. Confirm that the heading and three section links are visible above the map.
7. Confirm that the initial camera includes all talk locations.
8. Confirm that grouped markers show correct talk counts.
9. Select at least three cities and verify card content and deck links.
10. Test `Locate Me` with permission granted and denied.
11. Test `View All Talks` after zooming into a city.
12. Test keyboard navigation and reduced-motion mode.
13. Confirm that no dark theme appears when the operating system uses dark mode.

[canvas-ui]: https://github.com/DavidHDev/canvas-ui
[transitions-dev]: https://github.com/Jakubantalik/transitions.dev
