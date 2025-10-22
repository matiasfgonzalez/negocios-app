"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

/**
 * Componente que sincroniza automáticamente el usuario de Clerk con la base de datos
 * Se ejecuta cuando el usuario inicia sesión
 */
export default function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      // Solo sincronizar si el usuario está cargado y autenticado
      if (!isLoaded || !isSignedIn || !user) {
        return;
      }

      try {
        // 1. Asignar rol en Clerk publicMetadata si no lo tiene
        const metadataResponse = await fetch("/api/user/metadata", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (metadataResponse.ok) {
          const metadataData = await metadataResponse.json();
          console.log("Metadata actualizado:", metadataData);
        }

        // 2. Sincronizar usuario en la base de datos
        const response = await fetch("/api/me", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
          }),
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Usuario sincronizado correctamente:", userData);
        } else {
          console.error("Error al sincronizar usuario:", await response.text());
        }
      } catch (error) {
        console.error("Error al sincronizar usuario:", error);
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user]);

  // Este componente no renderiza nada visible
  return null;
}
