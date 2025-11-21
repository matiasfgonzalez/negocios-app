import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type tParams = Promise<{ id: string }>;

// GET - Obtener un producto específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { id: productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            img: true,
            whatsappPhone: true,
            aliasPago: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    console.log("App User Role:", appUser.role);

    if (appUser.role !== "ADMINISTRADOR" && appUser.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "No tienes permisos para editar productos" },
        { status: 403 }
      );
    }

    const { id: productId } = await params;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        business: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Si es propietario, verificar que el producto le pertenece
    if (appUser.role === "PROPIETARIO") {
      if (existingProduct.business.ownerId !== appUser.id) {
        return NextResponse.json(
          { error: "No tienes permiso para editar este producto" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      stock,
      available,
      images,
      businessId,
      categoryId,
    } = body;

    // Validar campos requeridos
    if (!name || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Si está cambiando de negocio, verificar permisos
    if (businessId && businessId !== existingProduct.businessId) {
      if (appUser.role === "PROPIETARIO") {
        const newBusiness = await prisma.business.findFirst({
          where: {
            id: businessId,
            ownerId: appUser.id,
          },
        });

        if (!newBusiness) {
          return NextResponse.json(
            {
              error: "No tienes permiso para asignar el producto a ese negocio",
            },
            { status: 403 }
          );
        }
      }
    }

    // Generar SKU automático solo si no existe
    let sku = existingProduct.sku;
    if (!sku) {
      const timestamp = Date.now().toString().slice(-6);
      const businessPrefix = existingProduct.businessId
        .slice(0, 4)
        .toUpperCase();
      sku = `PROD-${businessPrefix}-${timestamp}`;
    }

    // Actualizar el producto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description: description || null,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock),
        sku,
        available: available !== false,
        images: images !== undefined ? images : existingProduct.images,
        categoryId:
          categoryId !== undefined ? categoryId : existingProduct.categoryId,
        ...(businessId && { businessId }),
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (appUser.role !== "ADMINISTRADOR" && appUser.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar productos" },
        { status: 403 }
      );
    }

    const { id: productId } = await params;

    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        business: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Si es propietario, verificar que el producto le pertenece
    if (appUser.role === "PROPIETARIO") {
      if (existingProduct.business.ownerId !== appUser.id) {
        return NextResponse.json(
          { error: "No tienes permiso para eliminar este producto" },
          { status: 403 }
        );
      }
    }

    // Soft delete: marcar como no disponible
    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        available: false,
      },
    });

    return NextResponse.json({
      message: "Producto eliminado exitosamente",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}
