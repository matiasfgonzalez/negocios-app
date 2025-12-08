import { z } from "zod";

/**
 * Schema para validar la creación de una promoción
 */
export const createPromotionSchema = z.object({
  businessId: z.string().min(1, "El ID del negocio es requerido"),
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional()
    .nullable(),
  price: z
    .number({
      message: "El precio debe ser un número válido",
    })
    .positive("El precio debe ser mayor a 0")
    .finite("El precio debe ser un número válido"),
  image: z.string().url("Debe ser una URL válida").optional().nullable(),
  isActive: z.boolean().default(true),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Debe ser una fecha en formato YYYY-MM-DD")
    .optional()
    .nullable(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Debe ser una fecha en formato YYYY-MM-DD")
    .optional()
    .nullable(),
  stock: z
    .number()
    .int("El stock debe ser un número entero")
    .positive("El stock debe ser mayor a 0")
    .optional()
    .nullable(),
  products: z
    .array(
      z.object({
        productId: z.string().min(1, "El ID del producto es requerido"),
        quantity: z
          .number()
          .int("La cantidad debe ser un número entero")
          .positive("La cantidad debe ser mayor a 0")
          .default(1),
      })
    )
    .min(1, "Debe incluir al menos un producto en la promoción"),
}).refine(
  (data) => {
    // Si hay fecha de inicio y fin, validar que la fecha de fin sea posterior
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  }
);

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
