"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Building2,
  Mail,
  Phone,
} from "lucide-react";

interface ConfiguracionPagosClientProps {
  readonly initialConfig: {
    id: string;
    monthlyFee: number;
    bankName: string;
    bankAlias: string;
    bankCbu: string;
    accountHolder: string;
    accountType: string | null;
    supportEmail: string;
    supportPhone: string;
  };
}

export default function ConfiguracionPagosClient({
  initialConfig,
}: ConfiguracionPagosClientProps) {
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validaciones
    if (config.monthlyFee <= 0) {
      setError("El monto mensual debe ser mayor a 0");
      return;
    }

    if (!config.bankAlias.trim()) {
      setError("El alias bancario es requerido");
      return;
    }

    if (!config.bankCbu.trim()) {
      setError("El CBU es requerido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/payment-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la configuración");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al actualizar la configuración"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Monto mensual */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Monto de Suscripción
            </CardTitle>
            <CardDescription>
              Define el costo mensual de la suscripción para propietarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="monthlyFee" className="text-base">
                Monto mensual (ARS)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="monthlyFee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.monthlyFee}
                  onChange={(e) =>
                    handleChange(
                      "monthlyFee",
                      Number.parseFloat(e.target.value)
                    )
                  }
                  className="pl-7 text-lg font-semibold"
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos bancarios */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Datos Bancarios
            </CardTitle>
            <CardDescription>
              Información de la cuenta donde los propietarios deben depositar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Banco</Label>
                <Input
                  id="bankName"
                  value={config.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  placeholder="Ej: Banco Nación"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo de Cuenta</Label>
                <Input
                  id="accountType"
                  value={config.accountType || ""}
                  onChange={(e) => handleChange("accountType", e.target.value)}
                  placeholder="Ej: Cuenta Corriente"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAlias" className="text-base font-medium">
                Alias Bancario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bankAlias"
                value={config.bankAlias}
                onChange={(e) => handleChange("bankAlias", e.target.value)}
                placeholder="Ej: BARRIOMARKET.PAGOS"
                disabled={loading}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankCbu" className="text-base font-medium">
                CBU / CVU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bankCbu"
                value={config.bankCbu}
                onChange={(e) => handleChange("bankCbu", e.target.value)}
                placeholder="Ej: 0110599520000012345678"
                disabled={loading}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Titular de la Cuenta</Label>
              <Input
                id="accountHolder"
                value={config.accountHolder}
                onChange={(e) => handleChange("accountHolder", e.target.value)}
                placeholder="Ej: BarrioMarket S.A."
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Datos de contacto */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Contacto de Soporte
            </CardTitle>
            <CardDescription>
              Información de contacto para consultas sobre pagos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supportEmail">
                <Mail className="w-4 h-4 inline mr-2" />
                Email de Soporte
              </Label>
              <Input
                id="supportEmail"
                type="email"
                value={config.supportEmail}
                onChange={(e) => handleChange("supportEmail", e.target.value)}
                placeholder="Ej: pagos@barriomarket.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportPhone">
                <Phone className="w-4 h-4 inline mr-2" />
                WhatsApp de Soporte
              </Label>
              <Input
                id="supportPhone"
                value={config.supportPhone}
                onChange={(e) => handleChange("supportPhone", e.target.value)}
                placeholder="Ej: 5491123456789"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Formato: código de país + código de área + número (sin espacios
                ni símbolos)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mensajes de error/éxito */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200 ml-2">
              ¡Configuración actualizada exitosamente!
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de guardar */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfig(initialConfig)}
            disabled={loading}
          >
            Restablecer
          </Button>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
