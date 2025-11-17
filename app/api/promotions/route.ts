import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/promotions - Obtener todas las promociones (filtrado opcional por negocio)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    const where = businessId ? { businessId } : {};

    const promotions = await prisma.promotion.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error al obtener promociones:", error);
    return NextResponse.json(
      { error: "Error al obtener promociones" },
      { status: 500 }
    );
  }
}

// POST /api/promotions - Crear una nueva promoción
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

    // Solo ADMINISTRADOR y PROPIETARIO pueden crear promociones
    if (user.role !== "ADMINISTRADOR" && user.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "No tiene permisos para crear promociones" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      businessId,
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

    // Validar campos requeridos
    if (
      !businessId ||
      !name ||
      price === undefined ||
      !products ||
      products.length === 0
    ) {
      return NextResponse.json(
        { error: "Campos requeridos: businessId, name, price, products" },
        { status: 400 }
      );
    }

    // Verificar que el negocio existe
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    // Si es PROPIETARIO, verificar que sea dueño del negocio
    if (user.role === "PROPIETARIO" && business.ownerId !== user.id) {
      return NextResponse.json(
        { error: "No tiene permisos para crear promociones en este negocio" },
        { status: 403 }
      );
    }

    // Verificar que todos los productos pertenecen al mismo negocio
    const productIds = products.map((p: { productId: string }) => p.productId);
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
      (p: { businessId: string }) => p.businessId === businessId
    );

    if (!allProductsFromSameBusiness) {
      return NextResponse.json(
        { error: "Todos los productos deben pertenecer al mismo negocio" },
        { status: 400 }
      );
    }

    // Crear la promoción con sus productos
    const promotion = await prisma.promotion.create({
      data: {
        businessId,
        name,
        description: description || null,
        price,
        image: image || null,
        isActive: isActive ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        stock: stock ?? null,
        products: {
          create: products.map(
            (p: { productId: string; quantity: number }) => ({
              productId: p.productId,
              quantity: p.quantity || 1,
            })
          ),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error) {
    console.error("Error al crear promoción:", error);
    return NextResponse.json(
      { error: "Error al crear promoción" },
      { status: 500 }
    );
  }
}
