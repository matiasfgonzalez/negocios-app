"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  User,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OrderStateSelector from "@/components/OrderStateSelector";
import OrderDetailsDialog from "@/components/OrderDetailsDialog";
import DeleteOrderDialog from "@/components/DeleteOrderDialog";
import CancelOrderDialog from "@/components/CancelOrderDialog";
import ContactBusinessButton from "@/components/ContactBusinessButton";
import PaymentAliasDisplay from "@/components/PaymentAliasDisplay";
import OrderTimeline from "@/components/OrderTimeline";

// Importar UserLocationMap dinámicamente
const UserLocationMap = dynamic(() => import("@/components/UserLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-muted rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Cargando mapa...</p>
    </div>
  ),
});

type OrderWithRelations = {
  id: string;
  businessId: string;
  customerId: string;
  total: number;
  shipping: boolean;
  lat: number | null;
  lng: number | null;
  addressText: string | null;
  state: string;
  paymentProof: string | null;
  note: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  business: {
    id: string;
    name: string;
    slug: string;
    aliasPago: string | null;
    whatsappPhone: string | null;
  };
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      businessId: string;
      categoryId: string | null;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      sku: string | null;
      available: boolean;
      images: unknown;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  promotions?: Array<{
    id: string;
    orderId: string;
    promotionId: string;
    quantity: number;
    unitPrice: number;
    promotion: {
      id: string;
      businessId: string;
      name: string;
      description: string | null;
      price: number;
      image: string | null;
      isActive: boolean;
      stock: number | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  events: Array<{
    id: string;
    orderId: string;
    actorId: string | null;
    type: string;
    note: string | null;
    createdAt: Date;
  }>;
  _count?: {
    items: number;
  };
};

interface OrderCardProps {
  order: OrderWithRelations;
  userRole: string;
  currentUserId: string;
}

export default function OrderCard({
  order,
  userRole,
  currentUserId,
}: Readonly<OrderCardProps>) {
  const getStateColor = (state: string) => {
    switch (state) {
      case "REGISTRADA":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "PENDIENTE_PAGO":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "PAGADA":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "PREPARANDO":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "ENVIADA":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
      case "ENTREGADA":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "CANCELADA":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case "ENTREGADA":
        return <CheckCircle className="w-3.5 h-3.5 mr-1.5" />;
      case "ENVIADA":
        return <Truck className="w-3.5 h-3.5 mr-1.5" />;
      default:
        return <Clock className="w-3.5 h-3.5 mr-1.5" />;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl text-foreground truncate">
                {order.business.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Pedido #{order.id.substring(0, 8).toUpperCase()}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {userRole !== "CLIENTE" ? (
              <OrderStateSelector
                orderId={order.id}
                currentState={
                  order.state as
                    | "REGISTRADA"
                    | "PENDIENTE_PAGO"
                    | "PAGADA"
                    | "PREPARANDO"
                    | "ENVIADA"
                    | "ENTREGADA"
                    | "CANCELADA"
                }
              />
            ) : (
              <Badge className={getStateColor(order.state)}>
                {getStateIcon(order.state)}
                {order.state.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Products section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-orange-500/10">
                <Package className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              </div>
              Productos ({order.items.length + (order.promotions?.length || 0)})
            </div>
            <ul className="space-y-1.5">
              {order.items.slice(0, 3).map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-foreground pl-2 border-l-2 border-border"
                >
                  {item.quantity}x {item.product.name}
                </li>
              ))}
              {order.promotions
                ?.slice(0, Math.max(0, 3 - order.items.length))
                .map((promo) => (
                  <li
                    key={promo.id}
                    className="text-sm text-foreground pl-2 border-l-2 border-fuchsia-500/50 flex items-center gap-1"
                  >
                    {promo.quantity}x
                    <Badge className="bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-0 text-[10px] px-1.5 py-0">
                      PROMO
                    </Badge>
                    {promo.promotion.name}
                  </li>
                ))}
              {order.items.length + (order.promotions?.length || 0) > 3 && (
                <li className="text-xs text-muted-foreground pl-2">
                  +{order.items.length + (order.promotions?.length || 0) - 3}{" "}
                  más...
                </li>
              )}
            </ul>
          </div>

          {/* Details section */}
          <div className="space-y-3">
            {userRole !== "CLIENTE" && (
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm text-foreground font-medium">
                    {order.customer.name || order.customer.email}
                  </p>
                  {order.customer.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customer.phone}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="text-sm text-foreground font-medium">
                {new Date(order.createdAt).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="text-sm text-foreground font-medium flex items-center gap-1">
                {order.shipping ? (
                  <>
                    <Truck className="w-3.5 h-3.5 text-accent" />
                    Envío a domicilio
                  </>
                ) : (
                  <>
                    <Package className="w-3.5 h-3.5" />
                    Retiro en local
                  </>
                )}
              </p>
              {order.shipping && order.addressText && (
                <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{order.addressText}</span>
                </p>
              )}
            </div>
          </div>

          {/* Total section */}
          <div className="flex flex-col justify-center items-end p-4 bg-accent/50 rounded-xl">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">
              Total
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-primary">
              ${order.total.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Payment Alias - mostrar si existe */}
        {order.business.aliasPago && (
          <div className="mt-4">
            <PaymentAliasDisplay
              aliasPago={order.business.aliasPago}
              businessName={order.business.name}
            />
          </div>
        )}

        {/* Mapa de ubicación de entrega - mostrar si tiene envío y coordenadas */}
        {order.shipping && order.lat && order.lng && (
          <div className="mt-4 p-4 bg-accent/30 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-blue-500/10">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                Ubicación de Entrega
              </h4>
            </div>
            <div className="rounded-lg overflow-hidden border border-border shadow-sm">
              <UserLocationMap
                lat={order.lat}
                lng={order.lng}
                name="Punto de entrega"
                address={order.addressText || undefined}
                height="h-48"
              />
            </div>
            {order.addressText && (
              <div className="mt-2 p-2 bg-background rounded-lg">
                <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{order.addressText}</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Línea de tiempo de eventos */}
        <OrderTimeline events={order.events} />

        {/* UI improved: Enhanced actions */}
        <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
          <OrderDetailsDialog
            order={
              order as unknown as Parameters<
                typeof OrderDetailsDialog
              >[0]["order"]
            }
            userRole={userRole}
          />

          {/* Botón para contactar al negocio por WhatsApp */}
          <ContactBusinessButton
            order={
              order as unknown as Parameters<
                typeof ContactBusinessButton
              >[0]["order"]
            }
          />

          {/* Botón para que el propietario contacte al cliente */}
          {userRole !== "CLIENTE" &&
            order.business.whatsappPhone &&
            order.customer.phone && (
              <Link
                href={`https://wa.me/${order.customer.phone.replace(
                  /[^0-9]/g,
                  ""
                )}`}
                target="_blank"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50 transition-colors duration-200"
                >
                  <Phone className="w-3.5 h-3.5 mr-1.5" />
                  Contactar cliente
                </Button>
              </Link>
            )}
          {/* Botón de cancelar - para clientes en estados REGISTRADA o PENDIENTE_PAGO */}
          {(order.state === "REGISTRADA" || order.state === "PENDIENTE_PAGO") &&
            userRole === "CLIENTE" &&
            order.customerId === currentUserId && (
              <CancelOrderDialog
                orderId={order.id}
                orderNumber={order.id.substring(0, 8).toUpperCase()}
                businessName={order.business.name}
                isOwner={false}
              />
            )}

          {/* Botón de eliminar - solo para ADMINISTRADOR */}
          {(order.state === "REGISTRADA" || order.state === "PENDIENTE_PAGO") &&
            userRole === "ADMINISTRADOR" && (
              <DeleteOrderDialog
                orderId={order.id}
                orderNumber={order.id.substring(0, 8).toUpperCase()}
                businessName={order.business.name}
              />
            )}
        </div>
      </CardContent>
    </Card>
  );
}
