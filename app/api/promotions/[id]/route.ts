import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/promotions/[id] - Obtener una promoción específica
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: "Promoción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Error al obtener promoción:", error);
    return NextResponse.json(
      { error: "Error al obtener promoción" },
      { status: 500 }
    );
  }
}

// PUT /api/promotions/[id] - Actualizar una promoción
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    // Verificar rol del usuario
    const user = await prisma.appUser.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR y PROPIETARIO pueden actualizar promociones
    if (user.role !== "ADMINISTRADOR" && user.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "No tiene permisos para actualizar promociones" },
        { status: 403 }
      );
    }

    // Verificar que la promoción existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
        },
      },
    });

    if (!existingPromotion) {
      return NextResponse.json(
        { error: "Promoción no encontrada" },
        { status: 404 }
      );
    }

    // Si es PROPIETARIO, verificar que sea dueño del negocio
    if (
      user.role === "PROPIETARIO" &&
      existingPromotion.business.ownerId !== user.id
    ) {
      return NextResponse.json(
        { error: "No tiene permisos para actualizar esta promoción" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      image,
      isActive,
      startDate,
      endDate,
      stock,
      products,
    } = body;

    // Si se actualizan los productos, verificar que pertenezcan al negocio
    if (products && products.length > 0) {
      const productIds = products.map(
        (p: { productId: string }) => p.productId
      );
      const productsFromDb = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        select: { id: true, businessId: true },
      });

      if (productsFromDb.length !== productIds.length) {
        return NextResponse.json(
          { error: "Algunos productos no existen" },
          { status: 400 }
        );
      }

      const allProductsFromSameBusiness = productsFromDb.every(
        (p: { businessId: string }) =>
          p.businessId === existingPromotion.businessId
      );

      if (!allProductsFromSameBusiness) {
        return NextResponse.json(
          { error: "Todos los productos deben pertenecer al mismo negocio" },
          { status: 400 }
        );
      }

      // Eliminar productos existentes y crear los nuevos
      await prisma.promotionProduct.deleteMany({
        where: { promotionId: id },
      });
    }

    // Actualizar la promoción
    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingPromotion.name,
        description:
          description !== undefined
            ? description
            : existingPromotion.description,
        price: price !== undefined ? price : existingPromotion.price,
        image: image !== undefined ? image : existingPromotion.image,
        isActive:
          isActive !== undefined ? isActive : existingPromotion.isActive,
        startDate:
          startDate !== undefined
            ? startDate
              ? new Date(startDate)
              : null
            : existingPromotion.startDate,
        endDate:
          endDate !== undefined
            ? endDate
              ? new Date(endDate)
              : null
            : existingPromotion.endDate,
        stock: stock !== undefined ? stock : existingPromotion.stock,
        ...(products &&
          products.length > 0 && {
            products: {
              create: products.map(
                (p: { productId: string; quantity: number }) => ({
                  productId: p.productId,
                  quantity: p.quantity || 1,
                })
              ),
            },
          }),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error("Error al actualizar promoción:", error);
    return NextResponse.json(
      { error: "Error al actualizar promoción" },
      { status: 500 }
    );
  }
}

// DELETE /api/promotions/[id] - Eliminar una promoción
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    // Verificar rol del usuario
    const user = await prisma.appUser.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR y PROPIETARIO pueden eliminar promociones
    if (user.role !== "ADMINISTRADOR" && user.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "No tiene permisos para eliminar promociones" },
        { status: 403 }
      );
    }

    // Verificar que la promoción existe
    const existingPromotion = await prisma.promotion.findUnique({
      where: { id },
      include: {
        business: {
          select: { ownerId: true },
        },
      },
    });

    if (!existingPromotion) {
      return NextResponse.json(
        { error: "Promoción no encontrada" },
        { status: 404 }
      );
    }

    // Si es PROPIETARIO, verificar que sea dueño del negocio
    if (
      user.role === "PROPIETARIO" &&
      existingPromotion.business.ownerId !== user.id
    ) {
      return NextResponse.json(
        { error: "No tiene permisos para eliminar esta promoción" },
        { status: 403 }
      );
    }

    // Eliminar la promoción (los productos relacionados se eliminan en cascada)
    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Promoción eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar promoción:", error);
    return NextResponse.json(
      { error: "Error al eliminar promoción" },
      { status: 500 }
    );
  }
}
