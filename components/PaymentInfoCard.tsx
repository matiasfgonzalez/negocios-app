"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RegistrarPagoDialog from "@/components/RegistrarPagoDialog";

interface PaymentInfoCardProps {
  readonly monthlyFee: number;
  readonly bankName: string;
  readonly bankAlias: string;
  readonly bankCbu: string;
  readonly accountHolder: string;
  readonly accountType: string | null;
}

export default function PaymentInfoCard({
  monthlyFee,
  bankName,
  bankAlias,
  bankCbu,
  accountHolder,
  accountType,
}: PaymentInfoCardProps) {
  const handleSuccess = () => {
    // Refresh the page to get updated data
    globalThis.location.reload();
  };

  return (
    <Card className="shadow-md border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Información de Pago</CardTitle>
        <CardDescription>Datos para realizar tu transferencia</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Monto mensual
          </p>
          <p className="text-3xl font-bold text-primary">
            ${monthlyFee.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="pt-2 border-t">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Datos bancarios
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Banco:</span>
              <span className="font-medium">{bankName}</span>
            </div>
            {accountType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{accountType}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alias:</span>
              <span className="font-medium">{bankAlias}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CBU:</span>
              <span className="font-medium text-xs">{bankCbu}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Titular:</span>
              <span className="font-medium">{accountHolder}</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <RegistrarPagoDialog
            monthlyFee={monthlyFee}
            onSuccess={handleSuccess}
          />
        </div>

        <div className="pt-2 text-xs text-muted-foreground">
          <p>• Realizá la transferencia al alias indicado</p>
          <p>• Guardá el comprobante</p>
          <p>• Cargalo usando el botón de arriba</p>
          <p>• Esperá la aprobación del administrador</p>
        </div>
      </CardContent>
    </Card>
  );
}
