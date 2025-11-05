"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { SubscriptionStatus } from "@/app/types/types";

interface SubscriptionStatusCardProps {
  readonly status: SubscriptionStatus;
  readonly canAccessOwnerFeatures: boolean;
  readonly becameOwnerAt: string;
  readonly subscriptionPaidUntil: string | null;
  readonly trialEndsAt: string | null;
  readonly nextPaymentDue: string | null;
  readonly daysRemaining: number | null;
  readonly daysOverdue: number | null;
}

export default function SubscriptionStatusCard({
  status,
  canAccessOwnerFeatures,
  becameOwnerAt,
  subscriptionPaidUntil,
  trialEndsAt,
  nextPaymentDue,
  daysRemaining,
  daysOverdue,
}: SubscriptionStatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "TRIAL":
        return {
          icon: Clock,
          label: "Período de Prueba",
          color:
            "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200",
          badgeVariant: "default" as const,
          message: `Estás en tu mes gratuito. Tenés ${daysRemaining} días restantes.`,
          variant: "default" as const,
        };
      case "ACTIVE":
        return {
          icon: CheckCircle2,
          label: "Activo",
          color:
            "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200",
          badgeVariant: "default" as const,
          message: "Tu suscripción está activa y al día.",
          variant: "default" as const,
        };
      case "OVERDUE":
        return {
          icon: AlertTriangle,
          label: "Pago Pendiente",
          color:
            "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200",
          badgeVariant: "secondary" as const,
          message: `Tu pago está vencido hace ${daysOverdue} días. Tenés ${
            7 - (daysOverdue || 0)
          } días antes de que se suspenda tu cuenta.`,
          variant: "destructive" as const,
        };
      case "SUSPENDED":
        return {
          icon: XCircle,
          label: "Suspendido",
          color: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200",
          badgeVariant: "destructive" as const,
          message:
            "Tu cuenta está suspendida por falta de pago. Registrá tu pago para reactivarla.",
          variant: "destructive" as const,
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="w-6 h-6 text-primary" />
            <CardTitle className="text-xl">Estado de Suscripción</CardTitle>
          </div>
          <Badge variant={config.badgeVariant} className="text-sm px-3 py-1">
            {config.label}
          </Badge>
        </div>
        <CardDescription>
          Información sobre tu plan de propietario
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert Message */}
        <Alert variant={config.variant} className={config.color}>
          <StatusIcon className="h-5 w-5" />
          <AlertDescription className="ml-2 font-medium">
            {config.message}
          </AlertDescription>
        </Alert>

        {/* Dates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Start Date */}
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">
                Propietario desde
              </p>
              <p className="text-base font-semibold truncate">
                {formatDate(becameOwnerAt)}
              </p>
            </div>
          </div>

          {/* Trial End or Paid Until */}
          {status === "TRIAL" && trialEndsAt ? (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Calendar className="w-5 h-5 mt-0.5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Prueba finaliza
                </p>
                <p className="text-base font-semibold text-blue-900 dark:text-blue-100 truncate">
                  {formatDate(trialEndsAt)}
                </p>
              </div>
            </div>
          ) : subscriptionPaidUntil ? (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <Calendar className="w-5 h-5 mt-0.5 text-green-600 dark:text-green-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Pagado hasta
                </p>
                <p className="text-base font-semibold text-green-900 dark:text-green-100 truncate">
                  {formatDate(subscriptionPaidUntil)}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Next Payment Due */}
        {nextPaymentDue && status !== "TRIAL" && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Próximo pago vence
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {formatDate(nextPaymentDue)}
                </p>
              </div>
              {status === "OVERDUE" && (
                <Badge variant="destructive" className="text-sm">
                  VENCIDO
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Access Status */}
        <div className="flex items-center gap-2 pt-2">
          {canAccessOwnerFeatures ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">
                Acceso completo a funciones de propietario
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Acceso suspendido - Registrá tu pago para reactivar
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
