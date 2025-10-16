import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

// GET - Obtener un negocio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        owner: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error al obtener negocio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un negocio
export async function PUT(
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
    const {
      name,
      rubro,
      description,
      img,
      whatsappPhone,
      aliasPago,
      addressText,
      lat,
      lng,
    } = body;

    // Verificar que el negocio existe
    const existingBusiness = await prisma.business.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!existingBusiness) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
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

    // Solo el propietario o un administrador pueden editar
    if (role !== "ADMINISTRADOR" && existingBusiness.ownerId !== appUser.id) {
      return NextResponse.json(
        { error: "No tienes permisos para editar este negocio" },
        { status: 403 }
      );
    }

    // Generar nuevo slug si el nombre cambió
    let slug = existingBusiness.slug;
    if (name && name !== existingBusiness.name) {
      const baseSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replaceAll(/[\u0300-\u036f]/g, "")
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/^-+/g, "")
        .replaceAll(/-+$/g, "");

      slug = baseSlug;
      let counter = 1;

      // Verificar si el slug ya existe (excepto el actual)
      while (true) {
        const existingSlug = await prisma.business.findUnique({
          where: { slug },
        });
        if (!existingSlug || existingSlug.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Actualizar el negocio
    const business = await prisma.business.update({
      where: { id },
      data: {
        name: name || existingBusiness.name,
        slug,
        rubro: rubro || existingBusiness.rubro,
        description:
          description === undefined
            ? existingBusiness.description
            : description,
        img: img === undefined ? existingBusiness.img : img,
        whatsappPhone:
          whatsappPhone === undefined
            ? existingBusiness.whatsappPhone
            : whatsappPhone,
        aliasPago:
          aliasPago === undefined ? existingBusiness.aliasPago : aliasPago,
        addressText:
          addressText === undefined
            ? existingBusiness.addressText
            : addressText,
        lat: lat === undefined ? existingBusiness.lat : lat,
        lng: lng === undefined ? existingBusiness.lng : lng,
      },
      include: {
        owner: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error al actualizar negocio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un negocio
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

    // Verificar que el negocio existe
    const existingBusiness = await prisma.business.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true, orders: true },
        },
      },
    });

    if (!existingBusiness) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
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

    // Solo el propietario o un administrador pueden eliminar
    if (role !== "ADMINISTRADOR" && existingBusiness.ownerId !== appUser.id) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar este negocio" },
        { status: 403 }
      );
    }

    // Verificar si tiene productos u órdenes asociadas
    if (
      existingBusiness._count.products > 0 ||
      existingBusiness._count.orders > 0
    ) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el negocio porque tiene productos u órdenes asociadas",
          details: {
            products: existingBusiness._count.products,
            orders: existingBusiness._count.orders,
          },
        },
        { status: 400 }
      );
    }

    // Eliminar el negocio
    await prisma.business.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Negocio eliminado exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar negocio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
