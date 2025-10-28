import { Loader2, CheckCircle, Shield } from "lucide-react";
import Image from "next/image";

export default function SSOCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-white rounded-2xl overflow-hidden shadow-lg p-2.5">
              <Image
                src="/logo.PNG"
                alt="BarrioMarket Logo"
                width={80}
                height={80}
                className="object-contain w-full h-full"
                priority
              />
            </div>
          </div>

          {/* Loading Animation */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
              <Loader2 className="relative w-12 h-12 sm:w-14 sm:h-14 animate-spin text-primary mx-auto" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Iniciando sesión...
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Estamos configurando tu cuenta
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>Autenticación completada</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-primary flex-shrink-0" />
              <span>Sincronizando datos...</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground/50">
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-border flex-shrink-0" />
              <span>Redirigiendo al panel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
