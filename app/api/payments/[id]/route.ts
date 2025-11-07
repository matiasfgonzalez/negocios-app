import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// PATCH - Aprobar o rechazar un pago (solo admin)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo los administradores pueden aprobar/rechazar pagos
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { action, adminNote } = body;

    if (!action || (action !== "approve" && action !== "reject")) {
      return NextResponse.json(
        { error: "Acción inválida. Usar 'approve' o 'reject'" },
        { status: 400 }
      );
    }

    // Si es rechazo, la nota es obligatoria
    if (action === "reject" && (!adminNote || adminNote.trim().length === 0)) {
      return NextResponse.json(
        { error: "Debes proporcionar un motivo para el rechazo" },
        { status: 400 }
      );
    }

    // Verificar que el pago existe
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el pago está pendiente
    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Este pago ya fue procesado" },
        { status: 400 }
      );
    }

    // Actualizar el pago
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        reviewedBy: appUser.id,
        reviewedAt: new Date(),
        adminNote: adminNote?.trim() || null,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // Si se aprueba el pago, actualizar la suscripción del usuario
    if (action === "approve") {
      // Calcular la fecha hasta la cual está pago
      const [year, month] = payment.periodMonth.split("-");
      const paidUntil = new Date(parseInt(year), parseInt(month), 0); // Último día del mes

      await prisma.appUser.update({
        where: { id: payment.ownerId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionPaidUntil: paidUntil,
        },
      });
    }

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error("Error procesando pago:", error);
    return NextResponse.json(
      { error: "Error procesando pago" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un pago (solo si está pendiente)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

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

    // Verificar que el pago existe
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el dueño del pago o es administrador
    if (payment.ownerId !== appUser.id && appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar este pago" },
        { status: 403 }
      );
    }

    // Solo se pueden eliminar pagos pendientes
    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Solo puedes eliminar pagos pendientes" },
        { status: 400 }
      );
    }

    // Eliminar el pago
    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Pago eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando pago:", error);
    return NextResponse.json(
      { error: "Error eliminando pago" },
      { status: 500 }
    );
  }
}
