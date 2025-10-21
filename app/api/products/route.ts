import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario existe y su rol
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
        { error: "No tienes permisos para crear productos" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      stock,
      sku,
      available,
      images,
      businessId,
      categoryId,
    } = body;

    // Validar campos requeridos
    if (!name || price === undefined || stock === undefined || !businessId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Si es propietario, verificar que el negocio le pertenece
    if (appUser.role === "PROPIETARIO") {
      const business = await prisma.business.findFirst({
        where: {
          id: businessId,
          ownerId: appUser.id,
        },
      });

      if (!business) {
        return NextResponse.json(
          { error: "No tienes permiso para agregar productos a este negocio" },
          { status: 403 }
        );
      }
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock),
        sku: sku || null,
        available: available !== false,
        images: images || null,
        businessId,
        categoryId: categoryId || null,
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

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
