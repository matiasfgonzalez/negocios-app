import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// PATCH - Actualizar el estado de una orden
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { state } = body;

    // Validar que el estado sea válido
    const validStates = [
      "REGISTRADA",
      "PENDIENTE_PAGO",
      "PAGADA",
      "PREPARANDO",
      "ENVIADA",
      "ENTREGADA",
      "CANCELADA",
    ];

    if (!state || !validStates.includes(state)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    // Verificar que la orden existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        business: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar permisos
    const role = user.publicMetadata.role as string;
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo el propietario del negocio o un administrador pueden cambiar el estado
    if (
      role !== "ADMINISTRADOR" &&
      existingOrder.business.ownerId !== appUser.id
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar esta orden" },
        { status: 403 }
      );
    }

    // Actualizar el estado de la orden
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { state },
        include: {
          business: true,
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Crear evento de cambio de estado
      await tx.orderEvent.create({
        data: {
          orderId: id,
          actorId: appUser.id,
          type: "CAMBIO_ESTADO",
          note: `Estado cambiado de ${existingOrder.state} a ${state}`,
        },
      });

      return order;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error al actualizar estado de orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
