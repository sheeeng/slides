# Map Camera Flight Design

## Goal

Selecting a talk in the archive moves the map to its location with a clear, fluid camera flight instead of an immediate jump.

## Interaction

The camera first zooms out enough to establish distance. It then pans toward the selected location and eases into zoom level six. The complete flight takes approximately 1.4 seconds.

A new selection cancels the active flight and starts from the current camera position. Reduced motion settings skip the animation and move directly to the destination.

## Architecture

A small pure utility creates the timed camera steps. `MapCanvas` runs those steps with the native Google Maps camera methods. The implementation uses browser timers and the Google Maps API that the preview already loads. It adds no dependency.

## Verification

A unit test verifies the camera step sequence and reduced motion behavior. Browser verification confirms that selecting a talk opens its details, keeps the map mounted, and completes at the selected coordinates and zoom level.
