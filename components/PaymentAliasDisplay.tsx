"use client";

import { useState } from "react";
import { Copy, Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentAliasDisplayProps {
  readonly aliasPago: string;
  readonly businessName: string;
}

export default function PaymentAliasDisplay({
  aliasPago,
  businessName,
}: Readonly<PaymentAliasDisplayProps>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Método 1: Intentar usar Clipboard API (moderno)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(aliasPago);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Método 2: Fallback para navegadores móviles y contextos no seguros
      const textArea = document.createElement("textarea");
      textArea.value = aliasPago;

      // Hacer el textarea invisible pero accesible
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      textArea.setAttribute("readonly", "");

      document.body.appendChild(textArea);

      // Seleccionar el texto
      textArea.focus();
      textArea.select();

      // Para iOS
      textArea.setSelectionRange(0, 99999);

      // Copiar el texto
      const successful = document.execCommand("copy");

      // Limpiar
      document.body.removeChild(textArea);

      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error("No se pudo copiar");
      }
    } catch (err) {
      console.error("Error al copiar:", err);
      // Mostrar una alerta como último recurso
      alert(`Alias de pago: ${aliasPago}\n\nCopia este texto manualmente.`);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Wallet className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">Alias de pago</p>
        <p className="text-sm font-mono font-semibold text-foreground truncate">
          {aliasPago}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex-shrink-0 h-8"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />
            <span className="text-xs">Copiado</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs">Copiar</span>
          </>
        )}
      </Button>
    </div>
  );
}
