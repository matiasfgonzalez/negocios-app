import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un precio en formato argentino
 * Ejemplo: 955000 -> "$ 955.000,00"
 * @param price - El precio a formatear
 * @param showDecimals - Si mostrar decimales (default: true)
 * @returns El precio formateado como string
 */
export function formatPrice(
  price: number,
  showDecimals: boolean = true
): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
}

/**
 * Formatea un precio sin el símbolo de moneda
 * Ejemplo: 955000 -> "955.000,00"
 * @param price - El precio a formatear
 * @param showDecimals - Si mostrar decimales (default: true)
 * @returns El precio formateado como string sin símbolo
 */
export function formatNumber(
  price: number,
  showDecimals: boolean = true
): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
}
