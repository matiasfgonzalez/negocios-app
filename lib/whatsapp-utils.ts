// Utilidades para generar mensajes de WhatsApp
import { Order } from "@/app/types/types";
import { formatPrice } from "@/lib/utils";

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
  readonly promotions?: ReadonlyArray<{
    readonly quantity: number;
    readonly price?: number;
    readonly unitPrice?: number;
    readonly promotion?: {
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

  // Lista de productos y promociones
  let productsText = "";
  for (const item of order.items) {
    const itemPrice = item.price ?? item.unitPrice ?? 0;
    const subtotal = item.quantity * itemPrice;
    productsText += `\n• ${item.quantity}x ${item.product.name} - ${formatPrice(
      subtotal
    )}`;
  }

  // Agregar promociones si existen
  if (order.promotions) {
    for (const promo of order.promotions) {
      const promoPrice = promo.price ?? promo.unitPrice ?? 0;
      const subtotal = promo.quantity * promoPrice;
      const promoName = promo.promotion?.name || "Promoción sin nombre";
      productsText += `\n• 🎁 ${
        promo.quantity
      }x PROMO: ${promoName} - ${formatPrice(subtotal)}`;
    }
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

  const promotionsTotal = order.promotions
    ? order.promotions.reduce((sum, promo) => {
        const promoPrice = promo.price ?? promo.unitPrice ?? 0;
        return sum + promo.quantity * promoPrice;
      }, 0)
    : 0;

  const shippingCost = order.shipping
    ? itemsTotal + promotionsTotal < order.total
      ? order.total - (itemsTotal + promotionsTotal)
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
  message += `Subtotal: ${formatPrice(subtotal)}\n`;
  if (shippingCost > 0) {
    message += `Envío: ${formatPrice(shippingCost)}\n`;
  }
  message += `*Total: ${formatPrice(order.total)}*`;

  message += noteText;

  message += `\n\n_¿Podrían ayudarme con mi consulta?_`;

  return encodeURIComponent(message);
}
