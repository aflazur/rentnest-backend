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

const createPropertyZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }).min(5).max(255),
        description: z.string({ required_error: "Description is required" }).min(20),
        price: z.number({ required_error: "Price is required" }).positive(),
        type: z.enum(["APARTMENT", "HOUSE", "STUDIO", "CONDO", "ROOM"], {
            required_error: "Property type is required",
        }),
        address: z.string({ required_error: "Address is required" }),
        city: z.string({ required_error: "City is required" }),
        area: z.string({ required_error: "Area is required" }),
        bedrooms: z.number({ required_error: "Bedrooms is required" }).int().nonnegative(),
        bathrooms: z.number({ required_error: "Bathrooms is required" }).int().nonnegative(),
        sizeSqft: z.number().int().positive().optional(),
        amenities: z.array(z.string()).optional().default([]),
        images: z.array(z.string()).optional().default([]),
        categoryId: z.string({ required_error: "Category is required" }),
    }),
});

const updatePropertyZodSchema = z.object({
    body: z.object({
        title: z.string().min(5).max(255).optional(),
        description: z.string().min(20).optional(),
        price: z.number().positive().optional(),
        type: z.enum(["APARTMENT", "HOUSE", "STUDIO", "CONDO", "ROOM"]).optional(),
        status: z.enum(["AVAILABLE", "UNAVAILABLE", "RENTED"]).optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        area: z.string().optional(),
        bedrooms: z.number().int().nonnegative().optional(),
        bathrooms: z.number().int().nonnegative().optional(),
        sizeSqft: z.number().int().positive().optional(),
        amenities: z.array(z.string()).optional(),
        images: z.array(z.string()).optional(),
        categoryId: z.string().optional(),
    }),
});

export const propertyValidation = {
    getAllPropertiesZodSchema,
    createPropertyZodSchema,
    updatePropertyZodSchema,
};