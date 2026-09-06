# Map Camera Flight Design

## Goal

Selecting a talk in the archive moves the map to its location with a clear, fluid camera flight instead of an immediate jump.

## Interaction

The camera first zooms out enough to establish distance. It then travels toward the selected location and eases into zoom level six. The complete flight takes approximately 1.4 seconds.

A new selection cancels the active flight and starts from the current camera position. Reduced motion settings skip the animation and move directly to the destination.

## Architecture

A small pure utility calculates each camera frame. `MapCanvas` applies those frames with the native Google Maps camera methods and `requestAnimationFrame`. The implementation adds no dependency.

## Responsive Layout

Desktop screens keep the talk archive on the left and talk details on the right. Mobile screens keep the identity controls at the top and show one bottom sheet at a time. A selected talk replaces the archive with its details. Closing the details restores the archive when it was open.

Mobile controls use touch friendly dimensions and safe area spacing. The map remains visible between the top controls and the bottom sheet during camera movement.

## Verification

Unit tests verify camera interpolation and reduced motion behavior. Browser verification confirms that selecting a talk opens its details, keeps the map mounted, and completes at the selected coordinates and zoom level. Viewport checks cover desktop and mobile layouts.
