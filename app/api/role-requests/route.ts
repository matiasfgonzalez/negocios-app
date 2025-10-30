import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener solicitudes de rol
export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener el usuario de la base de datos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Si es administrador, puede ver todas las solicitudes
    if (appUser.role === "ADMINISTRADOR") {
      const where: {
        status?: "PENDIENTE" | "APROBADA" | "RECHAZADA";
      } = {};

      if (status && (status === "PENDIENTE" || status === "APROBADA" || status === "RECHAZADA")) {
        where.status = status;
      }

      const requests = await prisma.roleRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              name: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(requests);
    }

    // Si es cliente, solo puede ver sus propias solicitudes
    const requests = await prisma.roleRequest.findMany({
      where: {
        userId: appUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error);
    return NextResponse.json(
      { error: "Error obteniendo solicitudes" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva solicitud de rol
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener el usuario de la base de datos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo los clientes pueden solicitar ser propietarios
    if (appUser.role !== "CLIENTE") {
      return NextResponse.json(
        { error: "Solo los clientes pueden solicitar ser propietarios" },
        { status: 403 }
      );
    }

    // Verificar si ya tiene una solicitud pendiente
    const pendingRequest = await prisma.roleRequest.findFirst({
      where: {
        userId: appUser.id,
        status: "PENDIENTE",
      },
    });

    if (pendingRequest) {
      return NextResponse.json(
        { error: "Ya tienes una solicitud pendiente" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { description } = body;

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: "La descripción es requerida" },
        { status: 400 }
      );
    }

    if (description.trim().length < 20) {
      return NextResponse.json(
        { error: "La descripción debe tener al menos 20 caracteres" },
        { status: 400 }
      );
    }

    // Crear la solicitud
    const roleRequest = await prisma.roleRequest.create({
      data: {
        userId: appUser.id,
        requestedRole: "PROPIETARIO",
        description: description.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(roleRequest, { status: 201 });
  } catch (error) {
    console.error("Error creando solicitud:", error);
    return NextResponse.json(
      { error: "Error creando solicitud" },
      { status: 500 }
    );
  }
}
