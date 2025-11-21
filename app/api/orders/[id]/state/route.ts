import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { OrderState } from "@prisma/client";

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
    const { state, cancellationReason } = body;

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

    // Si el estado es CANCELADA, validar que se proporcione un motivo
    if (state === "CANCELADA") {
      if (!cancellationReason || cancellationReason.trim().length < 10) {
        return NextResponse.json(
          {
            error:
              "Debes proporcionar un motivo de cancelación de al menos 10 caracteres",
          },
          { status: 400 }
        );
      }
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

    // Verificar que el pedido no esté en un estado final
    if (
      existingOrder.state === "ENTREGADA" ||
      existingOrder.state === "CANCELADA"
    ) {
      return NextResponse.json(
        {
          error: `No se puede modificar un pedido en estado ${existingOrder.state}. Este es un estado final.`,
        },
        { status: 400 }
      );
    }

    // Obtener usuario de la base de datos para verificar permisos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar permisos según el estado que se quiere cambiar
    const isOwner = existingOrder.business.ownerId === appUser.id;
    const isAdmin = appUser.role === "ADMINISTRADOR";
    const isCustomer = existingOrder.customerId === appUser.id;

    // Si es el cliente, solo puede cancelar su pedido en estados REGISTRADA o PENDIENTE_PAGO
    if (isCustomer && !isOwner && !isAdmin) {
      if (state !== "CANCELADA") {
        return NextResponse.json(
          { error: "Los clientes solo pueden cancelar sus pedidos" },
          { status: 403 }
        );
      }
      if (
        existingOrder.state !== "REGISTRADA" &&
        existingOrder.state !== "PENDIENTE_PAGO"
      ) {
        return NextResponse.json(
          {
            error:
              "Solo puedes cancelar pedidos en estado REGISTRADA o PENDIENTE_PAGO",
          },
          { status: 403 }
        );
      }
    }
    // Si no es el propietario del negocio, ni administrador, ni el cliente
    else if (!isAdmin && !isOwner && !isCustomer) {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar esta orden" },
        { status: 403 }
      );
    }

    // Actualizar el estado de la orden
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          state: state as OrderState,
          ...(state === "CANCELADA" && cancellationReason
            ? { cancellationReason: cancellationReason.trim() }
            : {}),
        },
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
      const eventNote =
        state === "CANCELADA"
          ? `Pedido cancelado. Motivo: ${cancellationReason}`
          : `Estado cambiado de ${existingOrder.state} a ${state}`;

      await tx.orderEvent.create({
        data: {
          orderId: id,
          actorId: appUser.id,
          type: state === "CANCELADA" ? "CANCELACION" : "CAMBIO_ESTADO",
          note: eventNote,
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
