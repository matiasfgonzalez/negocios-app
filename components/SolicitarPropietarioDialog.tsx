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
import { Store, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SolicitarPropietarioDialogProps {
  readonly onSuccess?: () => void;
}

export default function SolicitarPropietarioDialog({
  onSuccess,
}: SolicitarPropietarioDialogProps) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (description.trim().length < 20) {
      setError("La descripción debe tener al menos 20 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/role-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear la solicitud");
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setDescription("");
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la solicitud"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-md hover:shadow-lg transition-all">
          <Store className="w-5 h-5 mr-2" />
          Solicitar ser Propietario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Store className="w-6 h-6 text-primary" />
            Solicitar rol de Propietario
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            ¿Querés gestionar tu propio negocio en BarrioMarket? Contanos por
            qué te gustaría ser propietario y un administrador revisará tu
            solicitud.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 ml-2">
                ¡Solicitud enviada exitosamente! Un administrador la revisará
                pronto.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Descripción o motivo{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Ejemplo: Tengo un negocio de comidas y me gustaría vender mis productos en BarrioMarket para llegar a más clientes del barrio..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="resize-none"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  {description.length}/500 caracteres (mínimo 20)
                </p>
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
                disabled={loading || description.trim().length < 20}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4 mr-2" />
                    Enviar Solicitud
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
