// src/components/MapView.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { Business } from "@/app/types/types";

// Fix para el icono por defecto de Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({
  businesses,
}: Readonly<{ businesses: Business[] }>) {
  // Si no hay negocios, centramos en un punto genérico (Paraná, Argentina)
  let center: [number, number] = [-31.731, -60.523];

  // Buscar el primer negocio con coordenadas válidas para centrar el mapa
  if (businesses.length) {
    const businessWithLocation = businesses.find((b) => b.lat && b.lng);
    if (businessWithLocation?.lat && businessWithLocation?.lng) {
      center = [businessWithLocation.lat, businessWithLocation.lng];
    }
  }

  useEffect(() => {
    // Fix para el icono por defecto en SSR de Leaflet
    if (typeof window !== "undefined") {
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
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

  // Filtrar negocios que tienen coordenadas válidas
  const businessesWithLocation = businesses.filter((b) => b.lat && b.lng);

  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-soft dark:shadow-soft-dark relative">
      {businessesWithLocation.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400 mb-2">
              No hay negocios con ubicación disponible
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-500">
              Los negocios aparecerán aquí cuando agreguen su ubicación
            </p>
          </div>
        </div>
      ) : (
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
          {businessesWithLocation.map((b) => (
            <Marker key={b.id} position={[b.lat!, b.lng!]} icon={icon}>
              <Popup>
                <div className="text-neutral-900 dark:text-neutral-900 min-w-[200px]">
                  <h3 className="font-semibold text-lg mb-1">{b.name}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                    {b.rubro}
                  </p>
                  {b.description && (
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2 line-clamp-2">
                      {b.description}
                    </p>
                  )}
                  {b.addressText && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-2">
                      📍 {b.addressText}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {b.whatsappPhone && (
                      <a
                        href={`https://wa.me/${b.whatsappPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                      >
                        WhatsApp
                      </a>
                    )}
                    <button
                      onClick={() =>
                        window.open(`/businesses/${b.slug || b.id}`, "_blank")
                      }
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                    >
                      Ver tienda
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
