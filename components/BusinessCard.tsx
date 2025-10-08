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
import { useRouter } from "next/navigation";
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

export default function BusinessCard({
  business,
}: Readonly<{ business: Business }>) {
  const router = useRouter();

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

  return (
    <Card className="group hover:shadow-xl dark:hover:shadow-soft-dark transition-all duration-500 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 overflow-hidden relative">
      {/* Badge de tiempo en el negocio */}
      <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full text-xs font-medium shadow-sm border border-indigo-200/50 dark:border-indigo-700/50">
        {getTimeSinceCreation(business.createdAt)}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
              {business.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/50 dark:to-blue-900/50 text-primary-800 dark:text-primary-200 border border-primary-200/50 dark:border-primary-700/50">
                {business.rubro}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descripción */}
        <p className="text-neutral-600 dark:text-neutral-300 text-sm line-clamp-3 leading-relaxed">
          {business.description ||
            "Descubre lo que este negocio tiene para ofrecerte."}
        </p>

        {/* Información de contacto y ubicación */}
        <div className="space-y-2">
          {business.addressText && (
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <MapPin className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="line-clamp-1">{business.addressText}</span>
            </div>
          )}

          {business.whatsappPhone && (
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <MessageCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span>WhatsApp disponible</span>
            </div>
          )}

          {business.aliasPago && (
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <CreditCard className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span>Pagos digitales</span>
            </div>
          )}
        </div>

        {/* Estadísticas del negocio */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
              <span>{business.products?.length || 0} productos</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              <span>{business.orders?.length || 0} pedidos</span>
            </div>
          </div>

          {/* Rating simulado */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 dark:fill-yellow-300 dark:text-yellow-300" />
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {(4.2 + Math.random() * 0.7).toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex gap-2 w-full">
          {business.whatsappPhone && (
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer flex-1 border-green-300 dark:border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
              onClick={() =>
                window.open(`https://wa.me/${business.whatsappPhone}`, "_blank")
              }
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              WhatsApp
            </Button>
          )}

          <Button
            onClick={() => router.push(`/negocio/${business.id}`)}
            className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver tienda
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
