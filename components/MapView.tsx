// src/components/MapView.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix para el icono por defecto
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

type Business = {
  id: string;
  name: string;
  location?: string | [number, number]; // Permitir string o array
};

export default function MapView({ businesses }: { businesses: Business[] }) {
  // Si no hay negocios, centramos en un punto genérico
  let center: [number, number] = [-31.731, -60.523];
  if (businesses.length && businesses[0].location) {
    if (Array.isArray(businesses[0].location)) {
      center = businesses[0].location as [number, number];
    } else if (typeof businesses[0].location === "string") {
      const parts = businesses[0].location.split(",").map(Number);
      if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
        center = parts as [number, number];
      }
    }
  }

  useEffect(() => {
    // Fix para el icono por defecto en SSR
    (async () => {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "/marker-icon.png",
        shadowUrl: "/marker-shadow.png",
      });
    })();
  }, []);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businesses.map((b) => {
          let position: [number, number] | null = null;
          if (b.location) {
            if (Array.isArray(b.location)) {
              position = b.location as [number, number];
            } else if (typeof b.location === "string") {
              const parts = b.location.split(",").map(Number);
              if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
                position = parts as [number, number];
              }
            }
          }
          return (
            position && (
              <Marker key={b.id} position={position} icon={icon}>
                <Popup>{b.name}</Popup>
              </Marker>
            )
          );
        })}
      </MapContainer>
    </div>
  );
}
