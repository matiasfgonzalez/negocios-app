import { prisma } from "@/lib/prisma";
import { ProductWithBusinessAndCategory } from "@/app/types/types";

export const productRepository = {
  async findAll() {
    return prisma.product.findMany({
      include: {
        business: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findByBusinessId(businessId: string): Promise<ProductWithBusinessAndCategory[]> {
    return prisma.product.findMany({
      where: {
        businessId,
      },
      include: {
        business: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }) as Promise<ProductWithBusinessAndCategory[]>;
  },
};
