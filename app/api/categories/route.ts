import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categories - Obtener todas las categorías
export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: {
        order: "asc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }
}
