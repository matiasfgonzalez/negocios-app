// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

const orderSchema = z.object({
  businessId: z.string(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        name: z.string(),
        price: z.number(),
      })
    )
    .min(1),
  shipping: z.boolean(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  addressText: z.string().optional(),
  note: z.string().max(500).optional(),
  subtotal: z.number(),
  shippingCost: z.number(),
  total: z.number(),
});

// GET - Obtener lista de pedidos con filtros
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    // Obtener usuario de la base de datos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Obtener parámetros de búsqueda
    const url = new URL(req.url);
    const businessId = url.searchParams.get("businessId");
    const customerId = url.searchParams.get("customerId");
    const state = url.searchParams.get("state");
    const limit = url.searchParams.get("limit");

    // Construir filtros según el rol del usuario
    const where: Prisma.OrderWhereInput = {};

    if (appUser.role === "CLIENTE") {
      // Los clientes solo ven sus propios pedidos
      where.customerId = appUser.id;
    } else if (appUser.role === "PROPIETARIO") {
      // Los propietarios ven pedidos de sus negocios
      const ownedBusinesses = await prisma.business.findMany({
        where: { ownerId: appUser.id },
        select: { id: true },
      });

      const businessIds = ownedBusinesses.map((b) => b.id);

      if (businessIds.length === 0) {
        return NextResponse.json([]);
      }

      where.businessId = { in: businessIds };

      // Si especifica un businessId, filtrarlo (validando que le pertenezca)
      if (businessId && businessIds.includes(businessId)) {
        where.businessId = businessId;
      }
    } else if (appUser.role === "ADMINISTRADOR") {
      // Los administradores ven todos los pedidos, con filtros opcionales
      if (businessId) {
        where.businessId = businessId;
      }
      if (customerId) {
        where.customerId = customerId;
      }
    }

    // Filtro por estado (disponible para todos los roles)
    if (state) {
      where.state = state as Prisma.EnumOrderStateFilter;
    }

    // Consultar pedidos
    const orders = await prisma.order.findMany({
      where,
      include: {
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            aliasPago: true,
            whatsappPhone: true,
            img: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                businessId: true,
                categoryId: true,
                name: true,
                description: true,
                price: true,
                stock: true,
                sku: true,
                available: true,
                images: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        events: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? Number.parseInt(limit) : undefined,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Auth required" }, { status: 401 });

    const body = await req.json();
    const parsed = orderSchema.parse(body);

    // Obtener usuario de la base de datos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });
    if (!appUser)
      return NextResponse.json({ error: "User not found" }, { status: 400 });

    // Obtener el negocio
    const business = await prisma.business.findUnique({
      where: { id: parsed.businessId },
    });
    if (!business)
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );

    // Validar campos de envío si es necesario
    if (parsed.shipping && !parsed.addressText) {
      return NextResponse.json(
        { error: "Dirección de entrega requerida para envío" },
        { status: 400 }
      );
    }

    // Validar stock de productos
    const productIds = parsed.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    for (const item of parsed.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Producto ${item.name} no encontrado` },
          { status: 404 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    const orderItemsData = parsed.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    // Crear la orden en una transacción
    const created = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          businessId: parsed.businessId,
          customerId: appUser.id,
          total: parsed.total,
          shipping: parsed.shipping,
          lat: parsed.lat,
          lng: parsed.lng,
          addressText: parsed.addressText,
          note: parsed.note,
          items: { create: orderItemsData },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          business: true,
          customer: true,
        },
      });

      // Crear evento de creación
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          type: "CREADA",
          actorId: appUser.id,
          note: "Pedido creado por el cliente",
        },
      });

      // Decrementar stock de productos
      for (const item of parsed.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    // Construir mensaje detallado para WhatsApp
    const itemsList = parsed.items
      .map(
        (item) => `• ${item.quantity}x ${item.name} - $${item.price.toFixed(2)}`
      )
      .join("\n");

    const deliveryInfo = parsed.shipping
      ? `\n\n📍 *ENTREGA A DOMICILIO*\n` +
        `Dirección: ${parsed.addressText}\n` +
        (parsed.note ? `Indicaciones: ${parsed.note}\n` : "") +
        `Costo de envío: $${parsed.shippingCost.toFixed(2)}`
      : `\n\n📦 *RETIRO EN LOCAL*`;

    const whatsappMessage =
      `🛒 *NUEVO PEDIDO #${created.id.substring(0, 8).toUpperCase()}*\n\n` +
      `👤 Cliente: ${appUser.name || appUser.email || "Cliente"}\n` +
      `📱 Teléfono: ${appUser.phone || "No especificado"}\n\n` +
      `📋 *PRODUCTOS:*\n${itemsList}\n\n` +
      `💰 *RESUMEN:*\n` +
      `Subtotal: $${parsed.subtotal.toFixed(2)}\n` +
      (parsed.shipping ? `Envío: $${parsed.shippingCost.toFixed(2)}\n` : "") +
      `*Total: $${parsed.total.toFixed(2)}*` +
      deliveryInfo +
      `\n\n📅 Fecha: ${new Date().toLocaleString("es-AR")}\n` +
      `\n_Pedido ID: ${created.id}_`;

    const whatsappLink = `https://wa.me/${business.whatsappPhone?.replaceAll(
      /\D/g,
      ""
    )}?text=${encodeURIComponent(whatsappMessage)}`;

    return NextResponse.json({
      order: created,
      whatsappLink,
      success: true,
    });
  } catch (error) {
    console.error("Error al crear orden:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
