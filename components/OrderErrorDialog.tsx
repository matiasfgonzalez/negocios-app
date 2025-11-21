"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface OrderErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
}

export default function OrderErrorDialog({
  isOpen,
  onClose,
  error,
}: Readonly<OrderErrorDialogProps>) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[450px] bg-card border-border">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          <AlertDialogTitle className="text-xl font-bold text-center text-foreground">
            Error al Procesar el Pedido
          </AlertDialogTitle>

          <AlertDialogDescription asChild>
            <div className="text-center space-y-3">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-foreground">{error}</p>
              </div>

              <p className="text-xs text-muted-foreground">
                Por favor, verifica los datos e intenta nuevamente. Si el
                problema persiste, contacta con el negocio directamente.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
