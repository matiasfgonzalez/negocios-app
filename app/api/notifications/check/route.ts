import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendNotification,
  type NotificationType,
} from "@/lib/notification-utils";

// Este endpoint debe ser llamado por un cron job diario
// Puede protegerse con un secreto en los headers para mayor seguridad
export async function POST(req: Request) {
  try {
    // Verificar autorización (opcional pero recomendado)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("🔔 Iniciando verificación de notificaciones...");

    // Obtener configuración de pagos para el monto mensual
    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { id: "payment_config" },
    });

    const monthlyFee = paymentConfig?.monthlyFee || 5000;

    // Obtener todos los propietarios activos
    const owners = await prisma.appUser.findMany({
      where: {
        role: "PROPIETARIO",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        becameOwnerAt: true,
        subscriptionStatus: true,
        subscriptionPaidUntil: true,
      },
    });

    const now = new Date();
    const notifications: {
      ownerId: string;
      ownerEmail: string;
      type: NotificationType;
      status: string;
    }[] = [];

    // Procesar cada propietario
    for (const owner of owners) {
      // Validar que tenga email y fecha de inicio
      if (!owner.becameOwnerAt || !owner.email) {
        console.log(`⏭️ Saltando propietario sin email o fecha: ${owner.id}`);
        continue;
      }

      const becameOwnerAt = new Date(owner.becameOwnerAt);
      const trialEndDate = new Date(becameOwnerAt);
      trialEndDate.setMonth(trialEndDate.getMonth() + 1);
      const isInTrial = now < trialEndDate;

      // Caso 1: Período de prueba - avisar 3 días antes de que termine
      if (isInTrial) {
        const daysRemaining = Math.ceil(
          (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining === 3 || daysRemaining === 1) {
          console.log(
            `📧 Enviando notificación TRIAL_ENDING a ${owner.email} (${daysRemaining} días restantes)`
          );

          const result = await sendNotification(
            "TRIAL_ENDING",
            owner as {
              id: string;
              email: string;
              fullName: string | null;
              phone: string | null;
              becameOwnerAt: Date;
              subscriptionPaidUntil: Date | null;
            },
            {
              daysRemaining,
              monthlyFee,
            }
          );

          notifications.push({
            ownerId: owner.id,
            ownerEmail: owner.email,
            type: "TRIAL_ENDING",
            status: result.email.success ? "sent" : "failed",
          });
        }
      }
      // Caso 2: Fuera del período de prueba
      else {
        // Si no tiene fecha de pago, está suspendido
        if (owner.subscriptionPaidUntil === null) {
          // Calcular días desde que terminó el trial
          const daysSinceTrialEnd = Math.ceil(
            (now.getTime() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Solo enviar si es día 1, 7, 14 (no spam diario)
          if ([1, 7, 14].includes(daysSinceTrialEnd)) {
            console.log(
              `📧 Enviando notificación SUSPENDED a ${owner.email} (sin fecha de pago)`
            );

            const result = await sendNotification(
              "SUSPENDED",
              owner as {
                id: string;
                email: string;
                fullName: string | null;
                phone: string | null;
                becameOwnerAt: Date;
                subscriptionPaidUntil: Date | null;
              },
              {
                daysOverdue: daysSinceTrialEnd,
                monthlyFee,
              }
            );

            notifications.push({
              ownerId: owner.id,
              ownerEmail: owner.email,
              type: "SUSPENDED",
              status: result.email.success ? "sent" : "failed",
            });
          }
        } else {
          const paidUntil = new Date(owner.subscriptionPaidUntil);
          const diffTime = now.getTime() - paidUntil.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Caso 2a: Pago próximo a vencer (3 días antes)
          if (diffDays === -3) {
            console.log(
              `📧 Enviando notificación PAYMENT_DUE a ${owner.email} (vence en 3 días)`
            );

            const result = await sendNotification(
              "PAYMENT_DUE",
              owner as {
                id: string;
                email: string;
                fullName: string | null;
                phone: string | null;
                becameOwnerAt: Date;
                subscriptionPaidUntil: Date | null;
              },
              {
                daysRemaining: 3,
                monthlyFee,
              }
            );

            notifications.push({
              ownerId: owner.id,
              ownerEmail: owner.email,
              type: "PAYMENT_DUE",
              status: result.email.success ? "sent" : "failed",
            });
          }
          // Caso 2b: Pago vencido (1-7 días)
          else if (diffDays > 0 && diffDays <= 7) {
            // Enviar en día 1, 3, 5, 7
            if ([1, 3, 5, 7].includes(diffDays)) {
              const notifType =
                diffDays === 7 ? "SUSPENSION_WARNING" : "PAYMENT_OVERDUE";

              console.log(
                `📧 Enviando notificación ${notifType} a ${owner.email} (${diffDays} días de retraso)`
              );

              const result = await sendNotification(
                notifType,
                owner as {
                  id: string;
                  email: string;
                  fullName: string | null;
                  phone: string | null;
                  becameOwnerAt: Date;
                  subscriptionPaidUntil: Date | null;
                },
                {
                  daysOverdue: diffDays,
                  monthlyFee,
                }
              );

              notifications.push({
                ownerId: owner.id,
                ownerEmail: owner.email,
                type: notifType,
                status: result.email.success ? "sent" : "failed",
              });
            }
          }
          // Caso 2c: Suspendido (más de 7 días)
          else if (diffDays > 7) {
            // Enviar cada 7 días (día 8, 15, 22, etc.)
            if (diffDays % 7 === 1) {
              console.log(
                `📧 Enviando notificación SUSPENDED a ${owner.email} (${diffDays} días de retraso)`
              );

              const result = await sendNotification(
                "SUSPENDED",
                owner as {
                  id: string;
                  email: string;
                  fullName: string | null;
                  phone: string | null;
                  becameOwnerAt: Date;
                  subscriptionPaidUntil: Date | null;
                },
                {
                  daysOverdue: diffDays,
                  monthlyFee,
                }
              );

              notifications.push({
                ownerId: owner.id,
                ownerEmail: owner.email,
                type: "SUSPENDED",
                status: result.email.success ? "sent" : "failed",
              });
            }
          }
        }
      }
    }

    const summary = {
      totalOwners: owners.length,
      notificationsSent: notifications.filter((n) => n.status === "sent")
        .length,
      notificationsFailed: notifications.filter((n) => n.status === "failed")
        .length,
      details: notifications,
    };

    console.log("✅ Verificación de notificaciones completada:", summary);

    return NextResponse.json({
      success: true,
      message: "Notificaciones procesadas",
      summary,
    });
  } catch (error) {
    console.error("❌ Error procesando notificaciones:", error);
    return NextResponse.json(
      {
        error: "Error procesando notificaciones",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// GET endpoint para verificar manualmente el estado (solo para testing/admin)
export async function GET(req: Request) {
  try {
    // Verificar que sea admin
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "No autorizado - Solo para administradores" },
        { status: 401 }
      );
    }

    const now = new Date();

    // Obtener propietarios que necesitarían notificaciones
    const owners = await prisma.appUser.findMany({
      where: {
        role: "PROPIETARIO",
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        becameOwnerAt: true,
        subscriptionStatus: true,
        subscriptionPaidUntil: true,
      },
    });

    const analysis = owners.map((owner) => {
      if (!owner.becameOwnerAt) {
        return {
          email: owner.email,
          status: "no_date",
          action: "skip",
        };
      }

      const becameOwnerAt = new Date(owner.becameOwnerAt);
      const trialEndDate = new Date(becameOwnerAt);
      trialEndDate.setMonth(trialEndDate.getMonth() + 1);
      const isInTrial = now < trialEndDate;

      if (isInTrial) {
        const daysRemaining = Math.ceil(
          (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          email: owner.email,
          status: "trial",
          daysRemaining,
          action:
            daysRemaining === 3 || daysRemaining === 1 ? "notify" : "skip",
        };
      }

      if (!owner.subscriptionPaidUntil) {
        const daysSinceTrialEnd = Math.ceil(
          (now.getTime() - trialEndDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          email: owner.email,
          status: "suspended_no_payment",
          daysSinceTrialEnd,
          action: [1, 7, 14].includes(daysSinceTrialEnd) ? "notify" : "skip",
        };
      }

      const paidUntil = new Date(owner.subscriptionPaidUntil);
      const diffDays = Math.ceil(
        (now.getTime() - paidUntil.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === -3) {
        return {
          email: owner.email,
          status: "payment_due_soon",
          action: "notify",
        };
      }
      if (diffDays > 0 && diffDays <= 7) {
        return {
          email: owner.email,
          status: "overdue",
          daysOverdue: diffDays,
          action: [1, 3, 5, 7].includes(diffDays) ? "notify" : "skip",
        };
      }
      if (diffDays > 7) {
        return {
          email: owner.email,
          status: "suspended",
          daysOverdue: diffDays,
          action: diffDays % 7 === 1 ? "notify" : "skip",
        };
      }

      return { email: owner.email, status: "active", action: "skip" };
    });

    return NextResponse.json({
      totalOwners: owners.length,
      analysis,
      wouldNotify: analysis.filter((a) => a.action === "notify").length,
    });
  } catch (error) {
    console.error("Error en análisis:", error);
    return NextResponse.json({ error: "Error en análisis" }, { status: 500 });
  }
}
