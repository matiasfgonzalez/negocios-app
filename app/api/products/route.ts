import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET - Obtener lista de productos con filtros
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const businessId = url.searchParams.get("businessId");
    const categoryId = url.searchParams.get("categoryId");
    const available = url.searchParams.get("available");
    const search = url.searchParams.get("search");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const inStock = url.searchParams.get("inStock");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const order = url.searchParams.get("order") || "desc";
    const limit = url.searchParams.get("limit");
    const forManagement = url.searchParams.get("forManagement") === "true";

    // Construir filtros
    const where: Prisma.ProductWhereInput = {};

    // Filtro por negocio
    if (businessId) {
      where.businessId = businessId;
    }

    // Filtro por categoría
    if (categoryId) {
      where.categoryId = categoryId === "null" ? null : categoryId;
    }

    // Filtro por disponibilidad
    if (available !== null) {
      where.available = available === "true";
    }

    // Filtro por búsqueda (nombre o descripción)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro por rango de precio
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = Number.parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = Number.parseFloat(maxPrice);
      }
    }

    // Filtro por stock disponible
    if (inStock === "true") {
      where.stock = { gt: 0 };
    }

    // Si es para gestión (dashboard), validar permisos
    if (forManagement) {
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

      // Si es PROPIETARIO, solo puede ver productos de sus negocios
      if (appUser.role === "PROPIETARIO") {
        const ownedBusinesses = await prisma.business.findMany({
          where: { ownerId: appUser.id },
          select: { id: true },
        });

        const businessIds = ownedBusinesses.map((b) => b.id);

        if (businessIds.length === 0) {
          return NextResponse.json([]);
        }

        // Si ya hay un filtro de businessId, validar que le pertenezca
        if (businessId && !businessIds.includes(businessId)) {
          return NextResponse.json(
            { error: "No tienes acceso a los productos de este negocio" },
            { status: 403 }
          );
        }

        // Si no hay filtro de businessId, filtrar por todos sus negocios
        if (!businessId) {
          where.businessId = { in: businessIds };
        }
      }
      // ADMINISTRADOR y CLIENTE pueden ver todos los productos
    }

    // Configurar ordenamiento
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === "price") {
      orderBy.price = order as "asc" | "desc";
    } else if (sortBy === "name") {
      orderBy.name = order as "asc" | "desc";
    } else if (sortBy === "stock") {
      orderBy.stock = order as "asc" | "desc";
    } else {
      orderBy.createdAt = order as "asc" | "desc";
    }

    // Consultar productos
    const products = await prisma.product.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            img: true,
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
      orderBy,
      take: limit ? Number.parseInt(limit) : undefined,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock),
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
