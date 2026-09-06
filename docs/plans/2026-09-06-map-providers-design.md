# Map Provider Selection Design

## Goal

Let visitors choose Google Maps, OpenStreetMap, or NASA Worldview imagery without changing talk markers, camera flights, current location, or responsive panels. Google Maps is the default.

## Architecture

The Google Maps JavaScript API remains the only map engine. OpenStreetMap and NASA GIBS are registered as custom raster map types. Switching the base map does not recreate the map or markers, so the selected talk and camera state remain stable.

The provider selector uses three compact buttons in the identity panel. OpenStreetMap and NASA modes show visible source attribution below the selector. NASA mode also shows the imagery date.

## Providers

Google mode uses the existing roadmap map type.

OpenStreetMap mode uses standard raster tiles for this low traffic interactive preview. The interface displays the required OpenStreetMap contributor credit and license link.

NASA mode uses MODIS Terra corrected reflectance true color imagery from NASA Global Imagery Browse Services. The request uses Web Mercator tiles and the previous UTC day to avoid incomplete imagery early in the current day. NASA mode limits zoom to the imagery service range.

## Responsive Behavior

The provider selector fits the desktop identity panel and the compact mobile identity panel. Buttons remain usable at 320 pixels. Source attribution wraps within the panel and does not cover the map or Google controls.

## Verification

Unit tests verify tile coordinates, NASA imagery dates, and provider defaults. Browser checks confirm that all providers load, Google is selected first, markers remain visible, flights continue, and desktop and mobile layouts do not overflow.

## References

NASA documents GIBS Web Mercator access and provides a Google Maps integration example. OpenStreetMap documents tile usage and attribution requirements.

[NASA GIBS access]: https://nasa-gibs.github.io/gibs-api-docs/access-basics/
[NASA Google Maps example]: https://nasa-gibs.github.io/gibs-web-examples/examples/google/webmercator-epsg3857.html
[OpenStreetMap attribution]: https://www.openstreetmap.org/copyright
[OpenStreetMap tile policy]: https://operations.osmfoundation.org/policies/tiles/
