// lib/geocoding.ts

export interface ReverseGeocodeResult {
  street?: string;
  streetNumber?: string;
  city?: string;
  region?: string;
  country?: string;
  fullAddress: string;
}

/**
 * Realiza geocodificación inversa usando Nominatim de OpenStreetMap
 * para obtener la dirección a partir de coordenadas
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "BarrioMarket/1.0", // Requerido por Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener dirección");
    }

    const data = await response.json();

    // Construir dirección formateada en español argentino
    const address = data.address || {};

    const street = address.road || address.pedestrian || "";
    const streetNumber = address.house_number || "";
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      "";
    const region = address.state || address.province || "";
    const country = address.country || "";

    // Formato argentino: "Calle Número, Ciudad, Provincia"
    let formattedAddress = "";
    if (street) {
      formattedAddress = streetNumber ? `${street} ${streetNumber}` : street;
    }
    if (city) {
      formattedAddress = formattedAddress
        ? `${formattedAddress}, ${city}`
        : city;
    }
    if (region) {
      formattedAddress = formattedAddress
        ? `${formattedAddress}, ${region}`
        : region;
    }

    return {
      street,
      streetNumber,
      city,
      region,
      country,
      fullAddress: formattedAddress || data.display_name || "",
    };
  } catch (error) {
    console.error("Error en geocodificación inversa:", error);
    // Retornar dirección vacía en caso de error
    return {
      fullAddress: "",
    };
  }
}
