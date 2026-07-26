import { z } from "zod";

const getAllPropertiesZodSchema = z.object({
  query: z.object({
    searchTerm: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    type: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    bedrooms: z.string().optional(),
    categoryId: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.string().optional(),
  }),
});

export const propertyValidation = {
  getAllPropertiesZodSchema,
};