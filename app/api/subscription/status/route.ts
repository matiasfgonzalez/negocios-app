import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener estado de suscripción
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
      include: {
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (appUser.role !== "PROPIETARIO") {
      return NextResponse.json(
        { error: "Solo disponible para propietarios" },
        { status: 403 }
      );
    }

    // Calcular estado de la suscripción
    const now = new Date();
    const becameOwnerAt = appUser.becameOwnerAt || appUser.createdAt;
    const trialEndDate = new Date(becameOwnerAt);
    trialEndDate.setMonth(trialEndDate.getMonth() + 1);

    const isInTrial = now < trialEndDate;
    const daysLeftInTrial = isInTrial
      ? Math.ceil(
          (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    let subscriptionStatus = appUser.subscriptionStatus || "TRIAL";
    let canAccessOwnerFeatures = true;
    let nextPaymentDue: Date | null = null;

    if (!isInTrial) {
      // Verificar si hay pagos aprobados
      const lastApprovedPayment = appUser.payments.find(
        (p) => p.status === "APPROVED"
      );

      if (lastApprovedPayment && appUser.subscriptionPaidUntil) {
        const paidUntil = new Date(appUser.subscriptionPaidUntil);
        if (now <= paidUntil) {
          subscriptionStatus = "ACTIVE";
          canAccessOwnerFeatures = true;
        } else {
          // Calcular días de retraso
          const daysOverdue = Math.ceil(
            (now.getTime() - paidUntil.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysOverdue <= 7) {
            subscriptionStatus = "OVERDUE";
            canAccessOwnerFeatures = true; // Gracia de 7 días
          } else {
            subscriptionStatus = "SUSPENDED";
            canAccessOwnerFeatures = false;
          }
        }

        // Calcular próximo pago
        nextPaymentDue = new Date(paidUntil);
        nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1);
      } else {
        // No hay pagos aprobados y el trial terminó
        const daysOverdue = Math.ceil(
          (now.getTime() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysOverdue <= 7) {
          subscriptionStatus = "OVERDUE";
          canAccessOwnerFeatures = true;
        } else {
          subscriptionStatus = "SUSPENDED";
          canAccessOwnerFeatures = false;
        }

        nextPaymentDue = trialEndDate;
      }
    }

    // Actualizar el estado en la base de datos si cambió
    if (subscriptionStatus !== appUser.subscriptionStatus) {
      await prisma.appUser.update({
        where: { id: appUser.id },
        data: { subscriptionStatus },
      });
    }

    return NextResponse.json({
      subscriptionStatus,
      isInTrial,
      daysLeftInTrial,
      canAccessOwnerFeatures,
      becameOwnerAt,
      trialEndDate,
      subscriptionPaidUntil: appUser.subscriptionPaidUntil,
      nextPaymentDue,
      recentPayments: appUser.payments,
    });
  } catch (error) {
    console.error("Error obteniendo estado de suscripción:", error);
    return NextResponse.json(
      { error: "Error obteniendo estado de suscripción" },
      { status: 500 }
    );
  }
}
