import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import {
  Tag,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
} from "lucide-react";
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
import { optimizeProductImage } from "@/lib/cloudinary-utils";
import { BusinessSelector } from "../../../components/business-selector";
import { getMe } from "@/app/actions/user";
import { getPromotions } from "@/app/actions/promotions";
import { getOwnerBusinesses } from "@/app/actions/businesses";
import { PromotionWithProductsAndBusiness } from "@/app/types/types";
import { getAllBusinesses } from "@/app/actions/businesses/businesses";
import NuevaPromocionDialogServer from "@/components/server/NuevaPromocionDialogServer";

interface PromocionesPageProps {
  searchParams: Promise<{ businessId?: string }>;
}

export default async function PromocionesPage({
  searchParams,
}: PromocionesPageProps) {
  const { userId } = await auth();
    // Obtener parámetros
  const params = await searchParams;
  let selectedBusinessId = params.businessId;
  let businesses: Array<{ id: string; name: string }> = [];
  
  let promociones: PromotionWithProductsAndBusiness[] = [];
  let user;

  if (!userId) {
    redirect("/sign-in");
  }

  // Obtener usuario y su rol usando la action
 
  try {
    user = await getMe();
  } catch {
    redirect("/sign-in");
  }

  if (!user) {
    redirect("/sign-in");
  }

  // Validar acceso
  if (user.role !== "ADMINISTRADOR" && user.role !== "PROPIETARIO") {
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
            <BackButton href="/dashboard" label="Volver al Dashboard" />
          </CardContent>
        </Card>
      </div>
    );
  }



  // Si es propietario, obtener sus negocios
  if (user.role === "PROPIETARIO") {
    try {
      businesses = await getOwnerBusinesses();
      console.log(businesses);
    } catch (error) {
      console.error("Error al obtener negocios:", error);
      businesses = [];
    }

    // Si no hay businessId en params, usar el primero
    if (!selectedBusinessId && businesses.length > 0) {
      selectedBusinessId = businesses[0].id;
    }
  }
  // Si es ADMINISTRADOR, obtener todos los negocios
  if (user.role === "ADMINISTRADOR") {
    try {
      console.log("Administrador obteniendo negocios");
      businesses = await getAllBusinesses();
    } catch (error) {
      console.error("Error al obtener negocios:", error);
      businesses = [];
    }
  }

  // Obtener promociones y productos usando las actions
   
  
  if (selectedBusinessId) {
    try {
      const [promosData] = await Promise.all([
        getPromotions(selectedBusinessId),
      ]);
      promociones = promosData;
    } catch (error) {
      console.error("Error al obtener datos:", error);
      promociones = [];
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Sin límite";
    const d = new Date(date);
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

        {selectedBusinessId && (
          <NuevaPromocionDialog
              businessId={selectedBusinessId}
            />
        )}
      </div>

      {/* Selector de negocio (solo para propietarios) */}
      {user.role === "PROPIETARIO" && businesses.length > 0 && (
        <BusinessSelector
          businesses={businesses}
          selectedBusinessId={selectedBusinessId || ""}
        />
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (sum: number, p: any) =>
                sum + (p.product?.price ?? 0) * p.quantity,
              0
            );
            const discount = totalIndividual - promo.price;
            const discountPercent = (discount / totalIndividual) * 100;

            return (
              <Card key={promo.id} className="overflow-hidden">
                {promo.image && (
                  <div className="h-48 overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      />
                      <EliminarPromocionDialog
                        promotionId={promo.id}
                        promotionName={promo.name}
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
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {promo.products.map((p: any) => (
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
