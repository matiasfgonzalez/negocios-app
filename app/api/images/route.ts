import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
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

    // Obtener el archivo del FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo no debe superar los 5MB" },
        { status: 400 }
      );
    }

    // Convertir el archivo a buffer para Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "negocios-app",
            resource_type: "image",
          },
          (error, result) => {
            if (error)
              reject(
                new Error(error.message || "Error al subir imagen a Cloudinary")
              );
            else resolve(result);
          }
        )
        .end(buffer);
    });

    // Guardar en la base de datos
    const uploadedImage = await prisma.uploadedImage.create({
      data: {
        uploaderId: appUser.id,
        url: result.secure_url,
        publicId: result.public_id,
      },
    });

    return NextResponse.json(uploadedImage, { status: 201 });
  } catch (error) {
    console.error("Error al subir imagen:", error);
    return NextResponse.json(
      {
        error: "Error al subir la imagen",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const onlyMine = url.searchParams.get("onlyMine") === "true";

    // Si es administrador, puede ver todas las imágenes
    const role = user.publicMetadata.role as string;
    const isAdmin = role === "ADMINISTRADOR";

    const where = onlyMine || !isAdmin ? { uploaderId: appUser.id } : {};

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
