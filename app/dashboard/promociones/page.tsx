"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Tag,
  Loader2,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
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
import BackButton from "@/components/BackButton";
import NuevaPromocionDialog from "@/components/NuevaPromocionDialog";
import EditarPromocionDialog from "@/components/EditarPromocionDialog";
import EliminarPromocionDialog from "@/components/EliminarPromocionDialog";
import { PromotionWithProducts } from "@/app/types/types";
import { optimizeProductImage } from "@/lib/cloudinary-utils";

export default function PromocionesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [promociones, setPromociones] = useState<PromotionWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [businesses, setBusinesses] = useState<
    Array<{ id: string; name: string }>
  >([]);

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await fetch("/api/me");
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.role);

        // Si es propietario, obtener sus negocios
        if (data.role === "PROPIETARIO") {
          const businessRes = await fetch("/api/businesses");
          if (businessRes.ok) {
            const businessData = await businessRes.json();
            setBusinesses(businessData);
            if (businessData.length > 0) {
              setSelectedBusiness(businessData[0].id);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error al obtener rol:", error);
    }
  }, []);

  const fetchPromociones = useCallback(async () => {
    if (!selectedBusiness) return;

    try {
      setIsLoading(true);
      const url = `/api/promotions?businessId=${selectedBusiness}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al obtener promociones");
      }

      const data = await response.json();
      setPromociones(data);
    } catch (error) {
      console.error("Error al obtener promociones:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBusiness]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchUserRole();
  }, [isLoaded, user, router, fetchUserRole]);

  useEffect(() => {
    if (userRole && selectedBusiness) {
      fetchPromociones();
    }
  }, [userRole, selectedBusiness, fetchPromociones]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Validar acceso
  if (userRole !== "ADMINISTRADOR" && userRole !== "PROPIETARIO") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Acceso Denegado</CardTitle>
            <CardDescription>
              No tiene permisos para acceder a esta sección.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Sin límite";
    const d = new Date(date);
    // Usar UTC para evitar desfase de zona horaria
    const day = d.getUTCDate().toString().padStart(2, "0");
    const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton href="/dashboard" label="Volver al Dashboard" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Promociones y Ofertas
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestiona las promociones de tus negocios
          </p>
        </div>

        {selectedBusiness && (
          <NuevaPromocionDialog
            businessId={selectedBusiness}
            onSuccess={fetchPromociones}
          />
        )}
      </div>

      {/* Selector de negocio (solo para propietarios) */}
      {userRole === "PROPIETARIO" && businesses.length > 0 && (
        <div className="mb-6">
          <label
            htmlFor="business-selector"
            className="block text-sm font-medium mb-2"
          >
            Negocio:
          </label>
          <select
            id="business-selector"
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg bg-background"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de promociones */}
      {promociones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay promociones creadas aún
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promociones.map((promo) => {
            const totalIndividual = promo.products.reduce(
              (sum, p) => sum + (p.product?.price ?? 0) * p.quantity,
              0
            );
            const discount = totalIndividual - promo.price;
            const discountPercent = (discount / totalIndividual) * 100;

            return (
              <Card key={promo.id} className="overflow-hidden">
                {promo.image && (
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={optimizeProductImage(promo.image)}
                      alt={promo.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{promo.name}</CardTitle>
                    <div className="flex gap-1">
                      <EditarPromocionDialog
                        promotion={promo}
                        onSuccess={fetchPromociones}
                      />
                      <EliminarPromocionDialog
                        promotionId={promo.id}
                        promotionName={promo.name}
                        onSuccess={fetchPromociones}
                      />
                    </div>
                  </div>
                  {promo.description && (
                    <CardDescription className="line-clamp-2">
                      {promo.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Estado */}
                  <div className="flex items-center gap-2">
                    {promo.isActive ? (
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Activa
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactiva
                      </Badge>
                    )}
                    {promo.stock !== null && (
                      <Badge variant="outline">
                        <Package className="w-3 h-3 mr-1" />
                        Stock: {promo.stock}
                      </Badge>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${promo.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${totalIndividual.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Ahorrás ${discount.toFixed(2)} (
                      {discountPercent.toFixed(0)}% OFF)
                    </p>
                  </div>

                  {/* Productos incluidos */}
                  <div>
                    <p className="text-sm font-medium mb-2">Incluye:</p>
                    <div className="space-y-1">
                      {promo.products.map((p) => (
                        <div
                          key={p.id}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {p.quantity}
                          </span>
                          <span>{p.product?.name ?? "Producto"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fechas */}
                  {(promo.startDate || promo.endDate) && (
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                      {promo.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Desde: {formatDate(promo.startDate)}
                        </div>
                      )}
                      {promo.endDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Hasta: {formatDate(promo.endDate)}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
