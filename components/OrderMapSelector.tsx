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
import { Clock, Navigation, DollarSign, AlertCircle } from "lucide-react";
import {
  ShippingRange,
  calculateShippingCost,
  isWithinShippingRange,
} from "@/lib/shipping-utils";

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
          <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1D4ED8"/>
            <stop offset="100%" stop-color="#3B82F6"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#grad2)" stroke="#ffffff" stroke-width="1.5"/>
        <rect x="7" y="9" width="10" height="9" rx="2" fill="none" stroke="#ffffff" stroke-width="1.5"/>
        <path d="M9 9V8a3 3 0 0 1 6 0v1" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="10" cy="12" r="0.6" fill="#ffffff"/>
        <circle cx="14" cy="12" r="0.6" fill="#ffffff"/>
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
  shippingRanges?: ShippingRange[] | null;
  maxShippingDistance?: number | null;
  onShippingCostCalculated?: (cost: number | null, distance: number) => void;
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
  onDistanceCalculated,
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  businessLocation?: { lat: number; lng: number };
  onRouteCalculated: (routes: Route[]) => void;
  onDistanceCalculated: (distance: number) => void;
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

              // Calcular distancia y costo de envío
              if (data.routes.length > 0) {
                onDistanceCalculated(data.routes[0].distance / 1000); // Convertir metros a km
              }
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
  shippingRanges,
  maxShippingDistance,
  onShippingCostCalculated,
}: Readonly<OrderMapSelectorProps>) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isOutOfRange, setIsOutOfRange] = useState(false);

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
            onDistanceCalculated={(distance) => {
              setSelectedDistance(distance);

              // Verificar si está dentro del rango
              const withinRange = isWithinShippingRange(
                distance,
                maxShippingDistance || null
              );
              setIsOutOfRange(!withinRange);

              if (withinRange) {
                // Calcular costo de envío
                const cost = calculateShippingCost(
                  distance,
                  shippingRanges || null,
                  0
                );
                setShippingCost(cost);

                // Notificar al componente padre
                if (onShippingCostCalculated) {
                  onShippingCostCalculated(cost, distance);
                }
              } else {
                setShippingCost(null);
                if (onShippingCostCalculated) {
                  onShippingCostCalculated(null, distance);
                }
              }
            }}
          />
        </MapContainer>
      </div>

      {/* Información de rutas y costo de envío */}
      {routes.length > 0 && (
        <div className="space-y-3">
          {/* Alerta si está fuera de rango */}
          {isOutOfRange && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-red-800 dark:text-red-300">
                  Ubicación fuera del área de envío
                </p>
                <p className="text-red-700 dark:text-red-400 text-xs mt-1">
                  Este negocio no realiza envíos a esta distancia.
                  {maxShippingDistance && (
                    <> Máximo: {maxShippingDistance.toFixed(1)} km</>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Información de costo de envío */}
          {!isOutOfRange && selectedDistance !== null && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Costo de envío:
                  </span>
                </div>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {shippingCost === null
                    ? "Calculando..."
                    : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Distancia: {selectedDistance.toFixed(2)} km
              </p>
            </div>
          )}

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
