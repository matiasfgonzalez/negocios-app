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
      <div className="min-h-screen bg-white dark:bg-gray-900 border-1 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 border-1 rounded-lg shadow-lg bg-white dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        {/* Header con branding mejorado */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
              <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-black dark:text-white" />
            </div>
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                NegociosApp
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Gestión de Negocios
              </div>
            </div>
          </Link>
        </div>

        {/* Tarjeta principal mejorada */}
        <Card className="border-2 border-gray-100 dark:border-gray-700 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-4 px-4 sm:px-6">
            <div className="inline-flex items-center space-x-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mx-auto">
              <CheckCircle className="w-4 h-4" />
              <span>Acceso Seguro</span>
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              ¡Bienvenido! 👋
            </CardTitle>

            <CardDescription className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              Accede a tu cuenta con Google y gestiona tus negocios de manera
              profesional
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-4 sm:px-6 pb-6">
            {/* Botón de Google mejorado */}
            <Button
              size="lg"
              onClick={handleGoogleSignIn}
              className="cursor-pointer w-full h-12 sm:h-14 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
            >
              <Shield className="w-5 h-5 mr-3" />
              Continuar con Google
            </Button>

            {/* Beneficios rápidos */}
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700">
              <div className="text-center space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Acceso instantáneo a:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3 text-primary-500 flex-shrink-0" />
                    <span>Panel de control</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-secondary-500 flex-shrink-0" />
                    <span>Gestión segura</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-primary-500 flex-shrink-0" />
                    <span>Negocios</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-secondary-500 flex-shrink-0" />
                    <span>Productos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer profesional */}
            <div className="text-center space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Plataforma segura con cifrado SSL. Al continuar, aceptas
                nuestros{" "}
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium focus:outline-none focus:underline"
                  onClick={() => console.log("Terms clicked")}
                >
                  Términos de Servicio
                </button>{" "}
                y{" "}
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium focus:outline-none focus:underline"
                  onClick={() => console.log("Privacy clicked")}
                >
                  Política de Privacidad
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Volver al inicio */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
