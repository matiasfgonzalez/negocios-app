"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getOwnerBusinesses() {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.appUser.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const businesses = await prisma.business.findMany({
      where: { ownerId: user.id },
      select: { id: true, name: true },
    });

    return businesses;
  } catch (error) {
    console.error("Error al obtener negocios:", error);
    throw new Error("Error al obtener negocios");
  }
}

// getAllBusinesses for admin users
export async function getAllBusinesses() {
  try {
      //solo admin
      const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await prisma.appUser.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (user?.role !== Role.ADMINISTRADOR) {
      throw new Error("Forbidden");
    }
    

    const businesses = await prisma.business.findMany({
      select: { id: true, name: true },
    });
    return businesses;
  } catch (error) {
    console.error("Error al obtener todos los negocios:", error);
    throw new Error("Error al obtener todos los negocios");
  }
}
