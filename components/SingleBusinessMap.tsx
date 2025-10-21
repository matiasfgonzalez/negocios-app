// components/SingleBusinessMap.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix para el icono por defecto de Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface SingleBusinessMapProps {
  lat: number;
  lng: number;
  businessName: string;
  addressText?: string | null;
}

export default function SingleBusinessMap({
  lat,
  lng,
  businessName,
  addressText,
}: Readonly<SingleBusinessMapProps>) {
  useEffect(() => {
    // Fix para el icono por defecto en SSR de Leaflet
    if (globalThis.window !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    }
  }, []);

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      scrollWheelZoom={true}
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>
          <div className="text-neutral-900 dark:text-neutral-900 min-w-[200px]">
            <h3 className="font-semibold text-lg mb-1">{businessName}</h3>
            {addressText && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                📍 {addressText}
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
