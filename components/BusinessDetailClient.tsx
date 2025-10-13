"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  DollarSign,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  Truck,
  Store as StoreIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";

const OrderMapSelector = dynamic(
  () => import("@/components/OrderMapSelector"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
}

interface BusinessDetailClientProps {
  business: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    rubro: string;
    img: string | null;
    whatsappPhone: string | null;
    aliasPago: string | null;
    addressText: string | null;
    lat: number | null;
    lng: number | null;
    products: Array<{
      id: string;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      available: boolean;
      images: any;
    }>;
  };
}

export default function BusinessDetailClient({
  business,
}: BusinessDetailClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(
    "pickup"
  );
  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showCart, setShowCart] = useState(false);

  // Función para agregar producto al carrito
  const addToCart = (product: (typeof business.products)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity < product.stock) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prev;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
    setShowCart(true);
  };

  // Función para actualizar cantidad
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + delta;
            if (newQuantity <= 0) return null;
            if (newQuantity > item.stock) return item;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  // Función para remover del carrito
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Calcular total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Obtener cantidad de un producto en el carrito
  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  // Función para procesar el pedido
  const handleCheckout = () => {
    if (deliveryType === "delivery" && !deliveryLocation) {
      alert("Por favor, selecciona tu ubicación en el mapa");
      return;
    }

    // Aquí implementarías la lógica para crear la orden
    console.log("Pedido:", {
      businessId: business.id,
      items: cart,
      deliveryType,
      deliveryLocation,
      total,
    });

    alert("¡Pedido realizado con éxito!");
    setCart([]);
    setShowCart(false);
  };

  return (
    <div className="min-h-screen">
      {/* UI improved: Enhanced Business Header */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                {business.img ? (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-muted">
                    <img
                      src={business.img}
                      alt={`Logo de ${business.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                    <StoreIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {business.name}
                  </h1>
                  <Badge className="mt-1.5 bg-primary/10 text-primary border-primary/20">
                    {business.rubro}
                  </Badge>
                </div>
              </div>

              {business.description && (
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {business.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                {business.addressText && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span>{business.addressText}</span>
                  </div>
                )}
                {business.whatsappPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                    <a
                      href={`https://wa.me/${business.whatsappPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      {business.whatsappPhone}
                    </a>
                  </div>
                )}
                {business.aliasPago && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
                    <span>Alias: {business.aliasPago}</span>
                  </div>
                )}
              </div>
            </div>

            {/* UI improved: Enhanced Cart Button */}
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Carrito {cart.length > 0 && `(${cart.length})`}
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold animate-bounce shadow-md">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* UI improved: Enhanced Products List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
              Productos Disponibles
            </h2>

            {business.products.length === 0 ? (
              <Card className="bg-card/50 border-border">
                <CardContent className="py-12 text-center">
                  <Package className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    No hay productos disponibles en este momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {business.products.map((product) => {
                  const cartQty = getCartQuantity(product.id);
                  return (
                    <Card
                      key={product.id}
                      className="bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 border-border group"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle className="text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                            {product.name}
                          </CardTitle>
                          <Badge
                            variant={
                              product.stock > 0 ? "default" : "secondary"
                            }
                            className={
                              product.stock > 0
                                ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }
                          >
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {product.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>

                          {cartQty > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, -1)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 transition-colors border-border"
                              >
                                <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                              <span className="text-base sm:text-lg font-semibold min-w-[2rem] text-center text-foreground">
                                {cartQty}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, 1)}
                                disabled={cartQty >= product.stock}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50 border-border"
                              >
                                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                              Agregar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* UI improved: Enhanced Cart Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card
                className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${
                  showCart
                    ? "border-2 border-primary shadow-xl ring-4 ring-primary/10"
                    : "border-border shadow-md"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    Tu Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Tu carrito está vacío
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* UI improved: Enhanced Cart Items */}
                      <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 hover:shadow-sm transition-all"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm text-foreground truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm sm:text-base text-primary">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(item.productId)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10 transition-all hover:scale-110"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* UI improved: Enhanced Delivery Type */}
                      <div className="pt-4 border-t border-border">
                        <Label className="text-sm sm:text-base font-semibold mb-3 block text-foreground">
                          Tipo de Entrega
                        </Label>
                        <RadioGroup
                          value={deliveryType}
                          onValueChange={(value) =>
                            setDeliveryType(value as "pickup" | "delivery")
                          }
                          className="space-y-2.5 sm:space-y-3"
                        >
                          <div
                            className={`flex items-center space-x-3 p-2.5 sm:p-3 border-2 rounded-lg transition-all cursor-pointer ${
                              deliveryType === "pickup"
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <RadioGroupItem value="pickup" id="pickup" />
                            <Label
                              htmlFor="pickup"
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <span className="text-xs sm:text-sm text-foreground font-medium">
                                Retiro en el local
                              </span>
                            </Label>
                          </div>
                          <div
                            className={`flex items-center space-x-3 p-2.5 sm:p-3 border-2 rounded-lg transition-all cursor-pointer ${
                              deliveryType === "delivery"
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border hover:bg-accent/50"
                            }`}
                          >
                            <RadioGroupItem value="delivery" id="delivery" />
                            <Label
                              htmlFor="delivery"
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                              <span className="text-xs sm:text-sm text-foreground font-medium">
                                Envío a domicilio
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* UI improved: Enhanced Map Selector */}
                      {deliveryType === "delivery" && (
                        <div className="pt-4 border-t border-border">
                          <Label className="text-xs sm:text-sm font-semibold mb-2 block text-foreground">
                            Selecciona tu ubicación
                          </Label>
                          <OrderMapSelector
                            onLocationSelect={setDeliveryLocation}
                            businessLocation={
                              business.lat && business.lng
                                ? { lat: business.lat, lng: business.lng }
                                : undefined
                            }
                          />
                          {deliveryLocation && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              ✓ Ubicación seleccionada
                            </p>
                          )}
                        </div>
                      )}

                      {/* UI improved: Enhanced Total and Checkout */}
                      <div className="pt-4 border-t border-border space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base sm:text-lg font-semibold text-foreground">
                            Total:
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ${total.toFixed(2)}
                          </span>
                        </div>

                        <Button
                          onClick={handleCheckout}
                          disabled={
                            cart.length === 0 ||
                            (deliveryType === "delivery" && !deliveryLocation)
                          }
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                          size="lg"
                        >
                          Realizar Pedido
                        </Button>

                        {deliveryType === "delivery" && !deliveryLocation && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                            Selecciona tu ubicación en el mapa
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
