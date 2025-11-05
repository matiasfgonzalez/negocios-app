import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener pagos
export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const ownerId = searchParams.get("ownerId");

    // Si es administrador, puede ver todos los pagos
    if (appUser.role === "ADMINISTRADOR") {
      const where: {
        status?: "PENDING" | "APPROVED" | "REJECTED";
        ownerId?: string;
      } = {};

      if (
        status &&
        (status === "PENDING" || status === "APPROVED" || status === "REJECTED")
      ) {
        where.status = status;
      }

      if (ownerId) {
        where.ownerId = ownerId;
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(payments);
    }

    // Si es propietario, solo puede ver sus propios pagos
    if (appUser.role === "PROPIETARIO") {
      const payments = await prisma.payment.findMany({
        where: {
          ownerId: appUser.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(payments);
    }

    return NextResponse.json(
      { error: "No tienes permisos para ver pagos" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Error obteniendo pagos:", error);
    return NextResponse.json(
      { error: "Error obteniendo pagos" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo pago
export async function POST(req: Request) {
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

    // Solo los propietarios pueden crear pagos
    if (appUser.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "Solo los propietarios pueden registrar pagos" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { amount, periodMonth, proofUrl, proofPublicId, ownerNote } = body;

    if (!amount || !periodMonth) {
      return NextResponse.json(
        { error: "El monto y el período son requeridos" },
        { status: 400 }
      );
    }

    if (!proofUrl || !proofPublicId) {
      return NextResponse.json(
        { error: "Debes cargar el comprobante de pago" },
        { status: 400 }
      );
    }

    // Verificar que no exista ya un pago para ese período
    const existingPayment = await prisma.payment.findFirst({
      where: {
        ownerId: appUser.id,
        periodMonth,
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Ya existe un pago registrado para este período" },
        { status: 400 }
      );
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        ownerId: appUser.id,
        amount: parseFloat(amount),
        periodMonth,
        proofUrl,
        proofPublicId,
        ownerNote: ownerNote || null,
        status: "PENDING",
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creando pago:", error);
    return NextResponse.json({ error: "Error creando pago" }, { status: 500 });
  }
}
