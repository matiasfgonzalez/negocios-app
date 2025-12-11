import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { generateEmailContent } from "@/lib/notification-utils";
import { error } from "console";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar rol de administrador desde Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string;

    if (role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "Solo administradores pueden enviar emails de prueba" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, notificationType, ownerName } = body;

    if (!email || !notificationType) {
      return NextResponse.json(
        { error: "Email y tipo de notificación son requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo de notificación
    const validTypes = [
      "trial_ending_3",
      "trial_ending_1",
      "payment_due_soon",
      "payment_overdue_1",
      "payment_overdue_3",
      "payment_overdue_5",
      "suspension_warning",
      "suspended",
    ];

    if (!validTypes.includes(notificationType)) {
      return NextResponse.json(
        { error: "Tipo de notificación inválido" },
        { status: 400 }
      );
    }

    // Generar contenido del email según el tipo
    const name = ownerName || "Usuario de Prueba";

    // Mapear el tipo de notificación del frontend al tipo del backend
    const notificationTypeMap: Record<string, { type: string; days?: number }> =
      {
        trial_ending_3: { type: "TRIAL_ENDING", days: 3 },
        trial_ending_1: { type: "TRIAL_ENDING", days: 1 },
        payment_due_soon: { type: "PAYMENT_DUE", days: 3 },
        payment_overdue_1: { type: "PAYMENT_OVERDUE", days: 1 },
        payment_overdue_3: { type: "PAYMENT_OVERDUE", days: 3 },
        payment_overdue_5: { type: "PAYMENT_OVERDUE", days: 5 },
        suspension_warning: { type: "SUSPENSION_WARNING", days: 7 },
        suspended: { type: "SUSPENDED", days: 8 },
      };

    const mappedType = notificationTypeMap[notificationType];
    if (!mappedType) {
      return NextResponse.json(
        { error: "Tipo de notificación inválido" },
        { status: 400 }
      );
    }

    // Crear un objeto OwnerData simulado para la prueba
    const mockOwner = {
      id: "test-id",
      email: email,
      fullName: name,
      phone: null,
      becameOwnerAt: new Date(),
      subscriptionPaidUntil: new Date(),
    };

    // Preparar datos adicionales según el tipo
    const additionalData: {
      daysRemaining?: number;
      daysOverdue?: number;
      monthlyFee?: number;
    } = {};
    if (mappedType.type === "TRIAL_ENDING") {
      additionalData.daysRemaining = mappedType.days;
    } else if (
      mappedType.type === "PAYMENT_OVERDUE" ||
      mappedType.type === "SUSPENSION_WARNING" ||
      mappedType.type === "SUSPENDED"
    ) {
      additionalData.daysOverdue = mappedType.days;
    }
    // PAYMENT_DUE no necesita datos adicionales específicos

    const emailContent = generateEmailContent(
      mappedType.type as
        | "TRIAL_ENDING"
        | "PAYMENT_DUE"
        | "PAYMENT_OVERDUE"
        | "SUSPENSION_WARNING"
        | "SUSPENDED",
      mockOwner,
      additionalData
    );

    const subject = `[PRUEBA] ${emailContent.subject}`;
    const htmlContent = `
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-weight: bold;">⚠️ EMAIL DE PRUEBA</p>
        <p style="margin: 4px 0 0 0; color: #92400e; font-size: 14px;">
          Este es un email de prueba enviado desde el panel de administración.
        </p>
      </div>
      ${emailContent.html}
    `;
    const textContent = `⚠️ EMAIL DE PRUEBA - Este es un email de prueba enviado desde el panel de administración.\n\n${emailContent.text}`;

    // Enviar email usando Resend directamente
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
    });

    

    return NextResponse.json({
      success: true,
      message: "Email de prueba enviado correctamente",
      emailId: result.data?.id,
      from: FROM_EMAIL,
      to: email,
      subject,
      error: result.error,
    });
  } catch (error) {
    console.error("Error en /api/notifications/test:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
