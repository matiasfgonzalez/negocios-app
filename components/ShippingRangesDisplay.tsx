"use client";

import { Truck, MapPin } from "lucide-react";
import { ShippingRange } from "@/lib/shipping-utils";
import { formatPrice } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShippingRangesDisplayProps {
  ranges: ShippingRange[] | null;
  maxDistance: number | null;
}

export default function ShippingRangesDisplay({
  ranges,
  maxDistance,
}: Readonly<ShippingRangesDisplayProps>) {
  if (!ranges || ranges.length === 0) {
    return null;
  }

  // Determinar si es tarifa única
  const isFlatRate = ranges.length === 1 && ranges[0].toKm === null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent text-primary hover:text-primary/80"
        >
          Ver tarifas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Tarifas de Envío
          </DialogTitle>
          <DialogDescription>
            Costos de envío según la distancia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Distancia máxima */}
          {maxDistance && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  Distancia máxima de envío
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Hasta {maxDistance.toFixed(1)} km desde el local
                </p>
              </div>
            </div>
          )}

          {/* Tarifas */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              {isFlatRate ? "Tarifa única" : "Rangos de precios"}
            </h4>

            {isFlatRate ? (
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatPrice(ranges[0].cost)}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Para todas las distancias
                    {maxDistance && ` (hasta ${maxDistance.toFixed(1)} km)`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {ranges.map((range, idx) => {
                  const rangeKey = `range-display-${range.fromKm}-${range.toKm}-${idx}`;
                  const isLastRange = idx === ranges.length - 1;

                  return (
                    <div
                      key={rangeKey}
                      className="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {range.fromKm.toFixed(1)} -{" "}
                          {range.toKm === null
                            ? maxDistance
                              ? `${maxDistance.toFixed(1)} km`
                              : "∞"
                            : `${range.toKm.toFixed(1)} km`}
                        </p>
                        {isLastRange && range.toKm === null && maxDistance && (
                          <p className="text-xs text-muted-foreground">
                            Hasta el límite máximo
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(range.cost)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nota informativa */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
              💡 El costo se calculará automáticamente según la distancia al
              seleccionar tu ubicación en el mapa
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
