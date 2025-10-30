import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

type tParams = Promise<{ id: string }>;

// PATCH - Aprobar o rechazar una solicitud
export async function PATCH(req: Request, { params }: { params: tParams }) {
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

    // Solo los administradores pueden aprobar/rechazar solicitudes
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, reviewNote } = body;

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { error: "Acción inválida. Usar 'approve' o 'reject'" },
        { status: 400 }
      );
    }

    // Si es rechazo, la nota es obligatoria
    if (
      action === "reject" &&
      (!reviewNote || reviewNote.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "Debes proporcionar un motivo para el rechazo" },
        { status: 400 }
      );
    }

    // Verificar que la solicitud existe
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!roleRequest) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la solicitud está pendiente
    if (roleRequest.status !== "PENDIENTE") {
      return NextResponse.json(
        { error: "Esta solicitud ya fue procesada" },
        { status: 400 }
      );
    }

    // Actualizar la solicitud
    const updatedRequest = await prisma.roleRequest.update({
      where: { id },
      data: {
        status: action === "approve" ? "APROBADA" : "RECHAZADA",
        reviewedBy: appUser.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Si se aprueba, actualizar el rol del usuario
    if (action === "approve") {
      await prisma.appUser.update({
        where: { id: roleRequest.userId },
        data: {
          role: roleRequest.requestedRole,
        },
      });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error procesando solicitud:", error);
    return NextResponse.json(
      { error: "Error procesando solicitud" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar una solicitud (solo el usuario que la creó)
export async function DELETE(req: Request, { params }: { params: tParams }) {
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

    const { id } = await params;

    // Verificar que la solicitud existe
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
    });

    if (!roleRequest) {
      return NextResponse.json(
        { error: "Solicitud no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el dueño de la solicitud
    if (roleRequest.userId !== appUser.id) {
      return NextResponse.json(
        { error: "No tienes permisos para cancelar esta solicitud" },
        { status: 403 }
      );
    }

    // Solo se pueden cancelar solicitudes pendientes
    if (roleRequest.status !== "PENDIENTE") {
      return NextResponse.json(
        { error: "Solo puedes cancelar solicitudes pendientes" },
        { status: 400 }
      );
    }

    // Eliminar la solicitud
    await prisma.roleRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Solicitud cancelada exitosamente" });
  } catch (error) {
    console.error("Error cancelando solicitud:", error);
    return NextResponse.json(
      { error: "Error cancelando solicitud" },
      { status: 500 }
    );
  }
}
