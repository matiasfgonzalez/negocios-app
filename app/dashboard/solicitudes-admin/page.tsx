"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RevisarSolicitudDialog from "@/components/RevisarSolicitudDialog";
import type { RoleRequest } from "@/app/types/types";

export default function GestionarSolicitudesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/role-requests"
          : `/api/role-requests?status=${statusFilter}`;

      const res = await fetch(url);
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
  }, [isLoaded, user, statusFilter]);

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

  const pendingCount = requests.filter((r) => r.status === "PENDIENTE").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-accent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Gestión de Solicitudes
              </h1>
              <p className="text-muted-foreground mt-2">
                Revisá y gestioná las solicitudes de rol de propietario
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pendientes
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {pendingCount}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Aprobadas</p>
                      <p className="text-2xl font-bold text-foreground">
                        {requests.filter((r) => r.status === "APROBADA").length}
                      </p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Rechazadas
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {
                          requests.filter((r) => r.status === "RECHAZADA")
                            .length
                        }
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px] bg-background border-border">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="PENDIENTE">Pendientes</SelectItem>
                  <SelectItem value="APROBADA">Aprobadas</SelectItem>
                  <SelectItem value="RECHAZADA">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card className="border-border bg-card/50">
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No hay solicitudes
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "Aún no hay solicitudes de cambio de rol"
                  : `No hay solicitudes con estado "${statusFilter}"`}
              </p>
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
                        <Users className="w-5 h-5 text-primary" />
                        {request.user?.fullName ||
                          request.user?.email ||
                          "Usuario"}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{request.user?.email}</span>
                        <span>•</span>
                        <span>
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
                          ? "Nota de aprobación:"
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
                    <div className="pt-2 flex gap-2">
                      <RevisarSolicitudDialog
                        request={request}
                        action="approve"
                        onSuccess={fetchRequests}
                      />
                      <RevisarSolicitudDialog
                        request={request}
                        action="reject"
                        onSuccess={fetchRequests}
                      />
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
