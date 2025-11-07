"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  MapPin,
  Phone,
  DollarSign,
  Trash2,
  Pencil,
  Loader2,
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
import NuevoNegocioDialog from "@/components/NuevoNegocioDialog";
import EditarNegocioDialog from "@/components/EditarNegocioDialog";
import EliminarNegocioDialog from "@/components/EliminarNegocioDialog";
import SubscriptionBlockedCard from "@/components/SubscriptionBlockedCard";
import { BusinessWithRelations } from "@/app/types/types";

export default function NegociosPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [negocios, setNegocios] = useState<BusinessWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [subscriptionBlocked, setSubscriptionBlocked] = useState(false);
  const [daysOverdue, setDaysOverdue] = useState(0);

  const role = user?.publicMetadata?.role as string;

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (role !== "ADMINISTRADOR" && role !== "PROPIETARIO") {
      router.push("/dashboard");
      return;
    }

    // Obtener el usuario de la base de datos y verificar suscripción
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.id) {
          setUserId(data.id);

          // Solo validar suscripción para propietarios (no para admins)
          if (data.role === "PROPIETARIO") {
            const now = new Date();
            const becameOwnerAt = new Date(data.becameOwnerAt || now);
            const trialEndDate = new Date(becameOwnerAt);
            trialEndDate.setMonth(trialEndDate.getMonth() + 1);
            const isInTrial = now < trialEndDate;

            // Si no está en período de prueba, verificar estado de suscripción
            if (!isInTrial) {
              if (data.subscriptionPaidUntil) {
                const paidUntil = new Date(data.subscriptionPaidUntil);
                const diffTime = now.getTime() - paidUntil.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Si tiene más de 7 días de retraso, bloquear acceso
                if (diffDays > 7) {
                  setSubscriptionBlocked(true);
                  setDaysOverdue(diffDays);
                  setIsLoading(false);
                  return;
                }
              } else {
                // No tiene fecha de pago y no está en prueba = suspendido
                setSubscriptionBlocked(true);
                setDaysOverdue(
                  Math.ceil(
                    (now.getTime() - trialEndDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                );
                setIsLoading(false);
                return;
              }
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error al obtener usuario:", error);
      });
  }, [user, isLoaded, role, router]);

  // Obtener negocios desde la API
  useEffect(() => {
    if (!user || !role) return;

    setIsLoading(true);
    fetch("/api/businesses?forManagement=true")
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener negocios");
        return res.json();
      })
      .then((data: BusinessWithRelations[]) => {
        setNegocios(data);
      })
      .catch((error) => {
        console.error("Error al obtener negocios:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, role]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !role) {
    return null;
  }

  // Mostrar pantalla de bloqueo si la suscripción está suspendida
  if (subscriptionBlocked) {
    return (
      <SubscriptionBlockedCard
        daysOverdue={daysOverdue}
        title="No podés gestionar tu negocio - Suscripción Suspendida"
        description="Tu suscripción ha sido suspendida por falta de pago. Regularizá tu situación para continuar administrando tu negocio."
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BackButton href="/dashboard" label="Volver al Dashboard" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {role === "PROPIETARIO" ? "Mi Negocio" : "Gestión de Negocios"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {role === "PROPIETARIO"
                ? "Administra la información y productos de tu negocio"
                : "Visualiza y gestiona todos los negocios registrados"}
            </p>
          </div>
          {userId && <NuevoNegocioDialog userId={userId} />}
        </div>

        {/* UI improved: Enhanced Empty State */}
        {negocios.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="py-12 sm:py-16 text-center">
              <Store className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                No hay negocios registrados
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                {role === "PROPIETARIO"
                  ? "Crea tu primer negocio para comenzar a vender"
                  : "Aún no hay negocios registrados en el sistema"}
              </p>
              {userId && <NuevoNegocioDialog userId={userId} />}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {negocios.map((negocio) => (
              <Card
                key={negocio.id}
                className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      {negocio.img ? (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0 bg-muted">
                          <img
                            src={negocio.img}
                            alt={`Logo de ${negocio.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
                          <Store className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg text-foreground truncate group-hover:text-primary transition-colors">
                          {negocio.name}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground truncate">
                          {negocio.rubro}
                        </CardDescription>
                        {role === "ADMINISTRADOR" && negocio.owner.name && (
                          <p className="text-xs text-muted-foreground/70 mt-1 truncate">
                            Propietario: {negocio.owner.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 whitespace-nowrap">
                      Activo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* UI improved: Enhanced Business Info */}
                  <div className="space-y-2.5 sm:space-y-3">
                    {negocio.addressText && (
                      <div className="flex items-start gap-3 text-xs sm:text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground break-words">
                          {negocio.addressText}
                        </span>
                      </div>
                    )}
                    {negocio.whatsappPhone && (
                      <div className="flex items-center gap-3 text-xs sm:text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <a
                          href={`https://wa.me/${negocio.whatsappPhone.replaceAll(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        >
                          {negocio.whatsappPhone}
                        </a>
                      </div>
                    )}
                    {negocio.aliasPago && (
                      <div className="flex items-center gap-3 text-xs sm:text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors">
                        <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span className="text-foreground">
                          Alias: {negocio.aliasPago}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* UI improved: Enhanced Stats */}
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-accent/30 rounded-xl border border-border">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Productos
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {negocio._count.products}
                      </p>
                    </div>
                    <Link href={`/businesses/${negocio.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer hover:bg-accent border-border text-xs sm:text-sm"
                      >
                        Ver Negocio
                      </Button>
                    </Link>
                  </div>

                  {/* UI improved: Enhanced Actions */}
                  <div className="flex flex-col gap-2 sm:gap-3 pt-2">
                    <div className="flex gap-2 sm:gap-3">
                      <EditarNegocioDialog
                        business={negocio}
                        triggerButton={
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-accent border-border text-xs sm:text-sm"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        }
                      />
                      <Link
                        href={`/dashboard/productos?negocioId=${negocio.id}`}
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-accent border-border text-xs sm:text-sm"
                        >
                          Productos
                        </Button>
                      </Link>
                    </div>
                    <EliminarNegocioDialog
                      businessId={negocio.id}
                      businessName={negocio.name}
                      productCount={negocio._count.products}
                      triggerButton={
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                          Eliminar
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
