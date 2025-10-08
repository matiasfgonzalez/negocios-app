"use client";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import type { LatLngLiteral } from "leaflet";

function LocationMarker({
  onChange,
}: {
  onChange: (latlng: LatLngLiteral) => void;
}) {
  const [pos, setPos] = useState<LatLngLiteral | null>(null);
  useMapEvents({
    click(e) {
      const p = e.latlng;
      setPos(p);
      onChange({ lat: p.lat, lng: p.lng });
    },
  });
  return pos ? <Marker position={[pos.lat, pos.lng]} /> : null;
}

interface PropsMapPicker {
  onChange: (l: LatLngLiteral) => void;
  center?: LatLngLiteral;
}

export default function MapPicker({
  onChange,
  center = { lat: -31.416, lng: -64.183 },
}: Readonly<PropsMapPicker>) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ height: 300, width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker onChange={onChange} />
    </MapContainer>
  );
}
