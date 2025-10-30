"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { RoleRequest } from "@/app/types/types";

interface RevisarSolicitudDialogProps {
  readonly request: RoleRequest;
  readonly action: "approve" | "reject";
  readonly onSuccess?: () => void;
}

export default function RevisarSolicitudDialog({
  request,
  action,
  onSuccess,
}: RevisarSolicitudDialogProps) {
  const [open, setOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isApprove = action === "approve";
  const requiresNote = !isApprove; // Rechazo requiere nota obligatoria

  const handleSubmit = async () => {
    setError("");

    if (requiresNote && reviewNote.trim().length === 0) {
      setError("Debes proporcionar un motivo para el rechazo");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/role-requests/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          reviewNote: reviewNote.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al procesar la solicitud");
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setReviewNote("");
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al procesar la solicitud"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isApprove ? (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Aprobar
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rechazar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isApprove ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Aprobar Solicitud
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-red-600" />
                Rechazar Solicitud
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isApprove ? (
              <>
                Estás por aprobar la solicitud de{" "}
                <strong>{request.user?.fullName || request.user?.email}</strong>{" "}
                para ser propietario. Esta acción cambiará su rol
                automáticamente.
              </>
            ) : (
              <>
                Estás por rechazar la solicitud de{" "}
                <strong>{request.user?.fullName || request.user?.email}</strong>
                . Debes proporcionar un motivo claro para el rechazo.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Alert
              className={
                isApprove
                  ? "border-green-200 bg-green-50 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50 dark:bg-red-950/20"
              }
            >
              <CheckCircle2
                className={`h-5 w-5 ${
                  isApprove
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              />
              <AlertDescription
                className={
                  isApprove
                    ? "text-green-800 dark:text-green-200 ml-2"
                    : "text-red-800 dark:text-red-200 ml-2"
                }
              >
                {isApprove
                  ? "¡Solicitud aprobada exitosamente! El usuario ahora es propietario."
                  : "Solicitud rechazada. El usuario ha sido notificado."}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* User Info */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Usuario:</span>{" "}
                  {request.user?.fullName || "N/A"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{" "}
                  {request.user?.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Motivo:</span>
                </p>
                <p className="text-sm text-muted-foreground italic">
                  {request.description}
                </p>
              </div>

              {/* Review Note */}
              <div className="space-y-2">
                <Label htmlFor="reviewNote" className="text-base font-medium">
                  {isApprove ? "Nota (opcional)" : "Motivo del rechazo"}
                  {requiresNote && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <Textarea
                  id="reviewNote"
                  placeholder={
                    isApprove
                      ? "Ej: ¡Bienvenido como propietario! Esperamos que tengas éxito con tu negocio."
                      : "Ej: La descripción no proporciona suficiente información sobre tu negocio. Por favor, volvé a solicitarlo con más detalles."
                  }
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={loading}
                />
                {requiresNote && (
                  <p className="text-sm text-muted-foreground">
                    Es importante proporcionar un motivo claro para que el
                    usuario entienda por qué se rechazó su solicitud.
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={
                  loading || (requiresNote && reviewNote.trim().length === 0)
                }
                className={
                  isApprove
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : isApprove ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Aprobar
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
