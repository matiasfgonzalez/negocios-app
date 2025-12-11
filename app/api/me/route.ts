// app/api/me/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/welcome-email";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user from database
  const user = await prisma.appUser.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, email, firstName, lastName } = body;

    if (!clerkId) {
      return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    // Combine first and last name into name field
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    // Obtener el avatar desde Clerk
    let avatarUrl: string | null = null;
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkId);
      avatarUrl = clerkUser.imageUrl || null;
    } catch (error) {
      console.error("Error fetching avatar from Clerk:", error);
      // Continuar sin avatar si hay error
    }

    // Verificar si el usuario ya existe (para saber si es registro nuevo)
    const existingUser = await prisma.appUser.findUnique({
      where: { clerkId },
      select: { id: true, avatar: true },
    });

    const isNewUser = !existingUser;

    // Preparar datos de actualización
    const updateData: {
      email?: string;
      name?: string;
      avatar?: string | null;
      updatedAt: Date;
    } = {
      email: email || undefined,
      name: fullName || undefined,
      updatedAt: new Date(),
    };

    // Agregar avatar si no existe o es diferente
    const hasAvatarChanged = existingUser?.avatar !== avatarUrl;
    if (hasAvatarChanged && avatarUrl) {
      updateData.avatar = avatarUrl;
    }

    // Upsert user in database
    const user = await prisma.appUser.upsert({
      where: { clerkId },
      update: updateData,
      create: {
        clerkId,
        email: email || "",
        name: fullName || "",
        avatar: avatarUrl,
      },
    });

    // Enviar email de bienvenida solo si es un usuario nuevo
    if (isNewUser && email) {
      // Enviar en background para no bloquear la respuesta
      sendWelcomeEmail({
        email,
        name: fullName || null,
      }).catch((err) => {
        console.error("Error enviando email de bienvenida:", err);
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
