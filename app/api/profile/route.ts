import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: Obtener perfil del usuario
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        lastName: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        address: true,
        lat: true,
        lng: true,
        city: true,
        province: true,
        postalCode: true,
        documentId: true,
        birthDate: true,
        isActive: true,
        lastLogin: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Formatear birthDate para evitar problemas de zona horaria
    const formattedUser = {
      ...appUser,
      birthDate: appUser.birthDate
        ? appUser.birthDate.toISOString().split("T")[0]
        : null,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json(
      { error: "Error al obtener el perfil" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar perfil del usuario
export async function PUT(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Construir objeto de actualización solo con campos presentes
    const updateData: Prisma.AppUserUpdateInput = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.province !== undefined) updateData.province = body.province;
    if (body.postalCode !== undefined) updateData.postalCode = body.postalCode;
    if (body.documentId !== undefined) updateData.documentId = body.documentId;
    if (body.preferences !== undefined)
      updateData.preferences = body.preferences;

    // Manejar coordenadas
    if (body.lat !== undefined) {
      updateData.lat = body.lat ? Number.parseFloat(body.lat) : null;
    }
    if (body.lng !== undefined) {
      updateData.lng = body.lng ? Number.parseFloat(body.lng) : null;
    }

    // Manejar fecha de nacimiento
    if (body.birthDate !== undefined) {
      if (body.birthDate) {
        // Parsear la fecha en zona horaria local de Argentina (UTC-3)
        // Usar hora 00:00:00 para representar solo la fecha
        const [year, month, day] = body.birthDate.split("-").map(Number);
        updateData.birthDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      } else {
        updateData.birthDate = null;
      }
    }

    // Generar fullName si se actualizan name o lastName
    if (body.name !== undefined || body.lastName !== undefined) {
      const firstName = body.name === undefined ? appUser.name : body.name;
      const lastName =
        body.lastName === undefined ? appUser.lastName : body.lastName;
      updateData.fullName =
        `${firstName || ""} ${lastName || ""}`.trim() || null;
    }

    const updatedUser = await prisma.appUser.update({
      where: { id: appUser.id },
      data: updateData,
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        lastName: true,
        fullName: true,
        phone: true,
        avatar: true,
        role: true,
        address: true,
        lat: true,
        lng: true,
        city: true,
        province: true,
        postalCode: true,
        documentId: true,
        birthDate: true,
        isActive: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Formatear birthDate para evitar problemas de zona horaria
    const formattedUser = {
      ...updatedUser,
      birthDate: updatedUser.birthDate
        ? updatedUser.birthDate.toISOString().split("T")[0]
        : null,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar el perfil",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
