"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
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

interface DeleteOrderDialogProps {
  orderId: string;
  orderNumber: string;
  businessName: string;
}

export default function DeleteOrderDialog({
  orderId,
  orderNumber,
  businessName,
}: DeleteOrderDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el pedido");
      }

      // Refrescar la página para mostrar la lista actualizada
      router.refresh();
    } catch (err) {
      console.error("Error al eliminar pedido:", err);
      setError(
        err instanceof Error ? err.message : "Error al eliminar el pedido"
      );
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50 transition-colors duration-200"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl">
              ¿Eliminar pedido?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-3">
            <p>
              Estás a punto de eliminar el pedido{" "}
              <span className="font-semibold text-foreground">
                #{orderNumber}
              </span>{" "}
              del negocio{" "}
              <span className="font-semibold text-foreground">
                {businessName}
              </span>
              .
            </p>
            <p className="text-destructive font-medium">
              Esta acción no se puede deshacer.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar pedido
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
