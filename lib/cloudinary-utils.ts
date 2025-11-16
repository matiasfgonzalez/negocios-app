/**
 * Optimiza las URLs de Cloudinary aplicando transformaciones
 * para mejorar la calidad y el rendimiento de las imágenes
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "thumb" | "pad";
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
  quality?: "auto" | number;
  format?: "auto" | "webp" | "jpg" | "png";
}

/**
 * Detecta si una URL es de Cloudinary
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}

/**
 * Optimiza una URL de Cloudinary aplicando transformaciones
 * Si la URL no es de Cloudinary, la retorna sin cambios
 */
export function optimizeCloudinaryImage(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  // Si no hay URL o no es de Cloudinary, retornar la URL original o string vacío
  if (!url || !isCloudinaryUrl(url)) {
    return url || "";
  }

  const {
    width,
    height,
    crop = "fill",
    gravity = "auto",
    quality = "auto",
    format = "auto",
  } = options;

  try {
    // Construir la cadena de transformaciones
    const transformations: string[] = [];

    // Crop y gravity
    if (width || height) {
      const dimensions: string[] = [];
      if (width) dimensions.push(`w_${width}`);
      if (height) dimensions.push(`h_${height}`);
      dimensions.push(`c_${crop}`);
      if (crop === "fill" || crop === "thumb") {
        dimensions.push(`g_${gravity}`);
      }
      transformations.push(dimensions.join(","));
    }

    // Calidad
    if (quality) {
      transformations.push(`q_${quality}`);
    }

    // Formato
    if (format) {
      transformations.push(`f_${format}`);
    }

    // Si hay transformaciones, insertarlas en la URL
    if (transformations.length > 0) {
      const transformString = transformations.join("/");

      // Buscar el patrón /upload/ o /upload/v{version}/ en la URL
      const uploadPattern = /\/upload\//;
      if (uploadPattern.test(url)) {
        // Insertar las transformaciones después de /upload/
        return url.replace(/\/upload\//, `/upload/${transformString}/`);
      }
    }

    return url;
  } catch (error) {
    console.error("Error optimizing Cloudinary URL:", error);
    return url;
  }
}

/**
 * Optimiza una URL de imagen de negocio (card)
 */
export function optimizeBusinessCardImage(
  url: string | null | undefined
): string {
  return optimizeCloudinaryImage(url, {
    width: 600,
    height: 400,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

/**
 * Optimiza una URL de imagen de negocio (detalle)
 */
export function optimizeBusinessDetailImage(
  url: string | null | undefined
): string {
  return optimizeCloudinaryImage(url, {
    width: 1200,
    height: 600,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

/**
 * Optimiza una URL de imagen de producto (carousel)
 */
export function optimizeProductImage(url: string | null | undefined): string {
  return optimizeCloudinaryImage(url, {
    width: 800,
    height: 800,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

/**
 * Optimiza una URL de thumbnail
 */
export function optimizeThumbnail(url: string | null | undefined): string {
  return optimizeCloudinaryImage(url, {
    width: 150,
    height: 150,
    crop: "thumb",
    gravity: "face",
    quality: "auto",
    format: "auto",
  });
}
