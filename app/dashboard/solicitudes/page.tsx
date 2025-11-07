"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Store,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BackButton from "@/components/BackButton";
import SolicitarPropietarioDialog from "@/components/SolicitarPropietarioDialog";
import type { RoleRequest } from "@/app/types/types";

export default function SolicitudesPage() {
  const { user, isLoaded } = useUser();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/role-requests");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cargar solicitudes");
      }

      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar solicitudes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchRequests();
    }
  }, [isLoaded, user]);

  const handleCancelRequest = async (id: string) => {
    if (!confirm("¿Estás seguro de que querés cancelar esta solicitud?")) {
      return;
    }

    try {
      const res = await fetch(`/api/role-requests/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cancelar solicitud");
      }

      // Actualizar la lista
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al cancelar solicitud");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDIENTE":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "APROBADA":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprobada
          </Badge>
        );
      case "RECHAZADA":
        return (
          <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazada
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  const hasPendingRequest = requests.some((r) => r.status === "PENDIENTE");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <BackButton href="/dashboard" label="Volver al Dashboard" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Mis Solicitudes
              </h1>
              <p className="text-muted-foreground mt-2">
                Gestioná tus solicitudes para ser propietario de negocio
              </p>
            </div>

            {!hasPendingRequest && (
              <SolicitarPropietarioDialog onSuccess={fetchRequests} />
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Pending Request Alert */}
        {hasPendingRequest && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              Tenés una solicitud pendiente. Un administrador la revisará
              pronto.
            </AlertDescription>
          </Alert>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card className="border-border bg-card/50">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Store className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No tenés solicitudes
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                ¿Querés gestionar tu propio negocio? Solicitá el rol de
                propietario y un administrador revisará tu petición.
              </p>
              <SolicitarPropietarioDialog onSuccess={fetchRequests} />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card
                key={request.id}
                className="border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2 mb-2">
                        <Store className="w-5 h-5 text-primary" />
                        Solicitud de rol de Propietario
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>
                          Creada el{" "}
                          {new Date(request.createdAt).toLocaleDateString(
                            "es-AR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">
                      Motivo de la solicitud:
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {request.description}
                    </p>
                  </div>

                  {/* Review Note */}
                  {request.reviewNote && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        {request.status === "APROBADA"
                          ? "Nota del administrador:"
                          : "Motivo del rechazo:"}
                      </h4>
                      <p
                        className={`text-sm p-3 rounded-lg ${
                          request.status === "APROBADA"
                            ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200"
                            : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {request.reviewNote}
                      </p>
                    </div>
                  )}

                  {/* Reviewed Info */}
                  {request.reviewedAt && (
                    <p className="text-xs text-muted-foreground">
                      Revisada el{" "}
                      {new Date(request.reviewedAt).toLocaleDateString(
                        "es-AR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  )}

                  {/* Actions */}
                  {request.status === "PENDIENTE" && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancelar Solicitud
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
