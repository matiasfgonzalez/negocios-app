// Utilidades para enviar email de bienvenida a nuevos usuarios
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.NOTIFICATION_FROM_EMAIL || "onboarding@resend.dev";

// Datos del usuario para el email de bienvenida
export type WelcomeEmailData = {
  email: string;
  name: string | null;
};

// Generar contenido del email de bienvenida
export function generateWelcomeEmailContent(user: WelcomeEmailData) {
  const userName = user.name || "Vecino/a";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://barriomarket.com";
  const currentYear = new Date().getFullYear();

  return {
    subject: "🎉 ¡Bienvenido/a a BarrioMarket! Tu comercio local te espera",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 12px 12px 0 0; padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">
              🏪 BarrioMarket
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              El mercado de tu barrio, en tu mano
            </p>
          </div>
          
          <!-- Main Content -->
          <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Welcome Message -->
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="font-size: 60px;">🎉</span>
              <h2 style="color: #1f2937; margin: 15px 0 10px 0; font-size: 24px;">
                ¡Hola ${userName}!
              </h2>
              <p style="color: #6b7280; font-size: 18px; margin: 0;">
                ¡Bienvenido/a a la comunidad de BarrioMarket!
              </p>
            </div>
            
            <!-- Info Box -->
            <div style="background-color: #ecfdf5; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #166534; line-height: 1.6;">
                <strong>¿Qué es BarrioMarket?</strong><br>
                Somos una plataforma que conecta a los comercios locales con los vecinos del barrio. 
                Acá vas a poder descubrir negocios cerca tuyo, ver sus productos, promociones y 
                realizar pedidos de forma simple y rápida.
              </p>
            </div>
            
            <!-- What you can do -->
            <h3 style="color: #1f2937; margin: 30px 0 15px 0; font-size: 18px;">
              📋 ¿Qué podés hacer en BarrioMarket?
            </h3>
            
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 2;">
                <li>🔍 <strong>Explorar negocios</strong> de tu zona</li>
                <li>🛒 <strong>Ver productos y precios</strong> actualizados</li>
                <li>🏷️ <strong>Descubrir promociones</strong> exclusivas</li>
                <li>📦 <strong>Realizar pedidos</strong> y coordinar envíos</li>
                <li>⭐ <strong>Guardar tus favoritos</strong> para encontrarlos rápido</li>
              </ul>
            </div>
            
            <!-- Owner CTA -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
              <span style="font-size: 40px;">🏪</span>
              <h3 style="color: #92400e; margin: 15px 0 10px 0; font-size: 20px;">
                ¿Tenés un negocio?
              </h3>
              <p style="color: #78350f; line-height: 1.6; margin: 0 0 20px 0;">
                <strong>¡Publicá tu negocio en BarrioMarket!</strong><br>
                Podés solicitar ser <strong>Propietario</strong> para mostrar tu comercio, 
                subir tus productos, crear promociones y recibir pedidos de clientes de tu barrio.
              </p>
              <a href="${appUrl}/dashboard" 
                 style="display: inline-block; background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                📝 Solicitar ser Propietario
              </a>
              <p style="color: #92400e; font-size: 13px; margin: 15px 0 0 0;">
                ¡Probá gratis durante 30 días!
              </p>
            </div>
            
            <!-- Explore CTA -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${appUrl}/businesses" 
                 style="display: inline-block; background-color: #16a34a; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(22,163,74,0.3);">
                🛍️ Explorar Negocios
              </a>
            </div>
            
            <!-- Divider -->
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <!-- Help Section -->
            <div style="text-align: center; padding: 10px 0;">
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                ¿Tenés preguntas? Escribinos a 
                <a href="mailto:soporte@barriomarket.com" style="color: #16a34a; text-decoration: none; font-weight: 500;">
                  soporte@barriomarket.com
                </a>
                <br>o contactanos por nuestras redes sociales.
              </p>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding: 25px; color: #9ca3af;">
            <p style="font-size: 13px; margin: 0 0 10px 0;">
              © ${new Date().getFullYear()} BarrioMarket - Todos los derechos reservados
            </p>
            <p style="font-size: 12px; margin: 0;">
              Recibiste este email porque te registraste en BarrioMarket.<br>
              Este es un correo automático, por favor no respondas directamente.
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `,
    text: `
¡Hola ${userName}!

🎉 ¡Bienvenido/a a BarrioMarket!

Somos una plataforma que conecta a los comercios locales con los vecinos del barrio.

¿Qué podés hacer en BarrioMarket?
- Explorar negocios de tu zona
- Ver productos y precios actualizados
- Descubrir promociones exclusivas
- Realizar pedidos y coordinar envíos
- Guardar tus favoritos

🏪 ¿TENÉS UN NEGOCIO?
¡Publicá tu negocio en BarrioMarket! Podés solicitar ser Propietario para mostrar tu comercio, subir tus productos, crear promociones y recibir pedidos de clientes de tu barrio.

👉 Solicitá ser Propietario: ${appUrl}/dashboard
¡Probá gratis durante 30 días!

👉 Explorar negocios: ${appUrl}/businesses

¿Tenés preguntas? Escribinos a soporte@barriomarket.com

---
© ${new Date().getFullYear()} BarrioMarket - Todos los derechos reservados
Recibiste este email porque te registraste en BarrioMarket.
    `.trim(),
  };
}

// Enviar email de bienvenida
export async function sendWelcomeEmail(
  user: WelcomeEmailData
): Promise<{ success: boolean; error?: string; emailId?: string }> {
  try {
    if (!user.email) {
      return { success: false, error: "Email no proporcionado" };
    }

    const emailContent = generateWelcomeEmailContent(user);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    if (result.error) {
      console.error("Error enviando email de bienvenida:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log(
      `Email de bienvenida enviado a ${user.email}:`,
      result.data?.id
    );
    return { success: true, emailId: result.data?.id };
  } catch (error) {
    console.error("Error enviando email de bienvenida:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
