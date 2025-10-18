"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix para los iconos de Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface OrderMapSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  businessLocation?: { lat: number; lng: number };
}

function LocationMarker({
  onLocationSelect,
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function OrderMapSelector({
  onLocationSelect,
  businessLocation,
}: OrderMapSelectorProps) {
  const defaultCenter: [number, number] = businessLocation
    ? [businessLocation.lat, businessLocation.lng]
    : [-34.6037, -58.3816]; // Buenos Aires por defecto

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businessLocation && (
          <Marker position={[businessLocation.lat, businessLocation.lng]} />
        )}
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
}
