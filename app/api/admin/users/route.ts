import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Role, Prisma } from "@prisma/client";

// GET /api/admin/users - Obtener lista de usuarios (solo ADMINISTRADOR)
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario existe y obtener su rol
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR puede acceder
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a este recurso" },
        { status: 403 }
      );
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const isActive = searchParams.get("isActive");
    const limit = searchParams.get("limit");

    // Construir filtros
    const where: Prisma.AppUserWhereInput = {};

    if (role) {
      where.role = role as Role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    // Obtener usuarios
    const users = await prisma.appUser.findMany({
      where,
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
        city: true,
        province: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            businesses: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? Number.parseInt(limit) : undefined,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Crear un nuevo usuario manualmente (solo ADMINISTRADOR)
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario existe y obtener su rol
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR puede crear usuarios
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para crear usuarios" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      email,
      name,
      lastName,
      phone,
      role,
      address,
      city,
      province,
      postalCode,
      documentId,
      isActive,
      adminNotes,
    } = body;

    // Validaciones
    if (!email) {
      return NextResponse.json(
        { error: "El email es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el email no esté en uso
    const existingUser = await prisma.appUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    // Crear usuario
    const fullName =
      name && lastName ? `${name} ${lastName}` : name || lastName || null;

    const newUser = await prisma.appUser.create({
      data: {
        email,
        name: name || null,
        lastName: lastName || null,
        fullName,
        phone: phone || null,
        role: role || "CLIENTE",
        address: address || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
        documentId: documentId || null,
        isActive: isActive !== undefined ? isActive : true,
        adminNotes: adminNotes || null,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
