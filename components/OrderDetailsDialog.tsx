"use client";

import { useState } from "react";
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
import {
  Eye,
  Package,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  Store,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PaymentAliasDisplay from "@/components/PaymentAliasDisplay";
import { Order } from "@/app/types/types";

type OrderDetailsData = Omit<Order, "business" | "customer" | "items"> & {
  business: {
    name: string;
    rubro: string;
    addressText: string | null;
    whatsappPhone: string | null;
    aliasPago: string | null;
  };
  customer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      name: string;
    };
  }>;
};

interface OrderDetailsDialogProps {
  order: OrderDetailsData;
  userRole: string;
}

export default function OrderDetailsDialog({
  order,
  userRole,
}: Readonly<OrderDetailsDialogProps>) {
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-accent transition-colors duration-200"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Ver detalles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Detalles del Pedido
            </DialogTitle>
            <Badge className={getStateColor(order.state)}>
              {order.state.replaceAll("_", " ")}
            </Badge>
          </div>
          <DialogDescription>
            ID: #{order.id.substring(0, 8).toUpperCase()} • Fecha:{" "}
            {new Date(order.createdAt).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del Negocio */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Store className="w-4 h-4 text-primary" />
              Información del Negocio
            </div>
            <div className="bg-accent/20 border border-border rounded-lg p-4 space-y-2">
              <p className="font-semibold text-lg text-foreground">
                {order.business.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.business.rubro}
              </p>
              {order.business.addressText && (
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {order.business.addressText}
                </p>
              )}
              {order.business.whatsappPhone && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {order.business.whatsappPhone}
                </p>
              )}
            </div>
          </div>

          {/* Información del Cliente (solo para propietarios y admins) */}
          {userRole !== "CLIENTE" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <User className="w-4 h-4 text-primary" />
                Información del Cliente
              </div>
              <div className="bg-accent/20 border border-border rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground">
                  {order.customer.name || "Sin nombre"}
                </p>
                {order.customer.email && (
                  <p className="text-sm text-muted-foreground">
                    {order.customer.email}
                  </p>
                )}
                {order.customer.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {order.customer.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Productos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Package className="w-4 h-4 text-primary" />
              Productos ({order.items.length})
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-accent/20 border border-border rounded-lg p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${item.unitPrice.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-primary">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tipo de Entrega */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {order.shipping ? (
                <>
                  <Truck className="w-4 h-4 text-accent" />
                  Envío a Domicilio
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 text-primary" />
                  Retiro en Local
                </>
              )}
            </div>
            {order.shipping && (
              <div className="bg-accent/20 border border-border rounded-lg p-4 space-y-2">
                {order.addressText && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Dirección de Entrega
                    </p>
                    <p className="text-sm text-foreground flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
                      {order.addressText}
                    </p>
                  </div>
                )}
                {order.note && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Indicaciones Adicionales
                    </p>
                    <p className="text-sm text-foreground flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
                      {order.note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Resumen de Pago */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <DollarSign className="w-4 h-4 text-primary" />
              Resumen de Pago
            </div>
            <div className="bg-accent/20 border border-border rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium text-foreground">
                  $
                  {order.items
                    .reduce(
                      (sum, item) => sum + item.unitPrice * item.quantity,
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
              {order.shipping && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío:</span>
                  <span className="font-medium text-accent">
                    $
                    {(
                      order.total -
                      order.items.reduce(
                        (sum, item) => sum + item.unitPrice * item.quantity,
                        0
                      )
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between pt-2">
                <span className="font-bold text-foreground">Total:</span>
                <span className="text-xl font-bold text-primary">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Alias de pago si existe */}
            {order.business.aliasPago && (
              <div className="mt-3">
                <PaymentAliasDisplay
                  aliasPago={order.business.aliasPago}
                  businessName={order.business.name}
                />
              </div>
            )}
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              Creado:{" "}
              {new Date(order.createdAt).toLocaleString("es-AR", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </div>
            {order.updatedAt !== order.createdAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Actualizado:{" "}
                {new Date(order.updatedAt).toLocaleString("es-AR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
