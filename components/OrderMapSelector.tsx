"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Clock, Navigation } from "lucide-react";

// Fix para los iconos de Leaflet (solo en el cliente)
let businessIcon: L.Icon | undefined;

if (globalThis.window !== undefined) {
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

  // Icono personalizado para el negocio (tienda)
  businessIcon = new L.Icon({
    iconUrl:
      "data:image/svg+xml;base64," +
      btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563EB"/>
            <stop offset="100%" stop-color="#3B82F6"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#grad)" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M7 9l1-3h8l1 3" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <rect x="5.5" y="9" width="13" height="9" rx="1.5" fill="none" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M9 12v2M15 12v2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
    shadowAnchor: [12, 41],
  });
}

interface OrderMapSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  businessLocation?: { lat: number; lng: number };
}

interface Route {
  geometry: {
    coordinates: [number, number][];
  };
  duration: number; // segundos
  distance: number; // metros
}

interface OSRMResponse {
  routes: Route[];
  code: string;
}

function LocationMarker({
  onLocationSelect,
  businessLocation,
  onRouteCalculated,
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  businessLocation?: { lat: number; lng: number };
  onRouteCalculated: (routes: Route[]) => void;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      console.log("Mapa clickeado en:", e.latlng);
      setPosition(e.latlng);
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });

      // Calcular rutas si hay ubicación del negocio
      if (businessLocation) {
        const coords = `${businessLocation.lng},${businessLocation.lat};${e.latlng.lng},${e.latlng.lat}`;
        const baseUrl = "https://routing.openstreetmap.de/routed-car";
        const url = `${baseUrl}/route/v1/driving/${coords}?geometries=geojson&overview=full&steps=true&alternatives=true&annotations=true`;

        // Fetch async sin bloquear el click handler
        fetch(url)
          .then((response) => response.json())
          .then((data: OSRMResponse) => {
            if (data.code === "Ok" && data.routes) {
              onRouteCalculated(data.routes);
            }
          })
          .catch((error) => {
            console.error("Error calculando rutas:", error);
            onRouteCalculated([]);
          });
      }
    },
  });

  return position === null ? null : <Marker position={position} />;
}

export default function OrderMapSelector({
  onLocationSelect,
  businessLocation,
}: Readonly<OrderMapSelectorProps>) {
  const [routes, setRoutes] = useState<Route[]>([]);

  const defaultCenter: [number, number] = businessLocation
    ? [businessLocation.lat, businessLocation.lng]
    : [-34.6037, -58.3816]; // Buenos Aires por defecto

  // Colores para las diferentes rutas alternativas
  const routeColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  return (
    <div className="space-y-3">
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
            <Marker
              position={[businessLocation.lat, businessLocation.lng]}
              icon={businessIcon}
            >
              <Popup>
                <div className="text-sm font-medium">Ubicación del negocio</div>
              </Popup>
            </Marker>
          )}

          {/* Renderizar todas las rutas con diferentes colores */}
          {routes.map((route, index) => {
            const coordinates: [number, number][] =
              route.geometry.coordinates.map(
                (coord) => [coord[1], coord[0]] // OSRM devuelve [lng, lat], Leaflet usa [lat, lng]
              );
            const routeKey = `route-${route.distance}-${route.duration}-${index}`;
            return (
              <Polyline
                key={routeKey}
                positions={coordinates}
                color={routeColors[index % routeColors.length]}
                weight={index === 0 ? 5 : 3}
                opacity={index === 0 ? 0.8 : 0.5}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <div className="font-semibold">
                      {index === 0
                        ? "Ruta principal"
                        : `Ruta alternativa ${index}`}
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      <span>{formatDistance(route.distance)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(route.duration)}</span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            );
          })}

          <LocationMarker
            onLocationSelect={onLocationSelect}
            businessLocation={businessLocation}
            onRouteCalculated={setRoutes}
          />
        </MapContainer>
      </div>

      {/* Información de rutas */}
      {routes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">
            Rutas disponibles:
          </h4>
          <div className="grid gap-2">
            {routes.map((route, index) => {
              const routeKey = `route-info-${route.distance}-${route.duration}-${index}`;
              return (
                <div
                  key={routeKey}
                  className="flex items-center justify-between p-3 rounded-lg border"
                  style={{
                    borderColor: routeColors[index % routeColors.length],
                    backgroundColor: `${
                      routeColors[index % routeColors.length]
                    }10`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          routeColors[index % routeColors.length],
                      }}
                    />
                    <span className="text-sm font-medium">
                      {index === 0 ? "Principal" : `Alt. ${index}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{formatDistance(route.distance)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(route.duration)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
