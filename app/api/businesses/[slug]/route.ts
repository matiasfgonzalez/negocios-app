import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type tParams = Promise<{ slug: string }>;
export async function GET(req: NextRequest, { params }: { params: tParams }) {
  try {
    const { slug } = await params;
    const business = await prisma.business.findUnique({
      where: { id: slug },
      include: {
        products: {
          where: { available: true },
          orderBy: { name: "asc" },
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: "Negocio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("Error fetching business:", error);
    return NextResponse.json(
      {
        error:
          "Error al obtener el negocio. Verifica la conexión a la base de datos.",
      },
      { status: 500 }
    );
  }
}
