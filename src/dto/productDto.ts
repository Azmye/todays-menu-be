import { z } from "zod";

export const newProductDtoSchema = z.object({
  name: z.string({
    required_error: "Product name is required",
  }),
  price: z.string(),
});

export const productImageDtoSchema = z.object({
  previewImage: z.string(),
});

export const updateProductDtoSchema = newProductDtoSchema.partial().extend({
  discount: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type NewProductDto = z.infer<typeof newProductDtoSchema>;
export type ProductImageDto = z.infer<typeof productImageDtoSchema>;
export type UpdateProductDto = z.infer<typeof updateProductDtoSchema>;
