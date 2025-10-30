import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type tParams = Promise<{ userId: string }>;

// POST - Revocar rol de propietario
export async function POST(req: Request, { params }: { params: tParams }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener el usuario de la base de datos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo los administradores pueden revocar roles
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { userId } = await params;
    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Debes proporcionar un motivo para revocar el rol" },
        { status: 400 }
      );
    }

    // Verificar que el usuario a revocar existe
    const targetUser = await prisma.appUser.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es propietario
    if (targetUser.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "El usuario no es propietario" },
        { status: 400 }
      );
    }

    // Crear la nota de revocación
    const revokeNote = `Rol revocado por ${
      appUser.fullName || appUser.email
    } el ${new Date().toLocaleString("es-AR")}. Motivo: ${reason.trim()}`;
    const previousNotes = targetUser.adminNotes
      ? `\n\n--- Notas previas ---\n${targetUser.adminNotes}`
      : "";
    const combinedNotes = revokeNote + previousNotes;

    // Actualizar el rol del usuario a CLIENTE
    const updatedUser = await prisma.appUser.update({
      where: { id: userId },
      data: {
        role: "CLIENTE",
        adminNotes: combinedNotes,
      },
    });

    return NextResponse.json({
      message: "Rol revocado exitosamente",
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error revocando rol:", error);
    return NextResponse.json({ error: "Error revocando rol" }, { status: 500 });
  }
}
