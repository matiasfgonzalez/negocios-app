import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const rubro = url.searchParams.get("rubro") ?? undefined;
  const forManagement = url.searchParams.get("forManagement") === "true";

  const where: Prisma.BusinessWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (rubro) where.rubro = { equals: rubro };

  // Si es para gestión (dashboard), filtrar por rol
  if (forManagement) {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener usuario de la base de datos para verificar rol
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR y PROPIETARIO pueden acceder
    if (appUser.role !== "ADMINISTRADOR" && appUser.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "No tienes permisos para gestionar negocios" },
        { status: 403 }
      );
    }

    // Si es PROPIETARIO, filtrar por sus negocios
    if (appUser.role === "PROPIETARIO") {
      where.ownerId = appUser.id;
    }

    // Para gestión, incluir owner y _count
    const businesses = await prisma.business.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(businesses);
  }

  // Para listado público, incluir solo productos
  const businesses = await prisma.business.findMany({
    where,
    include: {
      products: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(businesses);
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();

    // DEBUG: Log del body recibido
    console.log(
      "📦 POST /api/businesses - Body recibido:",
      JSON.stringify(body, null, 2)
    );

    const {
      name,
      rubro,
      description,
      img,
      whatsappPhone,
      aliasPago,
      hasShipping,
      shippingCost,
      maxShippingDistance,
      shippingRanges,
      addressText,
      lat,
      lng,
      ownerId,
      status,
      closedReason,
      schedule,
      specialClosedDays,
      acceptOrdersOutsideHours,
      preparationTime,
    } = body;

    // DEBUG: Log de campos de envío
    console.log("🚚 Campos de envío:", {
      hasShipping,
      maxShippingDistance,
      shippingRanges: JSON.stringify(shippingRanges),
      shippingCost,
    });

    // Validar campos requeridos
    if (!name || !rubro || !ownerId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (name, rubro, ownerId)" },
        { status: 400 }
      );
    }

    // Obtener usuario de la base de datos para verificar permisos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR puede crear negocios para otros usuarios
    if (appUser.role !== "ADMINISTRADOR" && ownerId !== appUser.id) {
      return NextResponse.json(
        { error: "No tienes permisos para crear negocios para otros usuarios" },
        { status: 403 }
      );
    }

    // Generar slug único
    const baseSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-z0-9]+/g, "-") // Reemplazar caracteres especiales con -
      .replace(/^-+/g, "")
      .replace(/-+$/g, ""); // Remover guiones al inicio y final

    let slug = baseSlug;
    let counter = 1;

    // Verificar si el slug ya existe
    while (await prisma.business.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Crear el negocio
    const business = await prisma.business.create({
      data: {
        name,
        slug,
        rubro,
        description: description || null,
        img: img || null,
        whatsappPhone: whatsappPhone || null,
        aliasPago: aliasPago || null,
        hasShipping: hasShipping || false,
        shippingCost: hasShipping && shippingCost ? shippingCost : 0,
        maxShippingDistance:
          hasShipping && maxShippingDistance ? maxShippingDistance : null,
        shippingRanges: hasShipping && shippingRanges ? shippingRanges : null,
        addressText: addressText || null,
        lat: lat || null,
        lng: lng || null,
        status: status || "ABIERTO",
        closedReason: closedReason || null,
        schedule: schedule || null,
        specialClosedDays: specialClosedDays || null,
        acceptOrdersOutsideHours: acceptOrdersOutsideHours || false,
        preparationTime: preparationTime || null,
        ownerId,
      },
      include: {
        owner: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    console.error("Error al crear negocio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
