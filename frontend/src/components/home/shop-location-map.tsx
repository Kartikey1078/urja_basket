"use client";

import maplibregl from "maplibre-gl";
import { MapPin, Navigation2 } from "lucide-react";
import { useEffect, useRef } from "react";

import {
  OPENFREEMAP_STYLE_URL,
  SHOP_LOCATION,
  SHOP_MAP_CAMERA,
  SHOP_MAPS_SHORT_URL,
} from "@/lib/shop-location";

import "maplibre-gl/dist/maplibre-gl.css";

function buildMarkerElement(): HTMLDivElement {
  const marker = document.createElement("div");
  marker.className = "urja-map-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.innerHTML = `
    <span class="urja-map-marker__pulse" aria-hidden="true"></span>
    <span class="urja-map-marker__pin" aria-hidden="true">
      <span class="urja-map-marker__dot"></span>
    </span>
  `;
  return marker;
}

function buildPopupNode(): HTMLDivElement {
  const root = document.createElement("div");
  root.className = "urja-map-popup__card";
  root.innerHTML = `
    <p class="urja-map-popup__title">${SHOP_LOCATION.name}</p>
    <p class="urja-map-popup__subtitle">${SHOP_LOCATION.subtitle}</p>
    <p class="urja-map-popup__address">${SHOP_LOCATION.address}</p>
    <a class="urja-map-popup__link" href="${SHOP_MAPS_SHORT_URL}" target="_blank" rel="noopener noreferrer">
      Open in Google Maps
    </a>
  `;
  return root;
}

function enhance3DBuildings(map: maplibregl.Map) {
  if (!map.getLayer("building-3d")) return;

  map.setPaintProperty("building-3d", "fill-extrusion-color", [
    "interpolate",
    ["linear"],
    ["get", "render_height"],
    0,
    "#ebe6dc",
    24,
    "#d9d2c4",
    72,
    "#c8bfb0",
  ]);
  map.setPaintProperty("building-3d", "fill-extrusion-opacity", 0.9);
}

/**
 * Interactive 3D MapLibre map centered on the Urja Basket shop (OpenFreeMap tiles).
 */
export function ShopLocationMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = new maplibregl.Map({
      container,
      style: OPENFREEMAP_STYLE_URL,
      center: SHOP_LOCATION.center,
      zoom: 14.5,
      pitch: 38,
      bearing: -8,
      keyboard: false,
      canvasContextAttributes: { antialias: true },
      attributionControl: false,
    });

    mapRef.current = map;
    map.getCanvas().tabIndex = -1;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    const marker = new maplibregl.Marker({
      element: buildMarkerElement(),
      anchor: "bottom",
    })
      .setLngLat(SHOP_LOCATION.center)
      .addTo(map);

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 28,
      className: "urja-map-popup",
      maxWidth: "280px",
    })
      .setDOMContent(buildPopupNode())
      .setLngLat(SHOP_LOCATION.center)
      .addTo(map);

    map.on("style.load", () => {
      enhance3DBuildings(map);
    });

    map.on("load", () => {
      map.flyTo({
        center: SHOP_LOCATION.center,
        zoom: SHOP_MAP_CAMERA.zoom,
        pitch: SHOP_MAP_CAMERA.pitch,
        bearing: SHOP_MAP_CAMERA.bearing,
        duration: 2400,
        essential: true,
        curve: 1.35,
      });
    });

    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      popup.remove();
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const openDirections = () => {
    window.open(SHOP_MAPS_SHORT_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" aria-label="Urja Basket store map" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/10 to-transparent" />

      <button
        type="button"
        onClick={openDirections}
        className="bg-urja-forest text-urja-cream pointer-events-auto absolute bottom-3 left-3 inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold shadow-[0_10px_24px_-10px_rgba(11,43,30,0.65)] ring-1 ring-white/15 transition active:scale-[0.98] sm:bottom-4 sm:left-4 sm:min-h-11 sm:px-4 sm:text-sm"
      >
        <Navigation2 className="size-4 shrink-0" aria-hidden />
        Directions
      </button>

      <div className="bg-urja-cream/95 text-urja-forest pointer-events-none absolute right-3 top-3 hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md ring-1 ring-black/5 backdrop-blur sm:flex">
        <MapPin className="size-3.5" aria-hidden />
        South Ganesh Nagar, Delhi
      </div>
    </div>
  );
}
