/**
 * Urja Basket shop coordinates — resolved from:
 * https://maps.app.goo.gl/y2EsTwrXbDkXuTXc7
 * → Google Maps place: Urja Basket @ 28.6222342, 77.2846799
 */
export const SHOP_MAPS_SHORT_URL = "https://maps.app.goo.gl/y2EsTwrXbDkXuTXc7";

export const SHOP_LOCATION = {
  name: "Urja Basket",
  subtitle: "Premium Fruits & Dry Fruits",
  address: "D-134, South Ganesh Nagar, Delhi — 110092",
  /** MapLibre / GeoJSON order: [longitude, latitude] */
  center: [77.2846799, 28.6222342] as [number, number],
  latitude: 28.6222342,
  longitude: 77.2846799,
} as const;

export const SHOP_MAP_CAMERA = {
  zoom: 17,
  pitch: 65,
  bearing: -20,
} as const;

export const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
