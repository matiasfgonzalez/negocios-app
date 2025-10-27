import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Verificar autenticación
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener el AppUser desde la base de datos
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: user.id },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado en la base de datos" },
        { status: 404 }
      );
    }

    // Verificar si es administrador
    const isAdmin = appUser.role === "ADMINISTRADOR";

    // Si es administrador, traer todas las imágenes
    // Si no, solo traer las imágenes del usuario actual
    const where = isAdmin ? {} : { uploaderId: appUser.id };

    const images = await prisma.uploadedImage.findMany({
      where,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    return NextResponse.json(
      {
        error: "Error al obtener las imágenes",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
