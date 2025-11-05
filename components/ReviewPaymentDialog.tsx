"use client";

import { useState } from "react";
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
import { Loader2, CheckCircle2, XCircle, AlertCircle, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Payment } from "@/app/types/types";
import Image from "next/image";

interface ReviewPaymentDialogProps {
  readonly payment: Payment;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSuccess?: () => void;
}

export default function ReviewPaymentDialog({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: ReviewPaymentDialogProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPeriod = (periodMonth: string) => {
    const [year, month] = periodMonth.split("-");
    const date = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      1
    );
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (!action) return;

    if (action === "reject" && !adminNote.trim()) {
      setError("Debes proporcionar una razón para rechazar el pago");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          adminNote: adminNote.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            `Error al ${action === "approve" ? "aprobar" : "rechazar"} el pago`
        );
      }

      setSuccess(true);
      setTimeout(() => {
        setAction(null);
        setAdminNote("");
        setSuccess(false);
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar el pago"
      );
    } finally {
      setLoading(false);
    }
  };

  const isImage = payment.proofUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Revisar Pago</DialogTitle>
          <DialogDescription>
            Revisa el comprobante y aprueba o rechaza el pago
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 ml-2">
                {action === "approve"
                  ? "¡Pago aprobado exitosamente! La suscripción del propietario se ha actualizado."
                  : "Pago rechazado. El propietario recibirá la notificación."}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Propietario</p>
                  <p className="font-semibold">
                    {payment.owner?.fullName || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {payment.owner?.email || ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-semibold">
                    {formatPeriod(payment.periodMonth)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-2xl font-bold text-primary">
                    ${payment.amount.toLocaleString("es-AR")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Fecha de envío
                  </p>
                  <p className="font-medium">
                    {formatDate(payment.createdAt.toString())}
                  </p>
                </div>
              </div>

              {/* Owner Note */}
              {payment.ownerNote && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Nota del propietario:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {payment.ownerNote}
                  </p>
                </div>
              )}

              {/* Proof Preview */}
              <div className="space-y-2">
                <Label className="text-base font-medium">
                  Comprobante de pago
                </Label>
                <div className="border rounded-lg overflow-hidden bg-muted/30">
                  {isImage ? (
                    <div className="relative w-full h-[400px]">
                      <Image
                        src={payment.proofUrl || ""}
                        alt="Comprobante de pago"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Archivo PDF - Abrirlo en nueva pestaña para visualizar
                      </p>
                      <Button variant="outline" asChild>
                        <a
                          href={payment.proofUrl || ""}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver comprobante
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Selection */}
              {!action && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setAction("approve")}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Aprobar Pago
                  </Button>
                  <Button
                    onClick={() => setAction("reject")}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Rechazar Pago
                  </Button>
                </div>
              )}

              {/* Admin Note (for reject or optional for approve) */}
              {action && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="adminNote" className="text-base font-medium">
                    {action === "reject" ? (
                      <>
                        Razón del rechazo{" "}
                        <span className="text-destructive">*</span>
                      </>
                    ) : (
                      "Nota adicional (opcional)"
                    )}
                  </Label>
                  <Textarea
                    id="adminNote"
                    placeholder={
                      action === "reject"
                        ? "Ej: El comprobante está borroso y no se puede verificar..."
                        : "Ej: Pago verificado correctamente"
                    }
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    className="resize-none"
                    disabled={loading}
                  />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              {action ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAction(null);
                      setAdminNote("");
                      setError("");
                    }}
                    disabled={loading}
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      loading || (action === "reject" && !adminNote.trim())
                    }
                    variant={action === "approve" ? "default" : "destructive"}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        {action === "approve" ? (
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                        ) : (
                          <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Confirmar{" "}
                        {action === "approve" ? "Aprobación" : "Rechazo"}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cerrar
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
