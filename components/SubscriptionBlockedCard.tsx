"use client";

import { AlertCircle, CreditCard } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type SubscriptionBlockedCardProps = {
  daysOverdue: number;
  title?: string;
  description?: string;
};

export default function SubscriptionBlockedCard({
  daysOverdue,
  title = "Acceso Restringido - Suscripción Suspendida",
  description = "Para continuar usando las funcionalidades de propietario, es necesario regularizar tu situación de pago.",
}: SubscriptionBlockedCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-destructive/50 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl text-destructive">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
              Tu suscripción está suspendida por falta de pago.{" "}
              <strong>
                {daysOverdue > 1
                  ? `Hace ${daysOverdue} días que venció tu último pago.`
                  : "Tu último pago venció hace 1 día."}
              </strong>
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              ¿Qué necesitás hacer?
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground ml-7 list-decimal">
              <li>Dirigite a la sección de Mis Pagos</li>
              <li>Registrá tu pago mensual con el comprobante</li>
              <li>
                Esperá la aprobación del administrador (generalmente en menos de
                24 horas)
              </li>
              <li>Una vez aprobado, podrás acceder nuevamente</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1" size="lg">
              <Link href="/dashboard/pagos">
                <CreditCard className="w-5 h-5 mr-2" />
                Ir a Mis Pagos
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link href="/dashboard">Volver al Dashboard</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              ¿Tenés algún problema?{" "}
              <Link
                href="/dashboard/pagos#ayuda"
                className="text-primary hover:underline"
              >
                Contactá a soporte
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
