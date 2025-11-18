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
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Business, Product, PromotionWithProducts } from "@/app/types/types";
import OrderSuccessDialog from "@/components/OrderSuccessDialog";
import OrderErrorDialog from "@/components/OrderErrorDialog";
import BusinessHoursDialog from "@/components/BusinessHoursDialog";
import ShippingRangesDisplay from "@/components/ShippingRangesDisplay";
import ProductDetailDialog from "@/components/ProductDetailDialog";
import PromotionCard from "@/components/PromotionCard";
import {
  BusinessSchedule,
  SpecialClosedDay,
  isBusinessOpen,
} from "@/lib/business-hours";
import { ShippingRange, isWithinShippingRange } from "@/lib/shipping-utils";
import { optimizeBusinessDetailImage } from "@/lib/cloudinary-utils";
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

const SingleBusinessMap = dynamic(
  () => import("@/components/SingleBusinessMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    ),
  }
);

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  type: "product" | "promotion";
  promotionId?: string;
}

interface BusinessDetailClientProps {
  business: Business & {
    products: Product[];
    promotions?: PromotionWithProducts[];
  };
}

export default function BusinessDetailClient({
  business,
}: Readonly<BusinessDetailClientProps>) {
  const { isSignedIn, isLoaded } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Debug: verificar si llegan las promociones
  console.log("Business data:", {
    name: business.name,
    hasPromotions: !!business.promotions,
    promotionsCount: business.promotions?.length || 0,
    promotions: business.promotions,
  });

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
  const [calculatedShippingCost, setCalculatedShippingCost] = useState<
    number | null
  >(null);
  const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // ===== BUSINESS HOURS & ORDER VALIDATION =====
  const schedule = business.schedule as BusinessSchedule | null;
  const specialClosedDays =
    (business.specialClosedDays as SpecialClosedDay[]) || [];

  const { isOpen: businessIsOpen, reason } = schedule
    ? isBusinessOpen(schedule, business.status, specialClosedDays)
    : { isOpen: false, reason: "Horario no especificado" };

  // Determine if orders can be placed
  // acceptOrdersOutsideHours ONLY applies when status is ABIERTO
  // If status is CERRADO_TEMPORAL or CERRADO_PERMANENTE, orders are NEVER allowed
  const canOrderNow =
    business.status === "ABIERTO" &&
    (businessIsOpen || business.acceptOrdersOutsideHours);

  // Get status badge configuration (same as BusinessCard)
  const getStatusBadge = () => {
    if (business.status === "CERRADO_PERMANENTE") {
      return {
        label: "Cerrado permanentemente",
        color:
          "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-300 dark:from-gray-800 dark:to-gray-900 dark:text-gray-200 dark:border-gray-600 shadow-md",
        dot: "bg-gradient-to-br from-gray-500 to-gray-600",
      };
    }
    if (business.status === "CERRADO_TEMPORAL") {
      return {
        label: "Cerrado temporalmente",
        color:
          "bg-gradient-to-r from-orange-100 to-amber-50 text-orange-800 border-orange-300 dark:from-orange-900/40 dark:to-amber-900/30 dark:text-orange-300 dark:border-orange-600 shadow-md",
        dot: "bg-gradient-to-br from-orange-500 to-amber-500",
      };
    }
    if (businessIsOpen) {
      return {
        label: "Abierto",
        color:
          "bg-gradient-to-r from-green-100 to-emerald-50 text-green-800 border-green-400 dark:from-green-900/40 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-500 shadow-md",
        dot: "bg-gradient-to-br from-green-500 to-emerald-500 animate-pulse shadow-lg shadow-green-500/50",
      };
    }
    return {
      label: "Cerrado",
      color:
        "bg-gradient-to-r from-red-100 to-rose-50 text-red-800 border-red-300 dark:from-red-900/40 dark:to-rose-900/30 dark:text-red-300 dark:border-red-600 shadow-md",
      dot: "bg-gradient-to-br from-red-500 to-rose-500",
    };
  };

  const statusBadge = getStatusBadge();
  // ===== END BUSINESS HOURS & ORDER VALIDATION =====

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
          type: "product",
        },
      ];
    });
    setShowCart(true);
  };

  // Función para agregar promoción al carrito
  const addPromotionToCart = (promotion: PromotionWithProducts) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.promotionId === promotion.id);
      if (existing) {
        const maxStock = promotion.stock ?? Infinity;
        if (existing.quantity < maxStock) {
          return prev.map((item) =>
            item.promotionId === promotion.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return prev;
      }
      return [
        ...prev,
        {
          productId: promotion.id,
          promotionId: promotion.id,
          name: promotion.name,
          price: promotion.price,
          quantity: 1,
          stock: promotion.stock ?? 999,
          type: "promotion",
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
    setCart((prev) =>
      prev.filter((item) =>
        item.type === "promotion"
          ? item.promotionId !== productId
          : item.productId !== productId
      )
    );
  };

  // Calcular subtotal y total
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Usar el costo de envío calculado dinámicamente o el fijo del negocio
  const shippingCost =
    deliveryType === "delivery" && business.hasShipping
      ? calculatedShippingCost ?? business.shippingCost ?? 0
      : 0;

  const total = subtotal + shippingCost;

  // Obtener cantidad de un producto en el carrito
  const getCartQuantity = (productId: string) => {
    return (
      cart.find(
        (item) => item.productId === productId && item.type === "product"
      )?.quantity || 0
    );
  };

  // Obtener cantidad de una promoción en el carrito
  const getPromotionCartQuantity = (promotionId: string) => {
    return (
      cart.find(
        (item) => item.promotionId === promotionId && item.type === "promotion"
      )?.quantity || 0
    );
  };

  // Función para generar mensaje de WhatsApp para usuarios sin sesión
  const generateWhatsAppMessage = () => {
    let message = `Hola! Quiero realizar un pedido en *${business.name}*\n\n`;
    message += `📋 *Detalle del pedido:*\n`;

    for (const item of cart) {
      const itemLabel =
        item.type === "promotion" ? `🎁 PROMO: ${item.name}` : item.name;
      message += `• ${item.quantity}x ${itemLabel} - $${(
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

      // Verificar que esté dentro del rango de envío
      if (deliveryDistance !== null && business.maxShippingDistance) {
        if (
          !isWithinShippingRange(deliveryDistance, business.maxShippingDistance)
        ) {
          setErrorMessage(
            `Esta ubicación está fuera del área de envío. Distancia máxima: ${business.maxShippingDistance.toFixed(
              1
            )} km`
          );
          setShowErrorDialog(true);
          return;
        }
      }

      // Verificar que se haya calculado el costo de envío
      if (calculatedShippingCost === null && business.shippingRanges) {
        setErrorMessage(
          "No se pudo calcular el costo de envío para esta ubicación"
        );
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
        items: cart
          .filter((item) => item.type === "product")
          .map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
          })),
        promotions: cart
          .filter((item) => item.type === "promotion")
          .map((item) => ({
            promotionId: item.promotionId!,
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
      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90 text-white rounded-full p-4 shadow-2xl hover:shadow-primary/60 transition-all hover:scale-110 active:scale-95 group"
          aria-label="Ver carrito"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold animate-bounce shadow-lg ring-4 ring-red-500/30">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
          {/* Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Ver carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)}{" "}
            productos)
          </span>
        </button>
      )}

      {/* UI improved: Enhanced Business Header with Map */}
      <div className="relative bg-gradient-to-br from-card via-primary/5 to-secondary/5 backdrop-blur-xl border-b border-border/50 shadow-2xl overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Business Information Section */}
            <div className="space-y-6">
              {/* Business Logo and Name */}
              <div className="flex items-start gap-4 sm:gap-6">
                {business.img ? (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-muted ring-4 ring-primary/30 hover:ring-primary/50 transition-all">
                    <img
                      src={optimizeBusinessDetailImage(business.img)}
                      alt={`Logo de ${business.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary via-secondary to-primary/90 rounded-2xl flex items-center justify-center shadow-2xl ring-4 ring-primary/30">
                    <StoreIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
                    {business.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge className="bg-gradient-to-r from-primary/20 to-primary/15 text-primary border-primary/40 text-sm px-3 py-1 shadow-md hover:shadow-lg transition-all">
                      <StoreIcon className="w-3.5 h-3.5 mr-1.5" />
                      {business.rubro}
                    </Badge>
                    {business.hasShipping && (
                      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/15 text-green-600 dark:text-green-400 border-green-500/40 text-sm px-3 py-1 shadow-md hover:shadow-lg transition-all">
                        <Truck className="w-3.5 h-3.5 mr-1.5" />
                        Envío disponible
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {business.description && (
                <div className="bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-sm rounded-xl p-4 border border-border/60">
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                    {business.description}
                  </p>
                </div>
              )}

              {/* Status and Business Hours Section */}
              <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-xl p-4 border border-border/60 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${statusBadge.color}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${statusBadge.dot}`}
                      />
                      {statusBadge.label}
                    </span>
                    <BusinessHoursDialog business={business} />
                  </div>

                  {business.preparationTime && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Preparación: {business.preparationTime} min
                    </div>
                  )}
                </div>

                {/* Order availability message - when orders are NOT available */}
                {!canOrderNow && (
                  <div className="mt-3 flex items-start gap-2 text-sm bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg p-3 border-2 border-amber-400/60 dark:border-amber-600/60 shadow-md">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-700 dark:text-amber-400" />
                    <div>
                      <p className="font-bold text-amber-800 dark:text-amber-300">
                        Pedidos no disponibles
                      </p>
                      <p className="text-xs mt-1 text-amber-700 dark:text-amber-400">
                        {business.status === "CERRADO_PERMANENTE"
                          ? business.closedReason
                            ? `Cerrado permanentemente: ${business.closedReason}`
                            : "Este negocio está cerrado permanentemente"
                          : business.status === "CERRADO_TEMPORAL"
                          ? business.closedReason
                            ? `Cerrado temporalmente: ${business.closedReason}`
                            : "Cerrado temporalmente"
                          : reason || "El negocio está cerrado en este momento"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Order availability message - when accepting orders outside hours */}
                {canOrderNow &&
                  business.acceptOrdersOutsideHours &&
                  !businessIsOpen && (
                    <div className="mt-3 flex items-start gap-2 text-sm bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg p-3 border-2 border-blue-400/60 dark:border-blue-600/60 shadow-md">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-700 dark:text-blue-400" />
                      <p className="font-medium text-blue-800 dark:text-blue-300">
                        Este negocio acepta pedidos fuera del horario de
                        atención
                      </p>
                    </div>
                  )}
              </div>

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {business.addressText && (
                  <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-xl p-4 border border-border/60 hover:border-blue-500/50 hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-blue-500/15 to-blue-600/10 rounded-lg p-2 group-hover:from-blue-500/25 group-hover:to-blue-600/20 transition-all shadow-md">
                        <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">
                          Dirección
                        </p>
                        <p className="text-sm text-foreground font-medium leading-relaxed">
                          {business.addressText}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {business.whatsappPhone && (
                  <a
                    href={`https://wa.me/${business.whatsappPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-xl p-4 border border-border/60 hover:border-green-500/60 hover:shadow-lg hover:shadow-green-500/10 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/10 rounded-lg p-2 group-hover:from-green-500/25 group-hover:to-emerald-500/20 transition-all shadow-md">
                        <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">
                          WhatsApp
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {business.whatsappPhone}
                        </p>
                      </div>
                    </div>
                  </a>
                )}

                {business.aliasPago && (
                  <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-xl p-4 border border-border/60 hover:border-amber-500/60 hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-amber-500/15 to-yellow-500/10 rounded-lg p-2 group-hover:from-amber-500/25 group-hover:to-yellow-500/20 transition-all shadow-md">
                        <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">
                          Alias de Pago
                        </p>
                        <p className="text-sm text-foreground font-medium">
                          {business.aliasPago}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {business.hasShipping && (
                  <div className="bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-sm rounded-xl p-4 border border-border/60 hover:border-cyan-500/60 hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-3">
                      <div className="bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-lg p-2 group-hover:from-cyan-500/25 group-hover:to-blue-500/20 transition-all shadow-md">
                        <Truck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Envíos a Domicilio
                        </p>
                        {business.maxShippingDistance && (
                          <p className="text-sm text-foreground font-medium mb-2">
                            Hasta {business.maxShippingDistance.toFixed(1)} km
                          </p>
                        )}
                        {/* Botón para ver tarifas */}
                        {business.shippingRanges &&
                          Array.isArray(business.shippingRanges) &&
                          business.shippingRanges.length > 0 && (
                            <ShippingRangesDisplay
                              ranges={
                                business.shippingRanges as ShippingRange[]
                              }
                              maxDistance={business.maxShippingDistance}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <Button
                onClick={() => setShowCart(!showCart)}
                disabled={!canOrderNow}
                className={`w-full relative ${
                  canOrderNow
                    ? "bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:via-primary/90 hover:to-secondary/90 hover:scale-[1.02] shadow-xl hover:shadow-2xl hover:shadow-primary/30 dark:shadow-primary/20 dark:hover:shadow-primary/40"
                    : "bg-gradient-to-r from-muted to-muted/80 dark:from-muted/70 dark:to-muted/50 cursor-not-allowed opacity-50"
                } text-white dark:text-white transition-all py-6 text-lg font-bold disabled:text-muted-foreground border-2`}
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                {canOrderNow
                  ? `Ver Carrito ${
                      cart.length > 0 ? `(${cart.length} productos)` : ""
                    }`
                  : "Pedidos no disponibles"}
                {canOrderNow && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold animate-bounce shadow-lg ring-4 ring-red-500/30 dark:ring-red-600/40">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </div>

            {/* Map Section */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-background/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Ubicación del Local
                  </h3>
                </div>

                {business.lat && business.lng ? (
                  <div className="rounded-xl overflow-hidden shadow-lg border border-border/50 h-[300px] sm:h-[350px] lg:h-[400px]">
                    <SingleBusinessMap
                      lat={business.lat}
                      lng={business.lng}
                      businessName={business.name}
                      addressText={business.addressText}
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-muted/50 border border-border/50 h-[300px] sm:h-[350px] lg:h-[400px] flex flex-col items-center justify-center text-center p-6">
                    <MapPin className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Este negocio no tiene ubicación configurada
                    </p>
                  </div>
                )}

                {business.addressText && (
                  <div className="mt-4 bg-muted/30 rounded-lg p-3 border border-border/30">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">
                      DIRECCIÓN COMPLETA
                    </p>
                    <p className="text-sm text-foreground font-medium">
                      {business.addressText}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* UI improved: Enhanced Products List */}
          <div className="lg:col-span-2">
            {/* Sección de Promociones */}
            {business.promotions && business.promotions.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 rounded-lg p-2 shadow-lg shadow-fuchsia-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
                      Promociones Especiales
                    </h2>
                  </div>
                  <Badge className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-0 shadow-lg shadow-fuchsia-500/30">
                    {business.promotions.length}{" "}
                    {business.promotions.length === 1 ? "oferta" : "ofertas"}
                  </Badge>
                </div>
                <div className="space-y-4">
                  {business.promotions.map((promotion) => {
                    const cartQty = getPromotionCartQuantity(promotion.id);
                    return (
                      <PromotionCard
                        key={promotion.id}
                        promotion={promotion as PromotionWithProducts}
                        canOrder={canOrderNow}
                        cartQuantity={cartQty}
                        onAddToCart={() =>
                          addPromotionToCart(promotion as PromotionWithProducts)
                        }
                        onUpdateQuantity={(delta) =>
                          updateQuantity(promotion.id, delta)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-2">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                Productos Disponibles
              </h2>
            </div>

            {business.products.length === 0 ? (
              <Card className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm border-border/60 shadow-lg">
                <CardContent className="py-12 text-center">
                  <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 inline-block mb-4">
                    <Package className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground/60 mx-auto" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground/70 font-medium">
                    No hay productos disponibles en este momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Filtro de categorías */}
                {(() => {
                  // Primero agrupar productos por categoría para obtener las categorías
                  const productsByCategory: Record<
                    string,
                    {
                      name: string;
                      icon: string | null;
                      products: typeof business.products;
                    }
                  > = {};

                  business.products.forEach((product) => {
                    const categoryKey = product.category?.id || "sin-categoria";
                    const categoryName =
                      product.category?.name || "Sin categoría";
                    const categoryIcon = product.category?.icon || null;

                    if (!productsByCategory[categoryKey]) {
                      productsByCategory[categoryKey] = {
                        name: categoryName,
                        icon: categoryIcon,
                        products: [],
                      };
                    }
                    productsByCategory[categoryKey].products.push(product);
                  });

                  const categories = Object.entries(productsByCategory);
                  const totalProducts = business.products.length;

                  return (
                    <>
                      {/* Filtros de categoría */}
                      <div className="flex gap-2 pb-4 border-b border-border/60 overflow-x-auto scrollbar-hide">
                        <Badge
                          variant={
                            selectedCategory === "all" ? "default" : "outline"
                          }
                          onClick={() => setSelectedCategory("all")}
                          className={`cursor-pointer hover:scale-105 transition-all text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap flex-shrink-0 ${
                            selectedCategory === "all"
                              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                              : "hover:border-primary/50 hover:bg-primary/5"
                          }`}
                        >
                          Todos ({totalProducts})
                        </Badge>
                        {categories.map(([key, data]) => (
                          <Badge
                            key={key}
                            variant={
                              selectedCategory === key ? "default" : "outline"
                            }
                            onClick={() => setSelectedCategory(key)}
                            className={`cursor-pointer hover:scale-105 transition-all text-xs sm:text-sm px-3 py-1.5 whitespace-nowrap flex-shrink-0 ${
                              selectedCategory === key
                                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30"
                                : "hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            {data.icon && (
                              <span className="mr-1">{data.icon}</span>
                            )}
                            {data.name} ({data.products.length})
                          </Badge>
                        ))}
                      </div>

                      {/* Lista de productos filtrados */}
                      <div className="space-y-8">
                        {categories
                          .filter(
                            ([key]) =>
                              selectedCategory === "all" ||
                              key === selectedCategory
                          )
                          .map(([categoryKey, categoryData]) => (
                            <div key={categoryKey} className="space-y-4">
                              {/* Título de categoría */}
                              <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 border-b-2 border-primary/30 pb-2 px-1">
                                {categoryData.icon && (
                                  <span className="text-xl sm:text-2xl">
                                    {categoryData.icon}
                                  </span>
                                )}
                                <span className="flex-1">
                                  {categoryData.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-primary/10 text-primary border-primary/30"
                                >
                                  {categoryData.products.length}
                                </Badge>
                              </h3>

                              {/* Productos de la categoría */}
                              <div className="space-y-3">
                                {categoryData.products.map((product) => {
                                  const cartQty = getCartQuantity(product.id);

                                  return (
                                    <Card
                                      key={product.id}
                                      className="bg-gradient-to-br from-card/60 to-card/40 backdrop-blur-sm hover:shadow-xl hover:border-primary/60 hover:scale-[1.01] transition-all duration-300 border-border/60 group overflow-hidden"
                                    >
                                      <CardContent className="p-3 sm:p-4">
                                        {/* Layout móvil mejorado */}
                                        <div className="flex gap-3">
                                          {/* Imagen pequeña del producto */}
                                          {product.images &&
                                            Array.isArray(product.images) &&
                                            product.images.length > 0 && (
                                              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted border border-border/50 shadow-md">
                                                <img
                                                  src={product.images[0]}
                                                  alt={product.name}
                                                  className="w-full h-full object-cover"
                                                />
                                              </div>
                                            )}

                                          {/* Contenido del producto */}
                                          <div className="flex-1 min-w-0 space-y-2">
                                            {/* Nombre y Stock */}
                                            <div className="space-y-1">
                                              <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                                  {product.name}
                                                </h4>
                                                <Badge
                                                  variant={
                                                    product.stock > 0
                                                      ? "default"
                                                      : "secondary"
                                                  }
                                                  className={
                                                    product.stock > 0
                                                      ? "bg-gradient-to-r from-green-500/15 to-emerald-500/10 text-green-700 dark:text-green-300 border-green-500/30 text-[10px] sm:text-xs font-bold shadow-md whitespace-nowrap"
                                                      : "bg-gradient-to-r from-muted to-muted/80 text-muted-foreground border-border text-[10px] sm:text-xs whitespace-nowrap"
                                                  }
                                                >
                                                  {product.stock}
                                                </Badge>
                                              </div>
                                              <ProductDetailDialog
                                                product={product}
                                              />
                                            </div>

                                            {/* Precio y Controles */}
                                            <div className="flex items-end justify-between gap-2 pt-1">
                                              <div className="flex items-baseline gap-1">
                                                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                  ${product.price.toFixed(2)}
                                                </span>
                                              </div>

                                              {/* Controles de cantidad */}
                                              <div className="flex-shrink-0">
                                                {cartQty > 0 ? (
                                                  <div className="flex items-center gap-1">
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                        updateQuantity(
                                                          product.id,
                                                          -1
                                                        )
                                                      }
                                                      disabled={!canOrderNow}
                                                      className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-red-500/15 hover:to-red-600/10 hover:border-red-500/60 hover:text-red-600 dark:hover:text-red-400 transition-all disabled:opacity-50 border-border/60"
                                                    >
                                                      <Minus className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <span className="text-base sm:text-lg font-bold min-w-[2rem] text-center text-foreground">
                                                      {cartQty}
                                                    </span>
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() =>
                                                        updateQuantity(
                                                          product.id,
                                                          1
                                                        )
                                                      }
                                                      disabled={
                                                        cartQty >=
                                                          product.stock ||
                                                        !canOrderNow
                                                      }
                                                      className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-green-500/15 hover:to-emerald-500/10 hover:border-green-500/60 hover:text-green-600 dark:hover:text-green-400 transition-all disabled:opacity-50 border-border/60"
                                                    >
                                                      <Plus className="w-3.5 h-3.5" />
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <Button
                                                    onClick={() =>
                                                      addToCart(product)
                                                    }
                                                    disabled={
                                                      product.stock === 0 ||
                                                      !canOrderNow
                                                    }
                                                    size="sm"
                                                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 font-semibold px-3 h-8 text-xs sm:text-sm"
                                                  >
                                                    <Plus className="w-3.5 h-3.5 mr-1" />
                                                    Agregar
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* UI improved: Enhanced Cart Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card
                className={`bg-gradient-to-br from-card/70 to-card/50 backdrop-blur-xl transition-all duration-300 ${
                  showCart
                    ? "border-2 border-primary shadow-2xl ring-4 ring-primary/20"
                    : "border-border/60 shadow-xl"
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
                      <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 inline-block mb-3">
                        <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/60 mx-auto" />
                      </div>
                      <p className="text-sm sm:text-base text-foreground/70 font-medium">
                        Tu carrito está vacío
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* UI improved: Enhanced Cart Items */}
                      <div className="space-y-2 sm:space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {cart.map((item) => (
                          <div
                            key={
                              item.type === "promotion"
                                ? item.promotionId
                                : item.productId
                            }
                            className="flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-gradient-to-br from-accent/40 to-accent/20 rounded-lg border border-border/60 hover:from-accent/50 hover:to-accent/30 hover:shadow-md hover:border-primary/30 transition-all"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {item.type === "promotion" && (
                                  <Badge className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white border-0 text-[10px] px-1.5 py-0 shadow-md">
                                    PROMO
                                  </Badge>
                                )}
                                <p className="font-medium text-xs sm:text-sm text-foreground truncate">
                                  {item.name}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                ${item.price.toFixed(2)} x {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm sm:text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  removeFromCart(
                                    item.type === "promotion"
                                      ? item.promotionId!
                                      : item.productId
                                  )
                                }
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 transition-all hover:scale-110 shadow-md"
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
                                ? "border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-md ring-2 ring-primary/20"
                                : "border-border/60 hover:bg-gradient-to-br hover:from-accent/30 hover:to-accent/10"
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
                                  ? "border-cyan-500 bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 shadow-md ring-2 ring-cyan-500/20"
                                  : "border-border/60 hover:bg-gradient-to-br hover:from-accent/30 hover:to-accent/10"
                              }`}
                            >
                              <RadioGroupItem value="delivery" id="delivery" />
                              <Label
                                htmlFor="delivery"
                                className="flex items-center gap-2 cursor-pointer flex-1"
                              >
                                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                  <span className="text-xs sm:text-sm text-foreground font-medium">
                                    Envío a domicilio
                                  </span>
                                  {business.shippingRanges &&
                                  Array.isArray(business.shippingRanges) &&
                                  business.shippingRanges.length > 0 ? (
                                    <span className="text-xs text-accent font-semibold">
                                      (costo según distancia)
                                    </span>
                                  ) : (
                                    <span className="text-xs text-accent font-semibold">
                                      (+$
                                      {business.shippingCost?.toFixed(2) ||
                                        "0.00"}
                                      )
                                    </span>
                                  )}
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
                              shippingRanges={
                                business.shippingRanges as
                                  | ShippingRange[]
                                  | null
                              }
                              maxShippingDistance={business.maxShippingDistance}
                              onShippingCostCalculated={(cost, distance) => {
                                setCalculatedShippingCost(cost);
                                setDeliveryDistance(distance);
                              }}
                            />
                            {deliveryLocation && deliveryDistance !== null && (
                              <div className="mt-2 p-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-2 border-green-400/60 dark:border-green-600/60 rounded-lg shadow-md">
                                <p className="text-xs text-green-800 dark:text-green-300 font-bold">
                                  ✓ Ubicación seleccionada
                                </p>
                                <div className="flex items-center justify-between mt-1 text-xs">
                                  <span className="text-green-700 dark:text-green-400">
                                    Distancia: {deliveryDistance.toFixed(1)} km
                                  </span>
                                  {calculatedShippingCost !== null && (
                                    <span className="font-bold text-green-800 dark:text-green-300">
                                      Envío: $
                                      {calculatedShippingCost.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {deliveryLocation && deliveryDistance === null && (
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
                              {deliveryLocation &&
                              calculatedShippingCost !== null ? (
                                <span className="font-semibold text-accent">
                                  +${shippingCost.toFixed(2)}
                                </span>
                              ) : business.shippingRanges &&
                                Array.isArray(business.shippingRanges) &&
                                business.shippingRanges.length > 0 ? (
                                <span className="text-xs text-muted-foreground italic">
                                  Selecciona ubicación
                                </span>
                              ) : (
                                <span className="font-semibold text-accent">
                                  +${shippingCost.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}

                        {/* Total Final */}
                        <div className="flex justify-between items-center pt-2 border-t-2 border-primary/30">
                          <span className="text-base sm:text-lg font-bold text-foreground">
                            Total:
                          </span>
                          <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
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
                                !canOrderNow ||
                                (deliveryType === "delivery" &&
                                  (!deliveryLocation ||
                                    !deliveryAddress.trim()))
                              }
                              className="w-full bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:via-secondary/90 hover:to-primary/90 text-white font-bold py-2.5 sm:py-3 shadow-xl hover:shadow-2xl hover:shadow-primary/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
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

                            {!canOrderNow && (
                              <p className="text-xs text-amber-800 dark:text-amber-300 text-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-2 rounded-lg border border-amber-400/50 dark:border-amber-600/50 font-medium">
                                ⚠️ El negocio no acepta pedidos en este momento
                              </p>
                            )}

                            {canOrderNow &&
                              deliveryType === "delivery" &&
                              (!deliveryLocation ||
                                !deliveryAddress.trim()) && (
                                <p className="text-xs text-amber-800 dark:text-amber-300 text-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-2 rounded-lg border border-amber-400/50 dark:border-amber-600/50 font-medium">
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
                                !canOrderNow ||
                                !business.whatsappPhone ||
                                (deliveryType === "delivery" &&
                                  (!deliveryLocation ||
                                    !deliveryAddress.trim()))
                              }
                              className="w-full bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 hover:from-green-700 hover:via-green-700 hover:to-emerald-700 text-white font-bold py-2.5 sm:py-3 shadow-xl hover:shadow-2xl hover:shadow-green-600/40 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                              size="lg"
                            >
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Pedir por WhatsApp
                            </Button>

                            {!canOrderNow && (
                              <p className="text-xs text-amber-800 dark:text-amber-300 text-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-2 rounded-lg border border-amber-400/50 dark:border-amber-600/50 font-medium">
                                ⚠️ El negocio no acepta pedidos en este momento
                              </p>
                            )}

                            {canOrderNow &&
                              deliveryType === "delivery" &&
                              (!deliveryLocation ||
                                !deliveryAddress.trim()) && (
                                <p className="text-xs text-amber-800 dark:text-amber-300 text-center bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 p-2 rounded-lg border border-amber-400/50 dark:border-amber-600/50 font-medium">
                                  {deliveryLocation
                                    ? "⚠️ Completa la dirección de entrega"
                                    : "⚠️ Selecciona tu ubicación en el mapa"}
                                </p>
                              )}

                            {!business.whatsappPhone && (
                              <p className="text-xs text-red-800 dark:text-red-300 text-center bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 p-2 rounded-lg border border-red-400/50 dark:border-red-600/50 font-medium">
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
                            <div className="p-3 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 border-2 border-primary/30 rounded-lg space-y-2 shadow-lg">
                              <div className="flex items-center gap-2">
                                <LogIn className="w-4 h-4 text-primary flex-shrink-0" />
                                <h3 className="font-bold text-xs bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                  Regístrate y obtén:
                                </h3>
                              </div>
                              <ul className="space-y-1 text-xs text-foreground/80 pl-6">
                                <li className="flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="font-medium">
                                    Historial de pedidos
                                  </span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="font-medium">
                                    Seguimiento en tiempo real
                                  </span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                  <span className="font-medium">
                                    Ofertas exclusivas
                                  </span>
                                </li>
                              </ul>
                            </div>

                            <Button
                              onClick={() =>
                                (globalThis.location.href = "/sign-in")
                              }
                              variant="outline"
                              className="w-full border-2 border-primary/60 hover:bg-gradient-to-r hover:from-primary/15 hover:to-secondary/15 hover:border-primary font-semibold py-2.5 sm:py-3 transition-all shadow-md hover:shadow-lg"
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
