"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { OrderState } from "@/app/types/types";

const ORDER_STATES: Array<{ value: OrderState; label: string }> = [
  { value: "REGISTRADA", label: "Registrada" },
  { value: "PENDIENTE_PAGO", label: "Pendiente de Pago" },
  { value: "PAGADA", label: "Pagada" },
  { value: "PREPARANDO", label: "Preparando" },
  { value: "ENVIADA", label: "Enviada" },
  { value: "ENTREGADA", label: "Entregada" },
  { value: "CANCELADA", label: "Cancelada" },
];

interface OrderStateSelectorProps {
  orderId: string;
  currentState: OrderState;
}

export default function OrderStateSelector({
  orderId,
  currentState,
}: Readonly<OrderStateSelectorProps>) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleStateChange = async (newState: string) => {
    // Si el nuevo estado es CANCELADA, mostrar el diálogo para pedir el motivo
    if (newState === "CANCELADA") {
      setShowCancelDialog(true);
      return;
    }

    // Para otros estados, actualizar directamente
    await updateOrderState(newState);
  };

  const updateOrderState = async (newState: string, reason?: string) => {
    setIsUpdating(true);
    setError(null);

    try {
      const body: { state: string; cancellationReason?: string } = {
        state: newState,
      };

      if (newState === "CANCELADA" && reason) {
        body.cancellationReason = reason;
      }

      const response = await fetch(`/api/orders/${orderId}/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el estado");
      }

      // Cerrar el diálogo si está abierto
      setShowCancelDialog(false);
      setCancellationReason("");

      // Revalidar la página para mostrar los cambios
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      setError("Debes proporcionar un motivo de cancelación");
      return;
    }

    if (cancellationReason.trim().length < 10) {
      setError("El motivo debe tener al menos 10 caracteres");
      return;
    }

    await updateOrderState("CANCELADA", cancellationReason.trim());
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "REGISTRADA":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "PENDIENTE_PAGO":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
      case "PAGADA":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "PREPARANDO":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
      case "ENVIADA":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
      case "ENTREGADA":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
      case "CANCELADA":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <>
      <div className="relative">
        <Select
          value={currentState}
          onValueChange={handleStateChange}
          disabled={isUpdating}
        >
          <SelectTrigger
            className={`w-[180px] ${getStateColor(
              currentState
            )} border-2 font-semibold`}
          >
            {isUpdating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Actualizando...</span>
              </div>
            ) : (
              <SelectValue />
            )}
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATES.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Diálogo para motivo de cancelación */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle className="text-xl">Cancelar Pedido</DialogTitle>
            </div>
            <DialogDescription>
              Por favor, proporciona un motivo para cancelar este pedido. Esta
              información será visible para el cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold">
                Motivo de cancelación <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Ej: Productos agotados, no podemos cumplir con el tiempo de entrega, problemas con el inventario, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                disabled={isUpdating}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres ({cancellationReason.length}/500)
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason("");
                setError(null);
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isUpdating || !cancellationReason.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Confirmar cancelación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
