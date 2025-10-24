"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShippingRange,
  validateShippingRanges,
  formatShippingRange,
} from "@/lib/shipping-utils";

interface ShippingRangesEditorProps {
  ranges: ShippingRange[];
  onChange: (ranges: ShippingRange[]) => void;
  maxDistance?: number | null;
}

export default function ShippingRangesEditor({
  ranges,
  onChange,
  maxDistance,
}: Readonly<ShippingRangesEditorProps>) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Determinar si es costo único
  const isFlatRate =
    ranges.length === 1 &&
    (ranges[0].toKm === null || ranges[0].toKm === maxDistance);

  const handleAddRange = () => {
    const lastRange = ranges.at(-1);

    // Si no hay rangos, crear el primero desde 0
    if (!lastRange) {
      const newRange: ShippingRange = {
        fromKm: 0,
        toKm: maxDistance ? maxDistance / 2 : 5,
        cost: 0,
      };
      onChange([newRange]);
      validateRanges([newRange]);
      return;
    }

    // Si el último rango ya llega al máximo, no permitir agregar más
    if (maxDistance && lastRange.toKm === maxDistance) {
      return;
    }

    // Si el último rango tiene toKm null, no permitir agregar más
    if (lastRange.toKm === null) {
      return;
    }

    // El nuevo rango empieza donde termina el anterior
    const remainingDistance = maxDistance ? maxDistance - lastRange.toKm : null;
    const newRange: ShippingRange = {
      fromKm: lastRange.toKm,
      toKm:
        remainingDistance !== null &&
        remainingDistance !== undefined &&
        remainingDistance <= 5
          ? maxDistance!
          : lastRange.toKm +
            (remainingDistance !== null && remainingDistance !== undefined
              ? remainingDistance / 2
              : 5),
      cost: 0,
    };

    const newRanges = [...ranges, newRange];
    onChange(newRanges);
    validateRanges(newRanges);
  };

  const handleRemoveRange = (index: number) => {
    // No permitir eliminar si solo hay uno
    if (ranges.length === 1) return;

    const newRanges = ranges.filter((_, i) => i !== index);

    // Reajustar los fromKm de los rangos siguientes
    for (let i = 1; i < newRanges.length; i++) {
      newRanges[i] = { ...newRanges[i], fromKm: newRanges[i - 1].toKm || 0 };
    }

    onChange(newRanges);
    validateRanges(newRanges);
  };

  const handleRangeChange = (
    index: number,
    field: keyof ShippingRange,
    value: number | null
  ) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };

    // Si cambiamos el toKm de un rango, actualizar el fromKm del siguiente
    if (field === "toKm" && value !== null && index < ranges.length - 1) {
      newRanges[index + 1] = { ...newRanges[index + 1], fromKm: value };

      // Reajustar todos los rangos siguientes
      for (let i = index + 2; i < newRanges.length; i++) {
        newRanges[i] = { ...newRanges[i], fromKm: newRanges[i - 1].toKm || 0 };
      }
    }

    onChange(newRanges);
    validateRanges(newRanges);
  };

  const validateRanges = (rangesToValidate: ShippingRange[]) => {
    const { valid, errors } = validateShippingRanges(rangesToValidate);
    setValidationErrors(valid ? [] : errors);
  };

  const isLastRange = (index: number) => index === ranges.length - 1;

  // Determinar si se puede agregar más rangos
  const canAddRange =
    !isFlatRate &&
    (ranges.length === 0 ||
      (ranges.at(-1)?.toKm !== null &&
        (!maxDistance || (ranges.at(-1)?.toKm || 0) < maxDistance)));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Label className="text-base font-semibold">
            Rangos de Costo de Envío
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Define los costos según la distancia.
          </p>
        </div>
      </div>

      {/* Checkbox de Costo Único */}
      <div className="flex items-start space-x-3 p-4 bg-muted/30 rounded-lg border border-border">
        <input
          id="flatRate"
          type="checkbox"
          checked={isFlatRate}
          onChange={(e) => {
            const checked = e.target.checked;
            if (checked) {
              // Convertir a costo único
              const flatRate: ShippingRange = {
                fromKm: 0,
                toKm: maxDistance || null,
                cost: ranges[0]?.cost || 0,
              };
              onChange([flatRate]);
              setValidationErrors([]);
            } else {
              // Convertir a rangos múltiples
              const midPoint = maxDistance ? maxDistance / 2 : 5;
              const firstRange: ShippingRange = {
                fromKm: 0,
                toKm: midPoint,
                cost: ranges[0]?.cost || 0,
              };
              onChange([firstRange]);
              validateRanges([firstRange]);
            }
          }}
          className="w-4 h-4 mt-1 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex-1">
          <Label
            htmlFor="flatRate"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Costo Único
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Usar el mismo costo para todas las distancias
            {maxDistance && ` (hasta ${maxDistance} km)`}
          </p>
        </div>
      </div>

      {maxDistance !== null && maxDistance !== undefined && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            📍 Distancia máxima de envío: {maxDistance} km
          </p>
        </div>
      )}

      {ranges.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground mb-2">
            No hay rangos configurados
          </p>
          <p className="text-xs text-muted-foreground">
            Configura al menos un rango de envío
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRange}
            className="mt-3"
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Primer Rango
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {ranges.map((range, index) => {
              const rangeKey = `range-${range.fromKm}-${range.toKm}-${index}`;
              return (
                <div
                  key={rangeKey}
                  className="flex items-end gap-3 p-4 bg-muted/50 rounded-lg border"
                >
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">
                      Desde (km)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={range.fromKm}
                      disabled
                      className="mt-1 bg-muted/50"
                    />
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">
                      Hasta (km) {!isFlatRate && !isLastRange(index) && "*"}
                    </Label>
                    <Input
                      type="number"
                      min={range.fromKm + 0.1}
                      max={maxDistance || undefined}
                      step="0.1"
                      value={range.toKm ?? ""}
                      onChange={(e) =>
                        handleRangeChange(
                          index,
                          "toKm",
                          e.target.value === ""
                            ? null
                            : Number.parseFloat(e.target.value)
                        )
                      }
                      placeholder={maxDistance ? maxDistance.toString() : ""}
                      disabled={isFlatRate}
                      required={!isFlatRate && !isLastRange(index)}
                      className="mt-1"
                    />
                    {!isFlatRate && !isLastRange(index) && range.toKm && (
                      <p className="text-xs text-muted-foreground mt-1">
                        El siguiente rango iniciará en {range.toKm}km
                      </p>
                    )}
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">
                      Costo ($) *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="100"
                      value={range.cost}
                      onChange={(e) =>
                        handleRangeChange(
                          index,
                          "cost",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  {!isFlatRate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRange(index)}
                      disabled={ranges.length === 1}
                      className="shrink-0"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {!isFlatRate && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRange}
              disabled={!canAddRange}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Agregar Rango
            </Button>
          )}
        </>
      )}

      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Errores de validación:
              </p>
              <ul className="mt-1 text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                {validationErrors.map((error, idx) => (
                  <li key={`error-${idx}-${error.substring(0, 20)}`}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {ranges.length > 0 && validationErrors.length === 0 && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            ✓ Vista previa:
          </p>
          <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
            {ranges.map((range, idx) => (
              <li key={`preview-${range.fromKm}-${range.toKm}-${idx}`}>
                • {formatShippingRange(range)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
