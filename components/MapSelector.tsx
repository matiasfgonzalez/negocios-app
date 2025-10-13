"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}

// Componente interno que maneja los eventos del mapa
function LocationMarker({
  onLocationSelect,
  initialLocation,
}: MapSelectorProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  const map = useMapEvents({
    click(e) {
      const newPosition = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      setPosition(newPosition);
      onLocationSelect(newPosition);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    // Intentar obtener la ubicación del usuario al cargar
    if (!initialLocation) {
      map.locate();
    }
  }, [map, initialLocation]);

  useMapEvents({
    locationfound(e) {
      const newPosition = {
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      };
      setPosition(newPosition);
      onLocationSelect(newPosition);
      map.flyTo(e.latlng, 13);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function MapSelector({
  onLocationSelect,
  initialLocation,
}: MapSelectorProps) {
  // Centro por defecto (Buenos Aires, Argentina)
  const defaultCenter: [number, number] = initialLocation
    ? [initialLocation.lat, initialLocation.lng]
    : [-34.6037, -58.3816];

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          onLocationSelect={onLocationSelect}
          initialLocation={initialLocation}
        />
      </MapContainer>
    </div>
  );
}
