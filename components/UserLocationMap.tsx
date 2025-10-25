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

interface UserLocationMapProps {
  lat: number;
  lng: number;
  name: string;
  address?: string;
  height?: string;
}

export default function UserLocationMap({
  lat,
  lng,
  name,
  address,
  height = "h-64",
}: Readonly<UserLocationMapProps>) {
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
      className={`${height} w-full rounded-lg`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon}>
        <Popup>
          <div className="p-1">
            <h3 className="font-semibold text-sm">{name}</h3>
            {address && (
              <p className="text-xs text-muted-foreground mt-1">{address}</p>
            )}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
