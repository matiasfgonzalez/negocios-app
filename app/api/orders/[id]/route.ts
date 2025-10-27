import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// DELETE - Eliminar una orden
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que la orden existe
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
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

    // Verificar que el estado sea REGISTRADA o PENDIENTE_PAGO
    if (
      existingOrder.state !== "REGISTRADA" &&
      existingOrder.state !== "PENDIENTE_PAGO"
    ) {
      return NextResponse.json(
        {
          error:
            "Solo se pueden eliminar pedidos en estado REGISTRADA o PENDIENTE_PAGO",
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

    // Solo el cliente que creó la orden o un administrador pueden eliminarla
    if (
      appUser.role !== "ADMINISTRADOR" &&
      existingOrder.customerId !== appUser.id
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta orden" },
        { status: 403 }
      );
    }

    // Eliminar la orden en una transacción (restaurar stock)
    await prisma.$transaction(async (tx) => {
      // Restaurar el stock de los productos
      for (const item of existingOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Eliminar los eventos de la orden
      await tx.orderEvent.deleteMany({
        where: { orderId: id },
      });

      // Eliminar los items de la orden
      await tx.orderItem.deleteMany({
        where: { orderId: id },
      });

      // Eliminar la orden
      await tx.order.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Orden eliminada" });
  } catch (error) {
    console.error("Error al eliminar orden:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
