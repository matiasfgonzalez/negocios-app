import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener la configuración de pagos
export async function GET() {
  try {
    // Buscar o crear la configuración por defecto
    let config = await prisma.paymentConfig.findUnique({
      where: { id: "payment_config" },
    });

    // Si no existe, crear con valores por defecto
    if (!config) {
      config = await prisma.paymentConfig.create({
        data: {
          id: "payment_config",
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error al obtener configuración de pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener la configuración de pagos" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar la configuración de pagos (solo administradores)
export async function PUT(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario sea administrador
    const user = await prisma.appUser.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user?.role || user.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        {
          error:
            "No autorizado. Solo administradores pueden modificar la configuración.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      monthlyFee,
      bankName,
      bankAlias,
      bankCbu,
      accountHolder,
      accountType,
      supportEmail,
      supportPhone,
    } = body;

    // Validaciones
    if (
      monthlyFee !== undefined &&
      (typeof monthlyFee !== "number" || monthlyFee <= 0)
    ) {
      return NextResponse.json(
        { error: "El monto mensual debe ser un número positivo" },
        { status: 400 }
      );
    }

    if (bankAlias !== undefined && !bankAlias.trim()) {
      return NextResponse.json(
        { error: "El alias bancario es requerido" },
        { status: 400 }
      );
    }

    if (bankCbu !== undefined && !bankCbu.trim()) {
      return NextResponse.json(
        { error: "El CBU es requerido" },
        { status: 400 }
      );
    }

    // Actualizar o crear configuración
    const config = await prisma.paymentConfig.upsert({
      where: { id: "payment_config" },
      update: {
        ...(monthlyFee !== undefined && { monthlyFee }),
        ...(bankName !== undefined && { bankName: bankName.trim() }),
        ...(bankAlias !== undefined && { bankAlias: bankAlias.trim() }),
        ...(bankCbu !== undefined && { bankCbu: bankCbu.trim() }),
        ...(accountHolder !== undefined && {
          accountHolder: accountHolder.trim(),
        }),
        ...(accountType !== undefined && {
          accountType: accountType?.trim() || null,
        }),
        ...(supportEmail !== undefined && {
          supportEmail: supportEmail.trim(),
        }),
        ...(supportPhone !== undefined && {
          supportPhone: supportPhone.trim(),
        }),
      },
      create: {
        id: "payment_config",
        ...(monthlyFee !== undefined && { monthlyFee }),
        ...(bankName !== undefined && { bankName: bankName.trim() }),
        ...(bankAlias !== undefined && { bankAlias: bankAlias.trim() }),
        ...(bankCbu !== undefined && { bankCbu: bankCbu.trim() }),
        ...(accountHolder !== undefined && {
          accountHolder: accountHolder.trim(),
        }),
        ...(accountType !== undefined && {
          accountType: accountType?.trim() || null,
        }),
        ...(supportEmail !== undefined && {
          supportEmail: supportEmail.trim(),
        }),
        ...(supportPhone !== undefined && {
          supportPhone: supportPhone.trim(),
        }),
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error al actualizar configuración de pagos:", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuración de pagos" },
      { status: 500 }
    );
  }
}
