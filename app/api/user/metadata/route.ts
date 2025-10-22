// app/api/user/metadata/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el cliente de Clerk
    const client = await clerkClient();

    // Obtener el usuario actual
    const user = await client.users.getUser(userId);

    // Verificar si ya tiene rol en publicMetadata
    const currentRole = user.publicMetadata?.role;

    // Si no tiene rol, asignar CLIENTE por defecto
    if (!currentRole) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          role: "CLIENTE",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Rol CLIENTE asignado en Clerk",
        role: "CLIENTE",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Usuario ya tiene rol asignado",
      role: currentRole,
    });
  } catch (error) {
    console.error("Error al actualizar metadata:", error);
    return NextResponse.json(
      { error: "Error al actualizar metadata del usuario" },
      { status: 500 }
    );
  }
}
