"use client";

import { useState } from "react";
import { Eye, Package, Tag, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { optimizeProductImage } from "@/lib/cloudinary-utils";

// Componente de Carrusel de Imágenes Mejorado
type ImageCarouselProps = {
  images: string[];
  productName: string;
};

function ImageCarousel({ images, productName }: Readonly<ImageCarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full aspect-square sm:aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 group">
      {/* Carousel wrapper */}
      <div className="relative h-full overflow-hidden">
        {images.map((url, index) => (
          <div
            key={`${productName}-${index}-${url.substring(url.length - 20)}`}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            }`}
          >
            <img
              src={optimizeProductImage(url)}
              alt={`${productName} - Imagen ${index + 1}`}
              className="absolute block w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            />
            {/* Overlay gradient sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Contador de imágenes */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 z-30 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Slider indicators (thumbnails) */}
      {images.length > 1 && (
        <div className="absolute z-30 flex gap-2 bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full">
          {images.map((url, idx) => (
            <button
              key={`${productName}-indicator-${idx}-${url.substring(
                url.length - 10
              )}`}
              type="button"
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-current={idx === currentIndex}
              aria-label={`Slide ${idx + 1}`}
              onClick={(e) => goToImage(idx, e)}
            />
          ))}
        </div>
      )}

      {/* Slider controls */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            onClick={prevImage}
          >
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg transition-all hover:scale-110">
              <svg
                className="w-5 h-5 text-gray-800 dark:text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
              <span className="sr-only">Previous</span>
            </span>
          </button>
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
            onClick={nextImage}
          >
            <span className="inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-lg transition-all hover:scale-110">
              <svg
                className="w-5 h-5 text-gray-800 dark:text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="sr-only">Next</span>
            </span>
          </button>
        </>
      )}
    </div>
  );
}

interface ProductDetailDialogProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    images: unknown;
    sku: string | null;
    category?: {
      name: string;
      icon: string | null;
    } | null;
  };
  triggerButton?: React.ReactNode;
}

export default function ProductDetailDialog({
  product,
  triggerButton,
}: Readonly<ProductDetailDialogProps>) {
  const [open, setOpen] = useState(false);

  const productImages = product.images
    ? Array.isArray(product.images)
      ? product.images
      : []
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="ghost"
            size="sm"
            className="bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-primary dark:text-primary border border-primary/30 hover:border-primary/50 text-xs font-bold transition-all hover:scale-105 hover:shadow-md hover:shadow-primary/20"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Ver detalles
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-card via-card to-card/95">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border/50">
          <DialogHeader className="p-4 sm:p-6 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <DialogTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground leading-tight pr-8">
                  {product.name}
                </DialogTitle>

                {/* Badges de categoría y SKU */}
                <DialogDescription asChild>
                  <div className="flex flex-wrap gap-2">
                    {product.category && (
                      <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/25 transition-colors text-xs sm:text-sm">
                        {product.category.icon && (
                          <span className="mr-1.5 text-base">
                            {product.category.icon}
                          </span>
                        )}
                        {product.category.name}
                      </Badge>
                    )}
                    {product.sku && (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground border-border/50 text-xs sm:text-sm"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {product.sku}
                      </Badge>
                    )}
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)] custom-scrollbar">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Imágenes del producto */}
            {productImages.length > 0 ? (
              <div className="relative">
                <ImageCarousel
                  images={productImages}
                  productName={product.name}
                />
              </div>
            ) : (
              <div className="relative w-full aspect-square sm:aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center border border-border/50">
                <div className="text-center space-y-3">
                  <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sin imagen disponible
                  </p>
                </div>
              </div>
            )}

            {/* Grid de Precio y Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Card de Precio */}
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-5 transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                <div className="relative space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Precio
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Card de Stock */}
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-accent/5 to-accent/10 p-4 sm:p-5 transition-all hover:shadow-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
                <div className="relative space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Package className="w-4 h-4" />
                    Stock Disponible
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl sm:text-4xl font-bold text-foreground">
                      {product.stock}
                    </p>
                    <Badge
                      variant={product.stock > 0 ? "default" : "secondary"}
                      className={
                        product.stock > 0
                          ? "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 font-semibold"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {product.stock > 0 ? "Disponible" : "Agotado"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {product.description ? (
              <div className="rounded-xl border border-border/50 bg-card/50 p-4 sm:p-5 space-y-3">
                <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  Descripción del Producto
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-6 sm:p-8 text-center">
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  Este producto no tiene descripción
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Agrega una descripción para dar más detalles a tus clientes
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
