// Utilidades para generar mensajes de WhatsApp
import { Order } from "@/app/types/types";

// Tipo específico para el mensaje de WhatsApp (con las relaciones necesarias)
type OrderForWhatsApp = Pick<
  Order,
  "id" | "state" | "total" | "shipping" | "addressText" | "note" | "createdAt"
> & {
  readonly customer: {
    readonly name: string | null;
    readonly email: string | null;
    readonly phone: string | null;
  };
  readonly business: {
    readonly name: string;
  };
  readonly items: ReadonlyArray<{
    readonly quantity: number;
    readonly price?: number;
    readonly unitPrice?: number;
    readonly product: {
      readonly name: string;
    };
  }>;
};

export function generateOrderWhatsAppMessage(
  order: Readonly<OrderForWhatsApp>
): string {
  const orderNumber = order.id.substring(0, 8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Estado del pedido formateado
  const stateText = order.state.replaceAll("_", " ");

  // Información del cliente
  const customerName = order.customer.name || "Cliente sin nombre";
  const customerEmail = order.customer.email;
  const customerPhone = order.customer.phone || "Sin teléfono";

  // Lista de productos
  let productsText = "";
  for (const item of order.items) {
    const itemPrice = item.price ?? item.unitPrice ?? 0;
    const subtotal = item.quantity * itemPrice;
    productsText += `\n• ${item.quantity}x ${
      item.product.name
    } - $${subtotal.toFixed(2)}`;
  }

  // Tipo de entrega
  const deliveryType = order.shipping
    ? `🚚 Envío a domicilio\n📍 Dirección: ${
        order.addressText || "No especificada"
      }`
    : "📦 Retiro en local";

  // Nota del cliente
  const noteText = order.note
    ? `\n\n📝 *Nota del cliente:*\n${order.note}`
    : "";

  // Calcular subtotal (total - shipping si aplica)
  const itemsTotal = order.items.reduce((sum, item) => {
    const itemPrice = item.price ?? item.unitPrice ?? 0;
    return sum + item.quantity * itemPrice;
  }, 0);

  const shippingCost = order.shipping
    ? itemsTotal < order.total
      ? order.total - itemsTotal
      : 0
    : 0;

  const subtotal = order.total - shippingCost;

  // Construir mensaje
  let message = `Hola! Tengo una consulta sobre mi pedido:\n\n`;
  message += `📋 *Pedido #${orderNumber}*\n`;
  message += `🏪 Negocio: ${order.business.name}\n`;
  message += `📅 Fecha: ${orderDate}\n`;
  message += `📊 Estado actual: *${stateText}*\n\n`;

  message += `👤 *Datos del cliente:*\n`;
  message += `Nombre: ${customerName}\n`;
  message += `Email: ${customerEmail}\n`;
  message += `Teléfono: ${customerPhone}\n\n`;

  message += `🛒 *Productos:*${productsText}\n\n`;

  message += `${deliveryType}\n\n`;

  message += `💰 *Resumen:*\n`;
  message += `Subtotal: $${subtotal.toFixed(2)}\n`;
  if (shippingCost > 0) {
    message += `Envío: $${shippingCost.toFixed(2)}\n`;
  }
  message += `*Total: $${order.total.toFixed(2)}*`;

  message += noteText;

  message += `\n\n_¿Podrían ayudarme con mi consulta?_`;

  return encodeURIComponent(message);
}
