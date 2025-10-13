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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      {/* Header del Negocio */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                  <StoreIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {business.name}
                  </h1>
                  <Badge className="mt-1 bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                    {business.rubro}
                  </Badge>
                </div>
              </div>

              {business.description && (
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {business.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {business.addressText && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    <span>{business.addressText}</span>
                  </div>
                )}
                {business.whatsappPhone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-secondary-500" />
                    <a
                      href={`https://wa.me/${business.whatsappPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors"
                    >
                      {business.whatsappPhone}
                    </a>
                  </div>
                )}
                {business.aliasPago && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <DollarSign className="w-4 h-4 text-secondary-500" />
                    <span>Alias: {business.aliasPago}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Botón del carrito */}
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrito {cart.length > 0 && `(${cart.length})`}
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-bounce shadow-lg">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Productos Disponibles
            </h2>

            {business.products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No hay productos disponibles en este momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {business.products.map((product) => {
                  const cartQty = getCartQuantity(product.id);
                  return (
                    <Card
                      key={product.id}
                      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg text-gray-900 dark:text-white">
                            {product.name}
                          </CardTitle>
                          <Badge
                            variant={
                              product.stock > 0 ? "default" : "secondary"
                            }
                            className={
                              product.stock > 0
                                ? "bg-secondary-100 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300"
                                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }
                          >
                            Stock: {product.stock}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {product.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {product.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ${product.price.toFixed(2)}
                          </span>

                          {cartQty > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, -1)}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:border-red-700 transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="text-lg font-semibold min-w-[2rem] text-center text-gray-900 dark:text-white">
                                {cartQty}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, 1)}
                                disabled={cartQty >= product.stock}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-900/20 dark:hover:border-green-700 transition-colors disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(product)}
                              disabled={product.stock === 0}
                              className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                            >
                              <Plus className="w-4 h-4 mr-1" />
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

          {/* Panel del Carrito */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card
                className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-300 ${
                  showCart
                    ? "border-2 border-primary-500 shadow-2xl ring-4 ring-primary-100 dark:ring-primary-900/30"
                    : "border border-gray-200 dark:border-gray-700 shadow-lg"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <ShoppingCart className="w-5 h-5" />
                    Tu Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Tu carrito está vacío
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Items del carrito */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cart.map((item) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                ${item.price.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary-600 dark:text-primary-400">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(item.productId)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tipo de entrega */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Label className="text-base font-semibold mb-3 block text-gray-900 dark:text-white">
                          Tipo de Entrega
                        </Label>
                        <RadioGroup
                          value={deliveryType}
                          onValueChange={(value) =>
                            setDeliveryType(value as "pickup" | "delivery")
                          }
                          className="space-y-3"
                        >
                          <div
                            className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                              deliveryType === "pickup"
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <RadioGroupItem value="pickup" id="pickup" />
                            <Label
                              htmlFor="pickup"
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <Package className="w-5 h-5 text-primary-500" />
                              <span className="text-gray-900 dark:text-white font-medium">
                                Retiro en el local
                              </span>
                            </Label>
                          </div>
                          <div
                            className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                              deliveryType === "delivery"
                                ? "border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20 shadow-md"
                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <RadioGroupItem value="delivery" id="delivery" />
                            <Label
                              htmlFor="delivery"
                              className="flex items-center gap-2 cursor-pointer flex-1"
                            >
                              <Truck className="w-5 h-5 text-secondary-500" />
                              <span className="text-gray-900 dark:text-white font-medium">
                                Envío a domicilio
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Mapa de ubicación si es envío */}
                      {deliveryType === "delivery" && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-semibold mb-2 block text-gray-900 dark:text-white">
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
                            <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-2">
                              ✓ Ubicación seleccionada
                            </p>
                          )}
                        </div>
                      )}

                      {/* Total y botón de compra */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            Total:
                          </span>
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ${total.toFixed(2)}
                          </span>
                        </div>

                        <Button
                          onClick={handleCheckout}
                          disabled={
                            cart.length === 0 ||
                            (deliveryType === "delivery" && !deliveryLocation)
                          }
                          className="w-full bg-gradient-to-r from-secondary-500 to-primary-500 hover:from-secondary-600 hover:to-primary-600 text-white font-bold py-3 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
