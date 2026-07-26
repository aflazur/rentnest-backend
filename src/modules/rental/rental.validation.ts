import { z } from "zod";

const createRentalRequestZodSchema = z.object({
  body: z.object({
    propertyId: z.string({ required_error: "Property is required" }),
    moveInDate: z.coerce.date({ required_error: "Move-in date is required" }),
    message: z.string().optional(),
  }),
});

export const rentalValidation = {
  createRentalRequestZodSchema,
};