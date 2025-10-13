"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/");
    }
  }, [userLoaded, isSignedIn, router]);

  if (!userLoaded || !signInLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm sm:text-base text-muted-foreground font-medium">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    try {
      // Redirige al flujo de Google OAuth
      await signIn?.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback", // tu callback personalizado
        redirectUrlComplete: "/sso-callback", // obligatorio para TS, puede ser igual
      });
    } catch (err) {
      console.error("Error iniciando sesión con Google:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* UI improved: Enhanced Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                NegociosApp
              </span>
              <div className="text-xs text-muted-foreground font-medium">
                Gestión de Negocios
              </div>
            </div>
          </Link>
        </div>

        {/* UI improved: Enhanced Main Card */}
        <Card className="border-border shadow-xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-4 px-4 sm:px-6">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mx-auto">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Acceso Seguro</span>
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
              ¡Bienvenido! 👋
            </CardTitle>

            <CardDescription className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Accede a tu cuenta con Google y gestiona tus negocios de manera
              profesional
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6 pb-6">
            {/* UI improved: Enhanced Google Button */}
            <Button
              size="lg"
              onClick={handleGoogleSignIn}
              className="cursor-pointer w-full h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Continuar con Google
            </Button>

            {/* UI improved: Enhanced Benefits Section */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <div className="text-center space-y-3">
                <h4 className="font-semibold text-foreground text-xs sm:text-sm">
                  Acceso instantáneo a:
                </h4>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-primary flex-shrink-0" />
                    <span>Panel de control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    <span>Gestión segura</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    <span>Negocios</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                    <span>Productos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UI improved: Enhanced Footer */}
            <div className="text-center space-y-3 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plataforma segura con cifrado SSL. Al continuar, aceptas
                nuestros{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium focus:outline-none focus:underline transition-colors"
                  onClick={() => console.log("Terms clicked")}
                >
                  Términos de Servicio
                </button>{" "}
                y{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium focus:outline-none focus:underline transition-colors"
                  onClick={() => console.log("Privacy clicked")}
                >
                  Política de Privacidad
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* UI improved: Enhanced Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
