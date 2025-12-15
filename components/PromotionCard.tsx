"use client";

import { useState } from "react";
import {
  Tag,
  ShoppingCart,
  Calendar,
  Package,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromotionWithProducts } from "@/app/types/types";
import { optimizeProductImage } from "@/lib/cloudinary-utils";
import { formatPrice } from "@/lib/utils";

interface PromotionCardProps {
  promotion: PromotionWithProducts;
  onAddToCart?: () => void;
  onUpdateQuantity?: (delta: number) => void;
  canOrder: boolean;
  cartQuantity?: number;
}

export default function PromotionCard({
  promotion,
  onAddToCart,
  onUpdateQuantity,
  canOrder,
  cartQuantity = 0,
}: Readonly<PromotionCardProps>) {
  const [showDetails, setShowDetails] = useState(false);

  // Calcular precio individual total (suma de todos los productos)
  const individualPrice = promotion.products.reduce(
    (sum, p) => sum + (p.product?.price ?? 0) * p.quantity,
    0
  );

  // Calcular ahorro
  const savings = individualPrice - promotion.price;
  const savingsPercentage =
    individualPrice > 0 ? (savings / individualPrice) * 100 : 0;

  // Formatear fechas
  const formatDate = (date: Date | string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const startDate = formatDate(promotion.startDate);
  const endDate = formatDate(promotion.endDate);

  return (
    <Card className="bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm border-2 border-primary/30 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden group relative">
      {/* Efecto decorativo de brillo */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />

      {/* Badge flotante de descuento */}
      {savingsPercentage > 0 && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg font-bold text-sm px-3 py-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {savingsPercentage.toFixed(0)}% OFF
          </Badge>
        </div>
      )}

      <CardContent className="p-4 sm:p-5 relative">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Imagen de la promoción */}
          <div className="w-full sm:w-32 h-32 flex-shrink-0">
            {promotion.image ? (
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                <img
                  src={optimizeProductImage(promotion.image)}
                  alt={promotion.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                <Tag className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Información de la promoción */}
          <div className="flex-1 space-y-3">
            {/* Título y descripción */}
            <div>
              <div className="flex items-start gap-2 mb-1.5">
                <Tag className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {promotion.name}
                </h3>
              </div>
              {promotion.description && (
                <p className="text-sm text-muted-foreground leading-relaxed ml-7">
                  {promotion.description}
                </p>
              )}
            </div>

            {/* Precio y ahorro */}
            <div className="flex flex-wrap items-end gap-3 ml-7">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(promotion.price)}
                </span>
                {individualPrice > promotion.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(individualPrice)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30 text-sm font-semibold">
                  Ahorrás {formatPrice(savings)}
                </Badge>
              )}
            </div>

            {/* Botón de detalles y controles de cantidad */}
            <div className="flex flex-wrap items-center gap-2 ml-7">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {showDetails ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1.5" />
                    Ocultar detalles
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1.5" />
                    Ver detalles ({promotion.products.length} productos)
                  </>
                )}
              </Button>

              {/* Controles de cantidad o botón agregar */}
              {onAddToCart && (
                <div className="flex items-center gap-2">
                  {cartQuantity > 0 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity?.(-1)}
                        disabled={!canOrder}
                        className="h-8 w-8 p-0 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 border-border"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-base font-semibold min-w-[2rem] text-center text-foreground">
                        {cartQuantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateQuantity?.(1)}
                        disabled={
                          !canOrder ||
                          (promotion.stock !== null &&
                            cartQuantity >= promotion.stock)
                        }
                        className="h-8 w-8 p-0 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50 border-border"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={onAddToCart}
                      disabled={
                        !canOrder ||
                        (promotion.stock !== null && promotion.stock <= 0)
                      }
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      {canOrder ? "Agregar al carrito" : "No disponible"}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="flex flex-wrap items-center gap-2 ml-7">
              {/* Stock */}
              {promotion.stock !== null && (
                <Badge
                  variant="outline"
                  className={
                    promotion.stock > 0
                      ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                      : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                  }
                >
                  <Package className="w-3 h-3 mr-1" />
                  {promotion.stock > 0
                    ? `Stock: ${promotion.stock}`
                    : "Sin stock"}
                </Badge>
              )}

              {/* Fechas */}
              {(startDate || endDate) && (
                <Badge variant="outline" className="border-border bg-muted/50">
                  <Calendar className="w-3 h-3 mr-1" />
                  {startDate && endDate
                    ? `${startDate} - ${endDate}`
                    : startDate
                    ? `Desde ${startDate}`
                    : `Hasta ${endDate}`}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Detalles expandibles */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-border/50 ml-0 sm:ml-7">
            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Productos incluidos:
              </p>
              <div className="space-y-1.5">
                {promotion.products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-sm bg-background/50 rounded px-3 py-2 border border-border/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                        {p.quantity}x
                      </span>
                      <span className="font-medium text-foreground">
                        {p.product?.name ?? "Producto"}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {formatPrice((p.product?.price ?? 0) * p.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="pt-2 mt-2 border-t border-border/30 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Precio individual:
                  </span>
                  <span className="font-semibold text-muted-foreground line-through">
                    {formatPrice(individualPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-bold text-foreground">
                    Precio promoción:
                  </span>
                  <span className="font-bold text-primary text-lg">
                    {formatPrice(promotion.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
