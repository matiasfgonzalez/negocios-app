"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  Loader2,
  LogIn,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import OrderSuccessDialog from "@/components/OrderSuccessDialog";
import OrderErrorDialog from "@/components/OrderErrorDialog";
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

// Componente de Carrusel de Imágenes (Estilo Flowbite)
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
    <div className="relative w-full h-48 md:h-56 rounded-t-lg overflow-hidden group">
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
              src={url}
              alt={`${productName} - Imagen ${index + 1}`}
              className="absolute block w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            />
          </div>
        ))}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

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
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover/prev:bg-white/50 dark:group-hover/prev:bg-gray-800/60 group-focus/prev:ring-4 group-focus/prev:ring-white dark:group-focus/prev:ring-gray-800/70 group-focus/prev:outline-none">
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
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover/next:bg-white/50 dark:group-hover/next:bg-gray-800/60 group-focus/next:ring-4 group-focus/next:ring-white dark:group-focus/next:ring-gray-800/70 group-focus/next:outline-none">
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
    hasShipping: boolean;
    shippingCost: number | null;
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
}: Readonly<BusinessDetailClientProps>) {
  const { isSignedIn, isLoaded } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">(
    "pickup"
  );
  const [deliveryLocation, setDeliveryLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    total: number;
    whatsappLink: string | null;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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

  // Calcular subtotal y total
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost =
    deliveryType === "delivery" && business.hasShipping
      ? business.shippingCost || 0
      : 0;
  const total = subtotal + shippingCost;

  // Obtener cantidad de un producto en el carrito
  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  // Función para generar mensaje de WhatsApp para usuarios sin sesión
  const generateWhatsAppMessage = () => {
    let message = `Hola! Quiero realizar un pedido en *${business.name}*\n\n`;
    message += `📋 *Detalle del pedido:*\n`;

    for (const item of cart) {
      message += `• ${item.quantity}x ${item.name} - $${(
        item.price * item.quantity
      ).toFixed(2)}\n`;
    }

    message += `\n💰 *Resumen:*\n`;
    message += `Subtotal: $${subtotal.toFixed(2)}\n`;

    if (deliveryType === "delivery") {
      message += `Envío: $${shippingCost.toFixed(2)}\n`;
      message += `*Total: $${total.toFixed(2)}*\n\n`;
      message += `🚚 *Envío a domicilio*\n`;
      message += `📍 Dirección: ${deliveryAddress}\n`;
      if (deliveryNote) {
        message += `📝 Nota: ${deliveryNote}\n`;
      }
    } else {
      message += `*Total: $${total.toFixed(2)}*\n\n`;
      message += `📦 *Retiro en local*\n`;
    }

    message += `\n¿Podrían confirmar mi pedido?`;

    return encodeURIComponent(message);
  };

  // Función para procesar el pedido
  const handleCheckout = async () => {
    if (deliveryType === "delivery") {
      if (!deliveryLocation) {
        setErrorMessage("Por favor, selecciona tu ubicación en el mapa");
        setShowErrorDialog(true);
        return;
      }
      if (!deliveryAddress.trim()) {
        setErrorMessage("Por favor, ingresa la dirección de entrega");
        setShowErrorDialog(true);
        return;
      }
    }

    // Si el usuario no está autenticado, redirigir a WhatsApp
    if (!isSignedIn) {
      if (!business.whatsappPhone) {
        setErrorMessage("Este negocio no tiene WhatsApp configurado");
        setShowErrorDialog(true);
        return;
      }

      const message = generateWhatsAppMessage();
      const phoneNumber = business.whatsappPhone.replaceAll(/\D/g, "");
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      window.open(whatsappUrl, "_blank");
      return;
    }

    setIsProcessingOrder(true);

    try {
      // Preparar los datos de la orden
      const orderPayload = {
        businessId: business.id,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
        shipping: deliveryType === "delivery",
        lat: deliveryType === "delivery" ? deliveryLocation?.lat : undefined,
        lng: deliveryType === "delivery" ? deliveryLocation?.lng : undefined,
        addressText: deliveryType === "delivery" ? deliveryAddress : undefined,
        note:
          deliveryType === "delivery" && deliveryNote
            ? deliveryNote
            : undefined,
        subtotal,
        shippingCost,
        total,
      };

      // Llamar al API para crear la orden
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el pedido");
      }

      const data = await response.json();

      // Limpiar el carrito
      setCart([]);
      setDeliveryAddress("");
      setDeliveryNote("");
      setDeliveryLocation(null);
      setShowCart(false);

      // Guardar datos de la orden y mostrar diálogo de éxito
      setOrderData({
        orderId: data.order.id,
        total,
        whatsappLink: data.whatsappLink,
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error desconocido al procesar el pedido"
      );
      setShowErrorDialog(true);
    } finally {
      setIsProcessingOrder(false);
    }
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
                {business.hasShipping && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                    <span>
                      Envío disponible: $
                      {business.shippingCost?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                {!business.hasShipping && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Solo retiro en local</span>
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
                  const productImages = product.images
                    ? Array.isArray(product.images)
                      ? product.images
                      : []
                    : [];

                  return (
                    <Card
                      key={product.id}
                      className="bg-card/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 border-border group overflow-hidden"
                    >
                      {/* Carrusel de Imágenes del Producto */}
                      {productImages.length > 0 && (
                        <ImageCarousel
                          images={productImages}
                          productName={product.name}
                        />
                      )}

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

                          {business.hasShipping && (
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
                                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                  <span className="text-xs sm:text-sm text-foreground font-medium">
                                    Envío a domicilio
                                  </span>
                                  <span className="text-xs text-accent font-semibold">
                                    (+$
                                    {business.shippingCost?.toFixed(2) ||
                                      "0.00"}
                                    )
                                  </span>
                                </div>
                              </Label>
                            </div>
                          )}

                          {!business.hasShipping && (
                            <div className="p-2.5 sm:p-3 bg-muted/50 border border-border rounded-lg">
                              <p className="text-xs text-muted-foreground text-center">
                                Este negocio solo ofrece retiro en el local
                              </p>
                            </div>
                          )}
                        </RadioGroup>
                      </div>

                      {/* UI improved: Enhanced Map Selector */}
                      {deliveryType === "delivery" && (
                        <div className="pt-4 border-t border-border space-y-4">
                          <div>
                            <Label className="text-xs sm:text-sm font-semibold mb-2 block text-foreground">
                              Selecciona tu ubicación en el mapa
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

                          <div>
                            <Label
                              htmlFor="deliveryAddress"
                              className="text-xs sm:text-sm font-semibold mb-2 block text-foreground"
                            >
                              Dirección de entrega{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="deliveryAddress"
                              placeholder="Ej: Calle 123, Piso 4, Depto B"
                              value={deliveryAddress}
                              onChange={(e) =>
                                setDeliveryAddress(e.target.value)
                              }
                              className="bg-background border-border text-foreground"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Incluye calle, número, piso, departamento, etc.
                            </p>
                          </div>

                          <div>
                            <Label
                              htmlFor="deliveryNote"
                              className="text-xs sm:text-sm font-semibold mb-2 block text-foreground"
                            >
                              Indicaciones adicionales (opcional)
                            </Label>
                            <Textarea
                              id="deliveryNote"
                              placeholder="Ej: Timbre roto, puerta verde, portero eléctrico, referencias del lugar..."
                              value={deliveryNote}
                              onChange={(e) => setDeliveryNote(e.target.value)}
                              className="bg-background border-border text-foreground min-h-[80px] resize-none"
                              maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Ayúdanos a encontrar tu domicilio más fácilmente
                            </p>
                          </div>
                        </div>
                      )}

                      {/* UI improved: Enhanced Total and Checkout */}
                      <div className="pt-4 border-t border-border space-y-3 sm:space-y-4">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center text-sm sm:text-base">
                          <span className="text-muted-foreground">
                            Subtotal:
                          </span>
                          <span className="font-semibold text-foreground">
                            ${subtotal.toFixed(2)}
                          </span>
                        </div>

                        {/* Costo de Envío */}
                        {deliveryType === "delivery" &&
                          business.hasShipping && (
                            <div className="flex justify-between items-center text-sm sm:text-base">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-accent" />
                                Envío:
                              </span>
                              <span className="font-semibold text-accent">
                                +${shippingCost.toFixed(2)}
                              </span>
                            </div>
                          )}

                        {/* Total Final */}
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                          <span className="text-base sm:text-lg font-bold text-foreground">
                            Total:
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-primary">
                            ${total.toFixed(2)}
                          </span>
                        </div>

                        {isLoaded && isSignedIn && (
                          <>
                            <Button
                              onClick={handleCheckout}
                              disabled={
                                cart.length === 0 ||
                                isProcessingOrder ||
                                (deliveryType === "delivery" &&
                                  (!deliveryLocation ||
                                    !deliveryAddress.trim()))
                              }
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 sm:py-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                              size="lg"
                            >
                              {isProcessingOrder ? (
                                <>
                                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                                  Procesando...
                                </>
                              ) : (
                                "Realizar Pedido"
                              )}
                            </Button>

                            {deliveryType === "delivery" &&
                              (!deliveryLocation ||
                                !deliveryAddress.trim()) && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                  {deliveryLocation
                                    ? "⚠️ Completa la dirección de entrega"
                                    : "⚠️ Selecciona tu ubicación en el mapa"}
                                </p>
                              )}
                          </>
                        )}
                        {isLoaded && !isSignedIn && (
                          <div className="space-y-3">
                            {/* Botón principal para pedir por WhatsApp */}
                            <Button
                              onClick={handleCheckout}
                              disabled={
                                cart.length === 0 ||
                                !business.whatsappPhone ||
                                (deliveryType === "delivery" &&
                                  (!deliveryLocation ||
                                    !deliveryAddress.trim()))
                              }
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 sm:py-3 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                              size="lg"
                            >
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Pedir por WhatsApp
                            </Button>

                            {deliveryType === "delivery" &&
                              (!deliveryLocation ||
                                !deliveryAddress.trim()) && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                  {deliveryLocation
                                    ? "⚠️ Completa la dirección de entrega"
                                    : "⚠️ Selecciona tu ubicación en el mapa"}
                                </p>
                              )}

                            {!business.whatsappPhone && (
                              <p className="text-xs text-red-600 dark:text-red-400 text-center">
                                ⚠️ Este negocio no tiene WhatsApp configurado
                              </p>
                            )}

                            {/* Separador */}
                            <div className="relative py-2">
                              <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                              </div>
                              <div className="relative flex justify-center text-xs">
                                <span className="bg-card px-2 text-muted-foreground">
                                  o registrate para más beneficios
                                </span>
                              </div>
                            </div>

                            {/* Tarjeta de beneficios (colapsada) */}
                            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <LogIn className="w-4 h-4 text-primary flex-shrink-0" />
                                <h3 className="font-semibold text-xs text-foreground">
                                  Regístrate y obtén:
                                </h3>
                              </div>
                              <ul className="space-y-1 text-xs text-muted-foreground pl-6">
                                <li className="flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>Historial de pedidos</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>Seguimiento en tiempo real</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span>Ofertas exclusivas</span>
                                </li>
                              </ul>
                            </div>

                            <Button
                              onClick={() =>
                                (globalThis.location.href = "/sign-in")
                              }
                              variant="outline"
                              className="w-full border-primary/50 hover:bg-primary/10 font-semibold py-2.5 sm:py-3 transition-all"
                              size="lg"
                            >
                              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Iniciar Sesión / Registrarse
                            </Button>
                          </div>
                        )}
                        {!isLoaded && (
                          <Button
                            disabled
                            className="w-full bg-muted text-muted-foreground font-bold py-2.5 sm:py-3"
                            size="lg"
                          >
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                            Cargando...
                          </Button>
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

      {/* Success Dialog */}
      {orderData && (
        <OrderSuccessDialog
          isOpen={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          orderId={orderData.orderId}
          total={orderData.total}
          businessName={business.name}
          whatsappLink={orderData.whatsappLink}
          deliveryType={deliveryType}
        />
      )}

      {/* Error Dialog */}
      <OrderErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        error={errorMessage}
      />
    </div>
  );
}
