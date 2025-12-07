"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function syncUser(data?: {
  clerkId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const clerkId = data?.clerkId || userId;
    const email = data?.email;
    const firstName = data?.firstName;
    const lastName = data?.lastName;

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

    // Verificar si el usuario ya existe
    const existingUser = await prisma.appUser.findUnique({
      where: { clerkId },
      select: { avatar: true },
    });

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

    return user;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw new Error("Failed to sync user");
  }
}

export async function getMe() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user from database
  const user = await prisma.appUser.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
