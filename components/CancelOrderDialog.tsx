"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Loader2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CancelOrderDialogProps {
  orderId: string;
  orderNumber: string;
  businessName: string;
  isOwner?: boolean;
}

export default function CancelOrderDialog({
  orderId,
  orderNumber,
  businessName,
  isOwner = false,
}: CancelOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCancel = async () => {
    setError(null);

    // Validar que se haya ingresado un motivo
    if (!cancellationReason.trim()) {
      setError("Debes proporcionar un motivo de cancelación");
      return;
    }

    if (cancellationReason.trim().length < 10) {
      setError("El motivo debe tener al menos 10 caracteres");
      return;
    }

    setIsCancelling(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: "CANCELADA",
          cancellationReason: cancellationReason.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al cancelar el pedido");
      }

      // Cerrar el diálogo y limpiar el formulario
      setIsOpen(false);
      setCancellationReason("");

      // Refrescar la página para mostrar los cambios
      router.refresh();
    } catch (err) {
      console.error("Error al cancelar pedido:", err);
      setError(
        err instanceof Error ? err.message : "Error al cancelar el pedido"
      );
      setIsCancelling(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50 transition-colors duration-200"
        >
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          Cancelar pedido
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl">
              ¿Cancelar pedido?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-base text-muted-foreground">
                Estás a punto de cancelar el pedido{" "}
                <span className="font-semibold text-foreground">
                  #{orderNumber}
                </span>{" "}
                del negocio{" "}
                <span className="font-semibold text-foreground">
                  {businessName}
                </span>
                .
              </p>
              <p className="text-sm text-destructive font-medium">
                {isOwner
                  ? "Esta acción notificará al cliente sobre la cancelación."
                  : "Esta acción notificará al negocio sobre la cancelación."}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="cancellationReason"
              className="text-sm font-semibold"
            >
              Motivo de cancelación <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="cancellationReason"
              placeholder={
                isOwner
                  ? "Ej: Productos agotados, no podemos cumplir con el tiempo de entrega, etc."
                  : "Ej: Cambié de opinión, encontré mejor precio, me equivoqué de producto, etc."
              }
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={isCancelling}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres ({cancellationReason.length}/500)
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isCancelling || !cancellationReason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelando...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Sí, cancelar pedido
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
