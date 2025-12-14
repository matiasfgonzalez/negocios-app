"use client";

import { useState, useEffect, useRef } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

type SmartProductImageProps = {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  priority?: boolean;
};

/**
 * SmartProductImage - Componente inteligente para mostrar imágenes de productos
 *
 * Detecta automáticamente si la imagen es vertical (portrait) u horizontal (landscape)
 * y ajusta el modo de visualización para mostrar la imagen completa sin recortes.
 *
 * - Imágenes verticales (botellas, etc.): object-contain con fondo degradado elegante
 * - Imágenes horizontales/cuadradas: object-cover para llenar el espacio
 */
export function SmartProductImage({
  src,
  alt,
  className,
  containerClassName,
  fallbackIcon,
  priority = false,
}: SmartProductImageProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset states cuando cambia la imagen
    setIsPortrait(null);
    setIsLoaded(false);
    setHasError(false);

    if (!src) {
      setHasError(true);
      return;
    }

    // Pre-cargar la imagen para obtener sus dimensiones
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      // Es portrait si el alto es mayor que el ancho (ratio < 0.85)
      // Usamos 0.85 para dar un margen y considerar imágenes casi cuadradas como landscape
      setIsPortrait(aspectRatio < 0.85);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50",
          containerClassName
        )}
      >
        {fallbackIcon || (
          <Package className="w-12 h-12 text-muted-foreground/40" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        containerClassName
      )}
    >
      {/* Fondo con blur para imágenes portrait */}
      {isPortrait && isLoaded && (
        <div
          className="absolute inset-0 scale-150 blur-2xl opacity-30"
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Fondo degradado elegante para imágenes portrait */}
      {isPortrait && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
      )}

      {/* Imagen principal */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={cn(
          "absolute inset-0 w-full h-full transition-all duration-500",
          // Si aún no sabemos la orientación, usar object-cover por defecto
          isPortrait === null && "object-cover",
          // Imagen portrait: object-contain para mostrar completa
          isPortrait === true && "object-contain p-2 z-10",
          // Imagen landscape/cuadrada: object-cover para llenar el espacio
          isPortrait === false && "object-cover",
          // Fade in cuando carga
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
      )}
    </div>
  );
}

/**
 * Hook para detectar si una imagen es portrait
 * Útil cuando necesitas la información fuera del componente
 */
export function useImageOrientation(src: string | undefined | null) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      setIsPortrait(aspectRatio < 0.85);
      setIsLoading(false);
    };

    img.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { isPortrait, isLoading };
}
