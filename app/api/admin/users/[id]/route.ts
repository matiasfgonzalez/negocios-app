import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users/[id] - Obtener un usuario específico (solo ADMINISTRADOR)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario existe y obtener su rol
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR puede acceder
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para acceder a este recurso" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await prisma.appUser.findUnique({
      where: { id },
      include: {
        businesses: {
          select: {
            id: true,
            name: true,
            slug: true,
            rubro: true,
            img: true,
            status: true,
          },
        },
        orders: {
          select: {
            id: true,
            total: true,
            state: true,
            createdAt: true,
            business: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            businesses: true,
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener usuario" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Actualizar un usuario (solo ADMINISTRADOR)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario existe y obtener su rol
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR puede actualizar usuarios
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para actualizar usuarios" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const {
      email,
      name,
      lastName,
      phone,
      role,
      address,
      lat,
      lng,
      city,
      province,
      postalCode,
      documentId,
      birthDate,
      isActive,
      adminNotes,
      avatar,
    } = body;

    // Verificar que el usuario a actualizar existe
    const existingUser = await prisma.appUser.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Si se está cambiando el email, verificar que no esté en uso
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.appUser.findUnique({
        where: { email },
      });

      if (emailInUse) {
        return NextResponse.json(
          { error: "El email ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Calcular fullName si se proporciona name o lastName
    let fullName = existingUser.fullName;
    const newName = name !== undefined ? name : existingUser.name;
    const newLastName =
      lastName !== undefined ? lastName : existingUser.lastName;

    if (newName && newLastName) {
      fullName = `${newName} ${newLastName}`;
    } else if (newName) {
      fullName = newName;
    } else if (newLastName) {
      fullName = newLastName;
    }

    // Actualizar usuario
    const updatedUser = await prisma.appUser.update({
      where: { id },
      data: {
        email: email !== undefined ? email : undefined,
        name: name !== undefined ? name : undefined,
        lastName: lastName !== undefined ? lastName : undefined,
        fullName,
        phone: phone !== undefined ? phone : undefined,
        role: role !== undefined ? role : undefined,
        address: address !== undefined ? address : undefined,
        lat: lat !== undefined ? lat : undefined,
        lng: lng !== undefined ? lng : undefined,
        city: city !== undefined ? city : undefined,
        province: province !== undefined ? province : undefined,
        postalCode: postalCode !== undefined ? postalCode : undefined,
        documentId: documentId !== undefined ? documentId : undefined,
        birthDate:
          birthDate !== undefined
            ? birthDate
              ? new Date(birthDate)
              : null
            : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        adminNotes: adminNotes !== undefined ? adminNotes : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Eliminar un usuario (solo ADMINISTRADOR)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario existe y obtener su rol
    const appUser = await prisma.appUser.findUnique({
      where: { clerkId: userId },
    });

    if (!appUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Solo ADMINISTRADOR puede eliminar usuarios
    if (appUser.role !== "ADMINISTRADOR") {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar usuarios" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // No permitir que el admin se elimine a sí mismo
    if (id === appUser.id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo" },
        { status: 400 }
      );
    }

    // Verificar que el usuario a eliminar existe
    const userToDelete = await prisma.appUser.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            businesses: true,
            orders: true,
          },
        },
      },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si tiene negocios o pedidos asociados
    if (userToDelete._count.businesses > 0 || userToDelete._count.orders > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar un usuario con negocios o pedidos asociados. Considera desactivarlo en su lugar.",
          hasBusinesses: userToDelete._count.businesses > 0,
          hasOrders: userToDelete._count.orders > 0,
        },
        { status: 400 }
      );
    }

    // Eliminar usuario
    await prisma.appUser.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}
