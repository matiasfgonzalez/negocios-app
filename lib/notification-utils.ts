// Utilidades para enviar notificaciones de suscripción
import { Resend } from "resend";

// Inicializar Resend con la API key desde variables de entorno
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuración de emails
const FROM_EMAIL =
  process.env.NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@barriomarket.com";

// Tipos de notificación
export type NotificationType =
  | "TRIAL_ENDING"
  | "PAYMENT_DUE"
  | "PAYMENT_OVERDUE"
  | "SUSPENSION_WARNING"
  | "SUSPENDED";

// Datos del propietario para notificaciones
export type OwnerData = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  becameOwnerAt: Date;
  subscriptionPaidUntil: Date | null;
};

// Función para generar el contenido del email según el tipo de notificación
export function generateEmailContent(
  type: NotificationType,
  owner: OwnerData,
  additionalData?: {
    daysRemaining?: number;
    daysOverdue?: number;
    monthlyFee?: number;
  }
) {
  const ownerName = owner.fullName || owner.email;
  const {
    daysRemaining,
    daysOverdue,
    monthlyFee = 5000,
  } = additionalData || {};

  switch (type) {
    case "TRIAL_ENDING":
      return {
        subject: `🔔 Tu período de prueba termina en ${daysRemaining} días - BarrioMarket`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #16a34a; margin-bottom: 20px;">🎉 BarrioMarket</h1>
              
              <h2 style="color: #1f2937; margin-bottom: 15px;">¡Hola ${ownerName}!</h2>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⏰ Tu período de prueba gratuito termina en ${daysRemaining} días</strong>
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 15px 0;">
                Para continuar disfrutando de todos los beneficios de BarrioMarket, necesitarás realizar el pago de tu suscripción mensual.
              </p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">💰 Detalles de la suscripción:</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li><strong>Monto mensual:</strong> $${monthlyFee.toLocaleString(
                    "es-AR"
                  )}</li>
                  <li><strong>Período de prueba finaliza:</strong> ${new Date(
                    owner.becameOwnerAt
                  ).setMonth(new Date(owner.becameOwnerAt).getMonth() + 1)}</li>
                  <li><strong>Beneficios:</strong> Gestión completa de tu negocio, productos ilimitados, pedidos y más</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos" 
                   style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  📋 Registrar mi pago
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                ¿Necesitás ayuda? Contactanos por WhatsApp o email y te asistiremos.
              </p>
              
              <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                Este es un correo automático. Por favor no respondas directamente a este mensaje.
              </p>
            </div>
          </div>
        `,
        text: `¡Hola ${ownerName}!\n\nTu período de prueba gratuito termina en ${daysRemaining} días.\n\nPara continuar con tu suscripción mensual de $${monthlyFee.toLocaleString(
          "es-AR"
        )}, ingresá a ${
          process.env.NEXT_PUBLIC_APP_URL
        }/dashboard/pagos\n\n¡Gracias por confiar en BarrioMarket!`,
      };

    case "PAYMENT_DUE":
      return {
        subject: `💳 Recordatorio: Pago mensual de suscripción - BarrioMarket`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #16a34a; margin-bottom: 20px;">💳 BarrioMarket</h1>
              
              <h2 style="color: #1f2937; margin-bottom: 15px;">¡Hola ${ownerName}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 15px 0;">
                Es momento de renovar tu suscripción mensual para continuar gestionando tu negocio en BarrioMarket.
              </p>
              
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af;">
                  <strong>📅 Monto a pagar: $${monthlyFee.toLocaleString(
                    "es-AR"
                  )}</strong>
                </p>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">✅ Pasos para registrar tu pago:</h3>
                <ol style="color: #4b5563; line-height: 1.8;">
                  <li>Realizá la transferencia a nuestra cuenta</li>
                  <li>Ingresá a tu panel de pagos</li>
                  <li>Subí el comprobante</li>
                  <li>Esperá la aprobación (generalmente en menos de 24 horas)</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos" 
                   style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  💳 Registrar mi pago ahora
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Si ya realizaste el pago, por favor ignorá este mensaje.
              </p>
            </div>
          </div>
        `,
        text: `¡Hola ${ownerName}!\n\nEs momento de renovar tu suscripción mensual de $${monthlyFee.toLocaleString(
          "es-AR"
        )}.\n\nIngresá a ${
          process.env.NEXT_PUBLIC_APP_URL
        }/dashboard/pagos para registrar tu pago.\n\n¡Gracias!`,
      };

    case "PAYMENT_OVERDUE":
      return {
        subject: `⚠️ Pago vencido - Riesgo de suspensión - BarrioMarket`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h1 style="color: #dc2626; margin-bottom: 20px;">⚠️ BarrioMarket</h1>
              
              <h2 style="color: #1f2937; margin-bottom: 15px;">¡Atención ${ownerName}!</h2>
              
              <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b;">
                  <strong>⚠️ Tu pago está vencido hace ${daysOverdue} días</strong>
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 15px 0;">
                Para evitar la suspensión de tu cuenta, es importante que regularices tu situación de pago lo antes posible.
              </p>
              
              <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #78350f; margin-top: 0;">⏰ Tiempo restante:</h3>
                <p style="color: #78350f; margin: 0; font-size: 16px;">
                  ${
                    daysOverdue && daysOverdue < 7
                      ? `Tu cuenta será suspendida en ${
                          7 - daysOverdue
                        } días si no se registra el pago.`
                      : "Tu cuenta puede ser suspendida en cualquier momento."
                  }
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos" 
                   style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  🚨 Regularizar pago ahora
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                ¿Tenés algún problema? Contactanos y buscaremos una solución juntos.
              </p>
            </div>
          </div>
        `,
        text: `¡Atención ${ownerName}!\n\nTu pago está vencido hace ${daysOverdue} días.\n\nPara evitar la suspensión de tu cuenta, regularizá tu pago en: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos`,
      };

    case "SUSPENSION_WARNING":
      return {
        subject: `🚨 URGENTE: Tu cuenta será suspendida en 3 días - BarrioMarket`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 3px solid #dc2626;">
              <h1 style="color: #dc2626; margin-bottom: 20px;">🚨 AVISO URGENTE</h1>
              
              <h2 style="color: #1f2937; margin-bottom: 15px;">${ownerName},</h2>
              
              <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ TU CUENTA SERÁ SUSPENDIDA EN 3 DÍAS</h3>
                <p style="margin: 0; color: #991b1b;">
                  Si no regularizás tu pago, perderás acceso a:
                </p>
                <ul style="color: #991b1b; margin: 10px 0 0 20px;">
                  <li>Gestión de tu negocio</li>
                  <li>Administración de productos</li>
                  <li>Visualización de pedidos</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 15px 0; font-size: 16px;">
                <strong>Llevás ${daysOverdue} días sin regularizar tu pago mensual.</strong>
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos" 
                   style="background-color: #dc2626; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 18px;">
                  💳 PAGAR AHORA
                </a>
              </div>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">📞 ¿Necesitás ayuda?</h3>
                <p style="color: #4b5563; margin: 0;">
                  Si tenés problemas para realizar el pago, contactanos de inmediato. Estamos para ayudarte.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `🚨 URGENTE ${ownerName}\n\nTu cuenta será suspendida en 3 días si no regularizás tu pago.\n\nLlevás ${daysOverdue} días de atraso.\n\nIngresá YA a: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos`,
      };

    case "SUSPENDED":
      return {
        subject: `❌ Tu cuenta ha sido suspendida - BarrioMarket`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 3px solid #991b1b;">
              <h1 style="color: #991b1b; margin-bottom: 20px;">❌ Cuenta Suspendida</h1>
              
              <h2 style="color: #1f2937; margin-bottom: 15px;">Estimado/a ${ownerName},</h2>
              
              <div style="background-color: #fee2e2; border-left: 4px solid #991b1b; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #991b1b; font-size: 16px;">
                  <strong>Tu cuenta ha sido suspendida por falta de pago.</strong>
                </p>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 15px 0;">
                Lamentablemente, debido a que tu pago está vencido hace más de 7 días, hemos tenido que suspender temporalmente el acceso a las funcionalidades de propietario.
              </p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">✅ Para reactivar tu cuenta:</h3>
                <ol style="color: #4b5563; line-height: 1.8;">
                  <li>Realizá el pago de tu suscripción</li>
                  <li>Registrá el comprobante en tu panel</li>
                  <li>Esperá la aprobación del administrador</li>
                  <li>Tu acceso será restaurado automáticamente</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos" 
                   style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  💳 Reactivar mi cuenta
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                Contactanos si tenés alguna consulta o necesitás asistencia.
              </p>
            </div>
          </div>
        `,
        text: `${ownerName}, tu cuenta ha sido suspendida por falta de pago.\n\nPara reactivarla, ingresá a ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos y registrá tu pago.\n\nContactanos si necesitás ayuda.`,
      };

    default:
      return {
        subject: "Notificación de BarrioMarket",
        html: "<p>Notificación de BarrioMarket</p>",
        text: "Notificación de BarrioMarket",
      };
  }
}

