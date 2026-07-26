import { z } from "zod";

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Category name is required" }).min(2).max(100),
    description: z.string().optional(),
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
  }),
});

export const categoryValidation = {
  createCategoryZodSchema,
  updateCategoryZodSchema,
};