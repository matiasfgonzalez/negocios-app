"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PromotionWithProductsAndBusiness } from "@/app/types/types";
import { createPromotionSchema } from "@/lib/schemas/promotion";
import { promotionRepository } from "@/lib/repositories/promotion.repository";

export interface CreatePromotionState {
  success?: boolean;
  error?: string;
  data?: {
    id: string;
    name: string;
    price: number;
    businessId: string;
  };
}

export async function getPromotions(businessId?: string): Promise<PromotionWithProductsAndBusiness[]> {
  try {
    return await promotionRepository.findMany(businessId);
  } catch (error) {
    console.error("Error al obtener promociones:", error);
    throw new Error("Error al obtener promociones");
  }
}

export async function createPromotion(
  prevState: CreatePromotionState,
  formData: FormData
): Promise<CreatePromotionState> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "No autorizado",
      };
    }

    // Verificar rol del usuario
    const user = await prisma.appUser.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return {
        success: false,
        error: "Usuario no encontrado",
      };
    }

    // Solo ADMINISTRADOR y PROPIETARIO pueden crear promociones
    if (user.role !== "ADMINISTRADOR" && user.role !== "PROPIETARIO") {
      return {
        success: false,
        error: "No tiene permisos para crear promociones",
      };
    }

    // Extraer datos del FormData
    const productsJson = formData.get("products") as string;
    const rawData = {
      businessId: formData.get("businessId") as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string || null,
      price: parseFloat(formData.get("price") as string),
      image: formData.get("image") as string || null,
      isActive: formData.get("isActive") === "true",
      startDate: formData.get("startDate") as string || null,
      endDate: formData.get("endDate") as string || null,
      stock: formData.get("stock")
        ? parseInt(formData.get("stock") as string)
        : null,
      products: JSON.parse(productsJson || "[]"),
    };

    // Validar datos con Zod
    const validation = createPromotionSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    const { businessId, name, description, price, image, isActive, startDate, endDate, stock, products } = validation.data;

    // Verificar que el negocio existe
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      return {
        success: false,
        error: "Negocio no encontrado",
      };
    }

    // Si es PROPIETARIO, verificar que sea dueño del negocio
    if (user.role === "PROPIETARIO" && business.ownerId !== user.id) {
      return {
        success: false,
        error: "No tiene permisos para crear promociones en este negocio",
      };
    }

    // Verificar que todos los productos pertenecen al mismo negocio
    const productIds = products.map((p: { productId: string }) => p.productId);
    const productsFromDb = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: { id: true, businessId: true },
    });

    if (productsFromDb.length !== productIds.length) {
      return {
        success: false,
        error: "Algunos productos no existen",
      };
    }

    const allProductsFromSameBusiness = productsFromDb.every(
      (p: { businessId: string }) => p.businessId === businessId
    );

    if (!allProductsFromSameBusiness) {
      return {
        success: false,
        error: "Todos los productos deben pertenecer al mismo negocio",
      };
    }

    // Crear la promoción con sus productos
    const promotion = await promotionRepository.create({
      businessId,
      name,
      description,
      price,
      image,
      isActive,
      startDate,
      endDate,
      stock,
      products,
    });

    return {
      success: true,
      data: {
        id: promotion.id,
        name: promotion.name,
        price: promotion.price,
        businessId: promotion.businessId,
      },
    };
  } catch (error) {
    console.error("Error al crear promoción:", error);
    return {
      success: false,
      error: "Error al crear promoción",
    };
  }
}