// Función para enviar email
export async function sendNotificationEmail(
  type: NotificationType,
  owner: OwnerData,
  additionalData?: {
    daysRemaining?: number;
    daysOverdue?: number;
    monthlyFee?: number;
  }
) {
  try {
    const { subject, html, text } = generateEmailContent(
      type,
      owner,
      additionalData
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: owner.email,
      subject,
      html,
      text,
    });

    console.log(`✅ Email enviado a ${owner.email} - Tipo: ${type}`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Error enviando email a ${owner.email}:`, error);
    return { success: false, error };
  }
}

// Función para generar mensaje de WhatsApp
export function generateWhatsAppMessage(
  type: NotificationType,
  owner: OwnerData,
  additionalData?: {
    daysRemaining?: number;
    daysOverdue?: number;
    monthlyFee?: number;
  }
): string {
  const ownerName = owner.fullName || "propietario";
  const {
    daysRemaining,
    daysOverdue,
    monthlyFee = 5000,
  } = additionalData || {};

  let message = "";

  switch (type) {
    case "TRIAL_ENDING":
      message = `🔔 *Hola ${ownerName}*\n\n`;
      message += `Tu período de prueba gratuito en BarrioMarket termina en *${daysRemaining} días*.\n\n`;
      message += `💰 Para continuar, necesitarás abonar la suscripción mensual de *$${monthlyFee.toLocaleString(
        "es-AR"
      )}*\n\n`;
      message += `📋 Ingresá a tu panel para registrar el pago:\n`;
      message += `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos`;
      break;

    case "PAYMENT_DUE":
      message = `💳 *Hola ${ownerName}*\n\n`;
      message += `Es momento de renovar tu suscripción mensual.\n\n`;
      message += `💰 Monto: *$${monthlyFee.toLocaleString("es-AR")}*\n\n`;
      message += `Registrá tu pago en:\n`;
      message += `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos`;
      break;

    case "PAYMENT_OVERDUE":
      message = `⚠️ *Atención ${ownerName}*\n\n`;
      message += `Tu pago está vencido hace *${daysOverdue} días*.\n\n`;
      message += `Para evitar la suspensión de tu cuenta, regularizá tu pago en:\n`;
      message += `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos`;
      break;

    case "SUSPENSION_WARNING":
      message = `🚨 *URGENTE ${ownerName}*\n\n`;
      message += `Tu cuenta será suspendida en *3 días* si no regularizás tu pago.\n\n`;
      message += `Llevás *${daysOverdue} días* de atraso.\n\n`;
      message += `*PAGA AHORA:*\n`;
      message += `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos`;
      break;

    case "SUSPENDED":
      message = `❌ *${ownerName}*\n\n`;
      message += `Tu cuenta ha sido *suspendida* por falta de pago.\n\n`;
      message += `Para reactivarla, registrá tu pago en:\n`;
      message += `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pagos\n\n`;
      message += `Contactanos si necesitás ayuda.`;
      break;
  }

  return encodeURIComponent(message);
}

// Función para obtener URL de WhatsApp
export function getWhatsAppNotificationUrl(
  phone: string,
  type: NotificationType,
  owner: OwnerData,
  additionalData?: {
    daysRemaining?: number;
    daysOverdue?: number;
    monthlyFee?: number;
  }
): string {
  const message = generateWhatsAppMessage(type, owner, additionalData);
  const cleanPhone = phone.replaceAll(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

// Función para enviar notificación por email y retornar URL de WhatsApp
export async function sendNotification(
  type: NotificationType,
  owner: OwnerData,
  additionalData?: {
    daysRemaining?: number;
    daysOverdue?: number;
    monthlyFee?: number;
  }
) {
  const emailResult = await sendNotificationEmail(type, owner, additionalData);

  const whatsappUrl = owner.phone
    ? getWhatsAppNotificationUrl(owner.phone, type, owner, additionalData)
    : null;

  return {
    email: emailResult,
    whatsappUrl,
  };
}
