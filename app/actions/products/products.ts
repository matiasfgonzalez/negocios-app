"use server";

import { productRepository } from "@/lib/repositories/product.repository";

/**
 * Obtiene todos los productos
 */
export async function getAllProducts() {
  try {
    return await productRepository.findAll();
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw new Error("Error al obtener productos");
  }
}

/**
 * Obtiene productos por ID de negocio
 */
export async function getProductsByBusinessId(businessId: string) {
  try {
    if (!businessId) {
      throw new Error("El ID del negocio es requerido");
    }

    // Espera 5 segundos
    await new Promise((resolve) => setTimeout(resolve, 5000));


    return await productRepository.findByBusinessId(businessId);
  } catch (error) {
    console.error("Error al obtener productos del negocio:", error);
    throw new Error("Error al obtener productos del negocio");
  }
}
