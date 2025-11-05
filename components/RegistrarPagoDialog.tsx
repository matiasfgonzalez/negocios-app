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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegistrarPagoDialogProps {
  readonly monthlyFee: number;
  readonly onSuccess?: () => void;
}

export default function RegistrarPagoDialog({
  monthlyFee,
  onSuccess,
}: RegistrarPagoDialogProps) {
  const [open, setOpen] = useState(false);
  const [periodMonth, setPeriodMonth] = useState("");
  const [ownerNote, setOwnerNote] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Generar opciones de meses (próximos 3 meses)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = date.toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }

    return options;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no puede superar los 5MB");
        return;
      }

      // Validar tipo
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Solo se permiten imágenes (JPG, PNG, WEBP) o PDF");
        return;
      }

      setProofFile(file);
      setError("");
    }
  };

  const uploadProof = async (): Promise<{
    url: string;
    publicId: string;
  } | null> => {
    if (!proofFile) return null;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", proofFile);

    try {
      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir el comprobante");
      }

      return {
        url: data.url,
        publicId: data.publicId,
      };
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir el comprobante"
      );
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!periodMonth) {
      setError("Debes seleccionar el período de pago");
      return;
    }

    if (!proofFile) {
      setError("Debes cargar el comprobante de pago");
      return;
    }

    setLoading(true);

    try {
      // Primero subir el comprobante
      const uploadResult = await uploadProof();
      if (!uploadResult) {
        return; // El error ya se setea en uploadProof
      }

      // Luego registrar el pago
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: monthlyFee,
          periodMonth,
          proofUrl: uploadResult.url,
          proofPublicId: uploadResult.publicId,
          ownerNote: ownerNote.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar el pago");
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setPeriodMonth("");
        setOwnerNote("");
        setProofFile(null);
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al registrar el pago"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-md hover:shadow-lg transition-all">
          <FileText className="w-5 h-5 mr-2" />
          Registrar Pago
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-primary" />
            Registrar Pago Mensual
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Cargá el comprobante de pago de tu suscripción mensual. Un
            administrador lo revisará y activará tu cuenta.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200 ml-2">
                ¡Pago registrado exitosamente! Un administrador lo revisará
                pronto.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Amount Display */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">
                  Monto mensual:
                </p>
                <p className="text-2xl font-bold text-primary">
                  ${monthlyFee.toLocaleString("es-AR")}
                </p>
              </div>

              {/* Period Month */}
              <div className="space-y-2">
                <Label htmlFor="periodMonth" className="text-base font-medium">
                  Período de pago <span className="text-destructive">*</span>
                </Label>
                <Select value={periodMonth} onValueChange={setPeriodMonth}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {generateMonthOptions().map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Proof Upload */}
              <div className="space-y-2">
                <Label htmlFor="proof" className="text-base font-medium">
                  Comprobante de pago{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    disabled={loading || uploading}
                    className="flex-1"
                  />
                  {proofFile && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Formatos permitidos: JPG, PNG, WEBP, PDF (máx. 5MB)
                </p>
                {proofFile && (
                  <p className="text-sm text-primary">
                    Archivo seleccionado: {proofFile.name}
                  </p>
                )}
              </div>

              {/* Owner Note */}
              <div className="space-y-2">
                <Label htmlFor="ownerNote" className="text-base font-medium">
                  Nota (opcional)
                </Label>
                <Textarea
                  id="ownerNote"
                  placeholder="Ej: Pago realizado el 15/11 vía transferencia bancaria"
                  value={ownerNote}
                  onChange={(e) => setOwnerNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                  disabled={loading}
                />
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
                disabled={loading || uploading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || uploading || !periodMonth || !proofFile}
              >
                {loading || uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploading ? "Subiendo..." : "Registrando..."}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Registrar Pago
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
