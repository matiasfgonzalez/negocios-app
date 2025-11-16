"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
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

// Componente de Carrusel de Imágenes
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
    <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden group">
      {/* Carousel wrapper */}
      <div className="relative h-full overflow-hidden">
        {images.map((url, index) => (
          <div
            key={`${productName}-${index}-${url.substring(url.length - 20)}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={optimizeProductImage(url)}
              alt={`${productName} - Imagen ${index + 1}`}
              className="absolute block w-full h-full object-contain -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 bg-muted"
            />
          </div>
        ))}
      </div>

      {/* Slider indicators */}
      {images.length > 1 && (
        <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
          {images.map((url, idx) => (
            <button
              key={`${productName}-indicator-${idx}-${url.substring(
                url.length - 10
              )}`}
              type="button"
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-white"
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
            className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/prev focus:outline-none"
            onClick={prevImage}
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover/prev:bg-white/50 dark:group-hover/prev:bg-gray-800/60">
              <svg
                className="w-4 h-4 text-white dark:text-gray-200"
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
            className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/next focus:outline-none"
            onClick={nextImage}
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover/next:bg-white/50 dark:group-hover/next:bg-gray-800/60">
              <svg
                className="w-4 h-4 text-white dark:text-gray-200"
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
          <Button variant="ghost" size="sm" className="hover:bg-accent text-xs">
            <Eye className="w-3.5 h-3.5 mr-1" />
            Ver detalles
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {product.name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              {/* Categoría y SKU */}
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    {product.category.icon && (
                      <span className="mr-1">{product.category.icon}</span>
                    )}
                    {product.category.name}
                  </Badge>
                )}
                {product.sku && (
                  <Badge variant="outline" className="text-muted-foreground">
                    SKU: {product.sku}
                  </Badge>
                )}
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imágenes del producto */}
          {productImages.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <ImageCarousel
                images={productImages}
                productName={product.name}
              />
            </div>
          )}

          {/* Precio y Stock */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Precio</p>
              <p className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Stock</p>
              <Badge
                variant={product.stock > 0 ? "default" : "secondary"}
                className={
                  product.stock > 0
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-lg px-3 py-1"
                    : "bg-muted text-muted-foreground border-border text-lg px-3 py-1"
                }
              >
                {product.stock} unidades
              </Badge>
            </div>
          </div>

          {/* Descripción */}
          {product.description && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Descripción
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {!product.description && (
            <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
              <p className="text-sm text-muted-foreground">
                Este producto no tiene descripción
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
