"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SSOCallback() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncAndRedirect = async () => {
      // Esperar a que Clerk cargue el usuario
      if (!isUserLoaded) return;

      // Si no hay usuario después de cargar, redirigir a sign-in
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        // Sincronizar usuario con la base de datos
        const response = await fetch("/api/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();

          // Si el email ya está asociado a otra cuenta, mostrar error
          if (response.status === 409) {
            setError(
              errorData.message || "Este email ya está asociado a otra cuenta."
            );
            return;
          }

          console.error("Failed to sync user with database:", errorData);
        }

        // Obtener información del usuario para redirección según rol
        const meResponse = await fetch("/api/me");
        if (meResponse.ok) {
          const appUser = await meResponse.json();

          // Redirigir según el rol
          if (
            appUser.role === "ADMINISTRADOR" ||
            appUser.role === "PROPIETARIO"
          ) {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        } else {
          // Si no se puede obtener el usuario, ir a home
          router.push("/");
        }
      } catch (err) {
        console.error("Error syncing user:", err);
        // En caso de error de red, intentar redirigir a home
        router.push("/");
      }
    };

    syncAndRedirect();
  }, [isUserLoaded, user, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Error de autenticación
          </h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground font-medium">
          Completando inicio de sesión...
        </p>
      </div>
    </div>
  );
}
