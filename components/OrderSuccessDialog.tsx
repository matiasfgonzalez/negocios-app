"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle, Package, ArrowRight } from "lucide-react";

interface OrderSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  total: number;
  businessName: string;
  whatsappLink: string | null;
  deliveryType: "pickup" | "delivery";
}

export default function OrderSuccessDialog({
  isOpen,
  onClose,
  orderId,
  total,
  businessName,
  whatsappLink,
  deliveryType,
}: Readonly<OrderSuccessDialogProps>) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!isOpen || !autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard/pedidos");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, autoRedirect, router]);

  const handleWhatsAppRedirect = () => {
    if (whatsappLink) {
      window.open(whatsappLink, "_blank");
      // Esperar un momento antes de redirigir al dashboard
      setTimeout(() => {
        router.push("/dashboard/pedidos");
      }, 1500);
    }
  };

  const handleViewOrders = () => {
    router.push("/dashboard/pedidos");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader className="space-y-4">
          <div className="mx-auto relative">
            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            ¡Pedido Realizado con Éxito!
          </DialogTitle>

          <DialogDescription className="text-center space-y-4">
            <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pedido ID:</span>
                <span className="font-mono font-semibold text-foreground">
                  #{orderId.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Negocio:</span>
                <span className="font-semibold text-foreground">
                  {businessName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {deliveryType === "delivery"
                    ? "Envío a domicilio"
                    : "Retiro en local"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground font-semibold">
                  Total:
                </span>
                <span className="text-xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-2 pt-2">
              <p>
                <span>
                  Tu pedido ha sido registrado y está siendo procesado por{" "}
                </span>
                <span className="font-semibold text-foreground">
                  {businessName}
                </span>
                <span>.</span>
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {whatsappLink && (
            <Button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contactar por WhatsApp
            </Button>
          )}

          <Button
            onClick={handleViewOrders}
            variant="outline"
            className="w-full border-border hover:bg-accent py-6 font-semibold"
            size="lg"
          >
            <Package className="w-5 h-5 mr-2" />
            Ver mis pedidos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="text-center pt-2">
            <button
              onClick={() => setAutoRedirect(!autoRedirect)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {autoRedirect ? (
                <>
                  Redirigiendo a tus pedidos en {countdown}s...{" "}
                  <span className="underline">Cancelar</span>
                </>
              ) : (
                <span className="underline">
                  Activar redirección automática
                </span>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
