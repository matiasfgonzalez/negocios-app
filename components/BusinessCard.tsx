// src/components/BusinessCard.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Business } from "@/app/types/types";
import {
  MapPin,
  Star,
  Users,
  Package,
  MessageCircle,
  CreditCard,
  Eye,
} from "lucide-react";
import Link from "next/link";
import BusinessHoursDialog from "@/components/BusinessHoursDialog";
import { BusinessSchedule, isBusinessOpen } from "@/lib/business-hours";

export default function BusinessCard({
  business,
}: Readonly<{ business: Business }>) {
  // Función para formatear la fecha de creación
  const getTimeSinceCreation = (createdAt: Date) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMonths =
      (now.getFullYear() - created.getFullYear()) * 12 +
      (now.getMonth() - created.getMonth());

    if (diffInMonths === 0) return "Nuevo";
    if (diffInMonths === 1) return "1 mes";
    if (diffInMonths < 12) return `${diffInMonths} meses`;
    const years = Math.floor(diffInMonths / 12);
    return years === 1 ? "1 año" : `${years} años`;
  };

  // Determinar el estado del negocio
  const schedule = business.schedule as BusinessSchedule | null;
  const specialClosedDays = business.specialClosedDays as Array<{
    date: string;
    reason: string;
  }> | null;

  const { isOpen: businessIsOpen } = schedule
    ? isBusinessOpen(schedule, business.status, specialClosedDays || [])
    : { isOpen: false };

  // Función para obtener el badge de estado
  const getStatusBadge = () => {
    if (business.status === "CERRADO_PERMANENTE") {
      return {
        label: "Cerrado permanentemente",
        color:
          "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
        dot: "bg-gray-500",
      };
    }

    if (business.status === "CERRADO_TEMPORAL") {
      return {
        label: "Cerrado temporalmente",
        color:
          "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
        dot: "bg-orange-500",
      };
    }

    if (businessIsOpen) {
      return {
        label: "Abierto",
        color:
          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
        dot: "bg-green-500 animate-pulse",
      };
    }

    return {
      label: "Cerrado",
      color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
      dot: "bg-red-500",
    };
  };

  const statusBadge = getStatusBadge();

  return (
    // UI improved: Enhanced card with better hover effects and dark mode support
    <Card className="group relative overflow-hidden bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* UI improved: Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-secondary/5 dark:group-hover:from-primary/10 dark:group-hover:to-secondary/10 transition-all duration-300 pointer-events-none" />

      {/* UI improved: Better badge styling with dark mode support */}
      <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm text-primary rounded-full text-xs font-medium border border-primary/20 shadow-sm">
        {getTimeSinceCreation(business.createdAt)}
      </div>

      {/* UI improved: Business image section */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={
            business.img ||
            "https://www.sillasmesas.es/blog/wp-content/uploads/2021/05/montar-un-negocio-de-comida-para-llevar-1.jpg"
          }
          alt={`Imagen de ${business.name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
      </div>

      {/* UI improved: Enhanced header with relative positioning */}
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
              {business.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {business.rubro}
              </span>

              {/* Badge de Estado del Negocio */}
              <div className="flex items-center gap-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.color}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}
                  />
                  {statusBadge.label}
                </span>

                {/* Botón de información de horarios */}
                <BusinessHoursDialog business={business} />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* UI improved: Enhanced content with better spacing */}
      <CardContent className="relative space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {business.description ||
            "Descubre lo que este negocio tiene para ofrecerte."}
        </p>

        {/* Contact and location info with improved icons */}
        <div className="space-y-2.5">
          {business.addressText && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground group/item">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="line-clamp-1 group-hover/item:text-foreground transition-colors">
                {business.addressText}
              </span>
            </div>
          )}

          {business.whatsappPhone && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-600 dark:text-green-500 flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>WhatsApp disponible</span>
            </div>
          )}

          {business.aliasPago && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 flex-shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Pagos digitales</span>
            </div>
          )}

          {/* Información de envío */}
          {business.hasShipping ? (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent/20 text-accent flex-shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-foreground font-medium">
                  Envío disponible
                </span>
                <span className="text-xs text-muted-foreground">
                  ${business.shippingCost?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-muted flex-shrink-0">
                <Package className="w-4 h-4" />
              </div>
              <span>Solo retiro en local</span>
            </div>
          )}
        </div>

        {/* UI improved: Enhanced statistics section */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
              <span className="font-medium">
                {business.products?.length || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span className="font-medium">
                {business.orders?.length || 0}
              </span>
            </div>
          </div>

          {/* Rating with improved styling */}
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">
              {(4.2 + Math.random() * 0.7).toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>

      {/* UI improved: Enhanced footer with better button styling */}
      <CardFooter className="relative pt-4 pb-0 px-0">
        <div className="flex gap-2 w-full px-6 pb-6">
          {business.whatsappPhone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-green-600/20 bg-green-500/5 text-green-700 dark:text-green-400 hover:bg-green-500/10 hover:border-green-600/40 transition-all duration-200"
              onClick={() =>
                window.open(`https://wa.me/${business.whatsappPhone}`, "_blank")
              }
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              <span className="font-medium">Chat</span>
            </Button>
          )}

          <Link href={`/businesses/${business.id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              <span>Ver tienda</span>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
