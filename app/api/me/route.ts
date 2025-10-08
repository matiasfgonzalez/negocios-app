// app/api/me/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Upsert minimal (más info puedes obtenerla desde el cliente y enviarla).
  const user = await prisma.appUser.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId },
  });

  return NextResponse.json(user);
}
