import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductosClient from "./productos-client";

type PageProps = {
  readonly searchParams: Promise<{ negocioId?: string }>;
};

export default async function ProductosPage({
  searchParams,
}: Readonly<PageProps>) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Solo ADMINISTRADOR y PROPIETARIO pueden acceder
  if (role !== "ADMINISTRADOR" && role !== "PROPIETARIO") {
    redirect("/dashboard");
  }

  // Buscar el usuario en la base de datos
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: user.id },
  });

  if (!appUser) {
    redirect("/sign-in");
  }

  const params = await searchParams;

  // Obtener todas las categorías
  const categorias = await prisma.productCategory.findMany({
    orderBy: {
      order: "asc",
    },
  });

  // Obtener productos según el rol y filtro
  let productos;
  let negocios;

  if (role === "PROPIETARIO") {
    // El propietario solo ve productos de sus negocios
    if (params.negocioId) {
      // Filtrar por un negocio específico del propietario
      productos = await prisma.product.findMany({
        where: {
          businessId: params.negocioId,
          business: {
            ownerId: appUser.id,
          },
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      // Todos los productos de todos sus negocios
      productos = await prisma.product.findMany({
        where: {
          business: {
            ownerId: appUser.id,
          },
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Obtener negocios del propietario para el selector
    negocios = await prisma.business.findMany({
      where: {
        ownerId: appUser.id,
      },
      select: {
        id: true,
        name: true,
      },
    });
  } else {
    // ADMINISTRADOR ve todos los productos
    if (params.negocioId) {
      productos = await prisma.product.findMany({
        where: {
          businessId: params.negocioId,
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      productos = await prisma.product.findMany({
        include: {
          business: {
            select: {
              id: true,
              name: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Obtener todos los negocios para el selector
    negocios = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  // Serializar las fechas y procesar images
  const productosSerializados = productos.map((p) => ({
    ...p,
    images: p.images ? (p.images as string[]) : null,
    category: p.category || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <ProductosClient
      productos={productosSerializados}
      negocios={negocios}
      categorias={categorias}
      role={role}
      negocioIdFromUrl={params.negocioId}
    />
  );
}
