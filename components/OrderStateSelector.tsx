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
import { Loader2 } from "lucide-react";
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

  const handleStateChange = async (newState: string) => {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/state`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el estado");
      }

      // Revalidar la página para mostrar los cambios
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    } finally {
      setIsUpdating(false);
    }
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
  );
}
