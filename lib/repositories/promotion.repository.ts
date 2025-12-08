import { prisma } from "@/lib/prisma";
import { PromotionWithProductsAndBusiness } from "@/app/types/types";

interface CreatePromotionData {
  businessId: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  stock?: number | null;
  products: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const promotionRepository = {
  async findMany(businessId?: string): Promise<PromotionWithProductsAndBusiness[]> {
    const where = businessId ? { businessId } : {};

    return prisma.promotion.findMany({
      where,
      include: {
        business: true,
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }) as Promise<PromotionWithProductsAndBusiness[]>;
  },

  async create(data: CreatePromotionData) {
    return prisma.promotion.create({
      data: {
        businessId: data.businessId,
        name: data.name,
        description: data.description,
        price: data.price,
        image: data.image,
        isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        stock: data.stock,
        products: {
          create: data.products.map((p) => ({
            productId: p.productId,
            quantity: p.quantity || 1,
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  },
};
