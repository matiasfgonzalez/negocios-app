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

interface EliminarNegocioDialogProps {
  businessId: string;
  businessName: string;
  productCount?: number;
  triggerButton?: React.ReactNode;
}

export default function EliminarNegocioDialog({
  businessId,
  businessName,
  productCount = 0,
  triggerButton,
}: Readonly<EliminarNegocioDialogProps>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/businesses/${businessId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar el negocio");
      }

      // Cerrar dialog y refrescar la página
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Error al eliminar el negocio"
      );
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {triggerButton || (
          <Button
            variant="outline"
            size="sm"
            className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl sm:text-2xl text-foreground">
              ¿Eliminar negocio?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground space-y-3">
            <p>
              Estás a punto de eliminar el negocio{" "}
              <span className="font-semibold text-foreground">
                &quot;{businessName}&quot;
              </span>
              .
            </p>
            {productCount > 0 ? (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium">
                  ⚠️ Este negocio tiene {productCount} producto
                  {productCount === 1 ? "" : "s"} asociado
                  {productCount === 1 ? "" : "s"}.
                </p>
                <p className="text-sm mt-1 text-muted-foreground">
                  No podrás eliminarlo hasta que elimines todos los productos
                  primero.
                </p>
              </div>
            ) : (
              <p className="text-foreground">
                Esta acción no se puede deshacer. Todos los datos del negocio
                serán eliminados permanentemente.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
          <AlertDialogCancel
            disabled={isDeleting}
            className="hover:bg-accent border-border"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting || productCount > 0}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Sí, eliminar negocio
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
