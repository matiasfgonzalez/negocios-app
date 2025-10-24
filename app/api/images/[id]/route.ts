import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
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

    // Buscar la imagen
    const image = await prisma.uploadedImage.findUnique({
      where: { id: params.id },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    // Verificar permisos: solo el propietario o un administrador pueden eliminar
    const role = user.publicMetadata.role as string;
    const isAdmin = role === "ADMINISTRADOR";
    const isOwner = image.uploaderId === appUser.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta imagen" },
        { status: 403 }
      );
    }

    // Borrar de Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Borrar de la base de datos
    await prisma.uploadedImage.delete({ where: { id: image.id } });

    return NextResponse.json({
      success: true,
      message: "Imagen eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar la imagen",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
