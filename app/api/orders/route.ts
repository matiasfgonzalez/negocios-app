// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const orderSchema = z.object({
  businessId: z.string(),
  items: z
    .array(
      z.object({ productId: z.string(), quantity: z.number().int().min(1) })
    )
    .min(1),
  shipping: z.boolean(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const body = await req.json();
  const parsed = orderSchema.parse(body);

  // fetch user local (assume exists)
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: userId },
  });
  if (!appUser)
    return NextResponse.json({ error: "User not found" }, { status: 400 });

  // Build items and calculate total
  const productIds = parsed.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  let total = 0;
  const orderItemsData = parsed.items.map((item) => {
    const prod = products.find((p) => p.id === item.productId)!;
    total += prod.price * item.quantity;
    return {
      productId: prod.id,
      quantity: item.quantity,
      unitPrice: prod.price,
    };
  });

  const created = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        businessId: parsed.businessId,
        customerId: appUser.id,
        total,
        shipping: parsed.shipping,
        lat: parsed.lat,
        lng: parsed.lng,
        note: parsed.note,
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    await tx.orderEvent.create({
      data: { orderId: order.id, type: "created", actorId: appUser.id },
    });

    // optionally decrement stock here (with checks)
    return order;
  });

  // Build WhatsApp link for owner notification
  const message = encodeURIComponent(
    `Nuevo pedido ${created.id} - Total: $${total}. Ver admin: /admin/orders/${created.id}`
  );
  const wa = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${message}`;

  return NextResponse.json({ order: created, whatsappLink: wa });
}
