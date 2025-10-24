/**
 * Utilidades para el cálculo de costos de envío por distancia
 */

export interface ShippingRange {
  fromKm: number;
  toKm: number | null; // null representa "infinito"
  cost: number;
}

/**
 * Calcula el costo de envío basado en la distancia y los rangos configurados
 * @param distanceKm Distancia en kilómetros
 * @param ranges Rangos de costos de envío
 * @param defaultCost Costo por defecto si no hay rangos configurados
 * @returns Costo de envío o null si la distancia excede el máximo
 */
export function calculateShippingCost(
  distanceKm: number,
  ranges: ShippingRange[] | null,
  defaultCost: number = 0
): number | null {
  // Si no hay rangos configurados, usar costo por defecto
  if (!ranges || ranges.length === 0) {
    return defaultCost;
  }

  // Buscar el rango que corresponde a la distancia
  for (const range of ranges) {
    const isInRange =
      distanceKm >= range.fromKm &&
      (range.toKm === null || distanceKm < range.toKm);

    if (isInRange) {
      return range.cost;
    }
  }

  // Si no se encuentra un rango válido, la distancia excede el máximo
  return null;
}

/**
 * Valida que los rangos de envío sean correctos
 * @param ranges Rangos a validar
 * @returns true si son válidos, false si no
 */
export function validateShippingRanges(ranges: ShippingRange[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (ranges.length === 0) {
    return { valid: true, errors: [] };
  }

  // Ordenar rangos por fromKm
  const sortedRanges = [...ranges].sort((a, b) => a.fromKm - b.fromKm);

  // Validar que el primer rango empiece en 0
  if (sortedRanges[0].fromKm !== 0) {
    errors.push("El primer rango debe comenzar en 0 km");
  }

  // Validar que no haya gaps ni overlaps
  for (let i = 0; i < sortedRanges.length - 1; i++) {
    const current = sortedRanges[i];
    const next = sortedRanges[i + 1];

    // Validar que toKm no sea null excepto en el último rango
    if (current.toKm === null) {
      errors.push(
        `El rango ${i + 1} tiene toKm null pero no es el último rango`
      );
    }

    // Validar que no haya gaps
    if (current.toKm !== null && current.toKm !== next.fromKm) {
      errors.push(
        `Hay un gap entre el rango ${i + 1} (${current.fromKm}-${
          current.toKm
        }km) y el rango ${i + 2} (${next.fromKm}-${next.toKm}km)`
      );
    }

    // Validar que fromKm < toKm
    if (current.toKm !== null && current.fromKm >= current.toKm) {
      errors.push(
        `El rango ${i + 1} tiene fromKm >= toKm (${current.fromKm}-${
          current.toKm
        }km)`
      );
    }
  }

  // Validar que los costos sean positivos
  for (let i = 0; i < sortedRanges.length; i++) {
    if (sortedRanges[i].cost < 0) {
      errors.push(`El rango ${i + 1} tiene un costo negativo`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Verifica si una distancia está dentro del rango de envío permitido
 * @param distanceKm Distancia en kilómetros
 * @param maxDistance Distancia máxima permitida (null = sin límite)
 * @returns true si está dentro del rango, false si no
 */
export function isWithinShippingRange(
  distanceKm: number,
  maxDistance: number | null
): boolean {
  if (maxDistance === null) {
    return true; // Sin límite
  }
  return distanceKm <= maxDistance;
}

/**
 * Formatea un rango de envío para mostrar
 * @param range Rango de envío
 * @returns String formateado
 */
export function formatShippingRange(range: ShippingRange): string {
  const from = range.fromKm.toFixed(1);
  const to = range.toKm === null ? "∞" : range.toKm.toFixed(1);
  const cost = range.cost.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
  return `${from} - ${to} km: ${cost}`;
}

/**
 * Crea un rango de envío único (costo fijo sin importar la distancia)
 * @param cost Costo fijo
 * @returns Array con un único rango
 */
export function createFlatShippingRate(cost: number): ShippingRange[] {
  return [
    {
      fromKm: 0,
      toKm: null,
      cost,
    },
  ];
}

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * @param lat1 Latitud del punto 1
 * @param lng1 Longitud del punto 1
 * @param lat2 Latitud del punto 2
 * @param lng2 Longitud del punto 2
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Redondear a 2 decimales
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
